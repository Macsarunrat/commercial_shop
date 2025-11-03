from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.shop as crud_shop

# Import "ยาม"
from security import get_current_user
from models.user import User

# Import Models ที่อัปเดต
from models.shop import ShopCreate, ShopOrderDetails, ShopOrderSummary, ShopRead, ShopCreateBody 
from models.sell import SellItemCreate, SellRead

router = APIRouter(
    prefix="/shops", # 👈 (เปลี่ยนเป็น /shops พหูพจน์)
    tags=["Shop (Protected)"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("/", response_model=ShopRead)
def create_my_shop(
    shop_data: ShopCreateBody, # 👈 (ใช้ Body ที่ไม่มี User_ID)
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: 1. สร้างร้านค้าใหม่ (ของฉัน)
    (Body ไม่ต้องส่ง User_ID)
    """
    
    # 🔽 สร้าง object ShopCreate ขึ้นมาเอง
    full_shop_data = ShopCreate(
        Shop_Name=shop_data.Shop_Name,
        Shop_Phone=shop_data.Shop_Phone,
        User_ID=current_user.User_ID
    )
    
    try:
        shop = crud_shop.create_shop(session, full_shop_data)
        return shop
    
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail=error_msg)
        elif "already owns" in error_msg:
            raise HTTPException(status_code=409, detail=error_msg) # 409 Conflict
        else:
            raise HTTPException(status_code=400, detail=error_msg)


@router.post("/{shop_id}/items", response_model=SellRead)
def add_item_to_my_shop(
    shop_id: int, 
    item_data: SellItemCreate, 
    session: SessionDep,
    current_user: CurrentUser # 👈 (เพิ่ม "ยาม")
):
    """
    API: 2. เพิ่มสินค้า (ข้อมูล) เข้าร้าน (ต้องเป็นเจ้าของร้าน)
    """
    try:
        sell_item = crud_shop.create_shop_product(
            db=session, 
            shop_id=shop_id, 
            item_data=item_data,
            current_user_id=current_user.User_ID # 👈 (ส่ง ID ของเจ้าของไปเช็ค)
        )
        return sell_item
    
    except ValueError as e: 
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail=error_msg) # Shop not found
        if "already exists" in error_msg:
            raise HTTPException(status_code=409, detail=error_msg) # Item exists
        else:
            raise HTTPException(status_code=400, detail=error_msg)
            
    except PermissionError as e:
        # ⭐️ ดักจับ Error ที่เรา raise จาก CRUD
        raise HTTPException(status_code=403, detail=str(e)) # 403 Forbidden
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    

@router.get("/my/orders", response_model=List[ShopOrderSummary]) # 👈 (เปลี่ยน Response)
def get_my_shop_orders(
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: (เจ้าของร้าน) ดึงรายการออเดอร์ (แบบสรุป)
    """
    if not current_user.shops:
        raise HTTPException(status_code=404, detail="User does not own a shop")
        
    my_shop_id = current_user.shops.Shop_ID
    
    try:
        orders = crud_shop.get_orders_for_shop(session, my_shop_id) # 👈 (CRUD ถูกอัปเดตแล้ว)
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔽 --- 2. (เพิ่ม) Endpoint (ละเอียด) --- 🔽
@router.get("/my/orders/{order_id}", response_model=ShopOrderDetails)
def get_my_shop_order_details(
    order_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: (เจ้าของร้าน) ดึงรายละเอียด Order 1 ใบ
    (เฉพาะสินค้าของร้านตัวเอง พร้อมชื่อลูกค้า)
    """
    
    if not current_user.shops:
        raise HTTPException(status_code=404, detail="User does not own a shop")
        
    my_shop_id = current_user.shops.Shop_ID
    
    try:
        order_details = crud_shop.get_order_details_for_shop(
            session, 
            order_id=order_id, 
            shop_id=my_shop_id
        )
        return order_details
        
    except ValueError as e: # Order not found
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: # Order นี้ไม่มีของจากร้านเรา
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))