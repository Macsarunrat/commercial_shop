from fastapi import APIRouter, Depends, HTTPException, status 
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.cart as crud_cart
from models.cart import CartItemPublic, CartAdd, CartRead, CartUpdate
from pydantic import BaseModel

from security import get_current_user
from models.user import User

router = APIRouter(
    prefix="/cart",
    tags=["Cart (Protected)"] 
)

SessionDep = Annotated[Session, Depends(get_session)]

class CartAddItemBody(BaseModel):
    Sell_ID: int
    Quantity: int

class DeleteResponse(BaseModel):
    detail: str

@router.get("/", response_model=List[CartItemPublic])
def read_my_cart_items(
    session: SessionDep, 
    current_user: Annotated[User, Depends(get_current_user)]
):

    try:
        cart_items = crud_cart.get_cart_items_by_user(session, current_user.User_ID)
        return cart_items
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/", response_model=CartRead)
def add_item_to_my_cart(
    session: SessionDep, 
    item_data: CartAddItemBody,   
    current_user: Annotated[User, Depends(get_current_user)]
):

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
    sell_id: int,               
    cart_data: CartUpdate,
    current_user: Annotated[User, Depends(get_current_user)]
):

    try:
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
    sell_id: int,        
    current_user: Annotated[User, Depends(get_current_user)]
):

    try:
        result = crud_cart.remove_cart_item(session, current_user.User_ID, sell_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))