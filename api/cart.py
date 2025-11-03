from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.cart as crud_cart
from models.cart import CartItemPublic

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