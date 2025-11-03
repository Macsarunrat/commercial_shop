from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.cart as crud_cart
from models.cart import CartItemPublic, CartAdd, CartRead, CartUpdate
from pydantic import BaseModel

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/{user_id}", response_model=List[CartItemPublic])
def read_cart_items(session: SessionDep, user_id: int):
    """
    API: ดึงสินค้าทั้งหมดในตะกร้าของ User
    """
    try:
        cart_items = crud_cart.get_cart_items_by_user(session, user_id)
        return cart_items
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/", response_model=CartRead)
def add_item_to_cart(session: SessionDep, cart_data: CartAdd):
    """
    API: เพิ่มสินค้าลงในตะกร้า
    - ถ้ามีอยู่แล้ว จะบวกจำนวน
    - ถ้าไม่มี จะสร้างใหม่
    - Body = { "User_ID": 1, "Sell_ID": 1, "Quantity": 2 }
    """
    try:
        cart_item = crud_cart.add_to_cart(session, cart_data)
        return cart_item
    except ValueError as e:
        # ดักจับ Error ที่เรา raise ไว้ใน crud (เช่น Stock ไม่พอ)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DeleteResponse(BaseModel):
    detail: str

@router.put("/{user_id}/{sell_id}", response_model=CartRead)
def update_item_in_cart(
    session: SessionDep, 
    user_id: int, 
    sell_id: int, 
    cart_data: CartUpdate
):
    """
    API: อัปเดตจำนวนสินค้าในตะกร้า (ตั้งค่าเป็นจำนวนใหม่)
    Body = { "Quantity": 5 }
    """
    try:
        updated_item = crud_cart.update_cart_item(session, user_id, sell_id, cart_data)
        return updated_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/{sell_id}", response_model=DeleteResponse)
def remove_item_from_cart(session: SessionDep, user_id: int, sell_id: int):
    """
    API: ลบสินค้าออกจากตะกร้า
    """
    try:
        result = crud_cart.remove_cart_item(session, user_id, sell_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))