from fastapi import APIRouter, Depends, HTTPException
from pymysql import IntegrityError
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.shop as crud_shop
from models.sell import Sell, SellCreate,SellItemCreate,SellRead

from models.shop import ShopCreate, ShopRead, ShopReadWithAddress 

router = APIRouter(
    prefix="/shop",
    tags=["Shop"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.post("/", response_model=ShopRead)
def create_new_shop(session: SessionDep, shop_data: ShopCreate):
    """
    API: 1. สร้างร้านค้าใหม่ (ยังไม่มีที่อยู่)
    Body = { "Shop_Name": "ร้านค้าทดสอบ", "Shop_Phone": "0812345678", "User_ID": 1 }
    """
    try:
        shop = crud_shop.create_shop(session, shop_data)
        return shop
    
    except ValueError as e:
        error_msg = str(e)
        
        # ⭐️ แยกแยะ Error เพื่อส่ง HTTP Status Code ที่ถูกต้อง
        if "not found" in error_msg:
            # ถ้า User ไม่มีตัวตน
            raise HTTPException(status_code=404, detail=error_msg)
        elif "already owns a shop" in error_msg:
            # ถ้า User มีร้านค้าอยู่แล้ว (Error จาก IntegrityError)
            raise HTTPException(status_code=409, detail=error_msg) # 409 Conflict
        else:
            raise HTTPException(status_code=400, detail=error_msg)
            
    except Exception as e:
        # ดัก Error อื่นๆ ที่ไม่คาดคิด
        raise HTTPException(status_code=400, detail=f"An unexpected error: {str(e)}")

@router.get("/{shop_id}", response_model=ShopReadWithAddress)
def read_shop(session: SessionDep, shop_id: int):
    """
    API: ดึงข้อมูลร้านค้า (พร้อมที่อยู่ ถ้ามี)
    """
    shop = crud_shop.get_shop(session, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop

@router.post("/{shop_id}/items", response_model=SellRead)
def create_shop_item(
    shop_id: int, 
    item_data: SellItemCreate, 
    session: SessionDep
):
    """
    API: 2. ร้านค้าเพิ่มสินค้า (ข้อมูล) เข้าร้าน
    - ระบบจะค้นหา Product กลาง
    - ถ้าไม่เจอ จะสร้าง Product ใหม่
    - สร้าง Sell item (ราคา, สต็อก) ผูกกับร้านค้า
    
    Body = {
        "Product_Name": "iPhone 15 Pro",
        "Category_ID": 8,
        "Brand_ID": 4,
        "Price": 41900.00,
        "Stock": 10
    }
    """
    try:
        sell_item = crud_shop.create_shop_product(
            db=session, 
            shop_id=shop_id, 
            item_data=item_data
        )
        
        # สร้าง response แบบกำหนดเอง (เพื่อให้ได้ Product_ID กลับไป)
        response_data = SellReadWithProduct(
            **sell_item.model_dump(),
            Product_ID=sell_item.Product_ID 
        )
        return response_data
    
    except ValueError as e: # Error จาก db.get
        raise HTTPException(status_code=404, detail=str(e))
    
    except IntegrityError as e: # Error จากการซ้ำ
        raise HTTPException(status_code=409, detail="Item already exists in this shop")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occurred: {str(e)}")