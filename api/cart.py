from fastapi import APIRouter, Depends, HTTPException, status # 👈 เพิ่ม status
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.cart as crud_cart
from models.cart import CartItemPublic, CartAdd, CartRead, CartUpdate
from pydantic import BaseModel

# 1. 🔽 Import "ยาม" (CurrentUser) และ Model (User)
from security import get_current_user # (ตรวจสอบว่า path นี้ถูกต้อง)
from models.user import User

router = APIRouter(
    prefix="/cart",
    tags=["Cart (Protected)"] # 👈 เปลี่ยนชื่อ Tag 
)

SessionDep = Annotated[Session, Depends(get_session)]

# 2. 🔽 สร้าง Model ใหม่สำหรับ Body ตอน POST (ไม่รับ User_ID)
class CartAddItemBody(BaseModel):
    Sell_ID: int
    Quantity: int

class DeleteResponse(BaseModel):
    detail: str

# --- (Endpoint ทั้งหมดถูกแก้ไข) ---

@router.get("/", response_model=List[CartItemPublic])
def read_my_cart_items(
    session: SessionDep, 
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    API: ดึงสินค้าทั้งหมดในตะกร้า (ของฉัน)
    (ระบบจะรู้ User_ID จาก Token ที่ส่งมา)
    """
    try:
        # 4. 🔽 ใช้ ID จาก Token แทน
        cart_items = crud_cart.get_cart_items_by_user(session, current_user.User_ID)
        return cart_items
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/", response_model=CartRead)
def add_item_to_my_cart(
    session: SessionDep, 
    item_data: CartAddItemBody,     # 👈 5. ใช้ Body Model ใหม่ (ที่ไม่รับ User_ID)
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    API: เพิ่มสินค้าลงในตะกร้า (ของฉัน)
    - Body = { "Sell_ID": 1, "Quantity": 2 }
    """
    
    # 7. 🔽 สร้าง object CartAdd ขึ้นมาเอง โดยใช้ User_ID จาก Token
    cart_data_for_crud = CartAdd(
        User_ID=current_user.User_ID,
        Sell_ID=item_data.Sell_ID,
        Quantity=item_data.Quantity
    )
    
    try:
        cart_item = crud_cart.add_to_cart(session, cart_data_for_crud)
        return cart_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{sell_id}", response_model=CartRead)
def update_my_cart_item(
    session: SessionDep, 
    sell_id: int,                   # 👈 8. ลบ user_id ออกจาก Path
    cart_data: CartUpdate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    API: อัปเดตจำนวนสินค้าในตะกร้า (ของฉัน)
    Body = { "Quantity": 5 }
    """
    try:
        # 10. 🔽 ใช้ ID จาก Token
        updated_item = crud_cart.update_cart_item(
            session, current_user.User_ID, sell_id, cart_data
        )
        return updated_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{sell_id}", response_model=DeleteResponse)
def remove_my_cart_item(
    session: SessionDep, 
    sell_id: int,               # 👈 11. ลบ user_id ออกจาก Path
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    API: ลบสินค้าออกจากตะกร้า (ของฉัน)
    """
    try:
        # 13. 🔽 ใช้ ID จาก Token
        result = crud_cart.remove_cart_item(session, current_user.User_ID, sell_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))