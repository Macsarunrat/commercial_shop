from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.orders as crud_order 

from security import get_current_user
from models.user import User
from models.order import OrderSummary, OrderDetailsPublic, OrderCheckoutRequest, Order

router = APIRouter(
    prefix="/orders",
    tags=["Orders (Protected)"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]

@router.get("/me", response_model=List[OrderSummary])
def get_my_orders(
    session: SessionDep,
    current_user: CurrentUser
):

    orders = crud_order.get_orders_by_user(session, current_user.User_ID)
    return orders

@router.get("/{order_id}", response_model=OrderDetailsPublic)
def get_my_order_details(
    order_id: int,
    session: SessionDep,
    current_user: CurrentUser
):

    details = crud_order.get_order_details_for_user(
        db=session, 
        order_id=order_id, 
        user_id=current_user.User_ID
    )
    
    if not details:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return details

@router.post("/checkout", response_model=OrderSummary)
def checkout_my_cart(
    checkout_body: OrderCheckoutRequest, 
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        new_order = crud_order.create_order_from_cart(
            db=session,
            user_id=current_user.User_ID,
            checkout_data=checkout_body
        )
        return OrderSummary.model_validate(new_order)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    

@router.post("/{order_id}/confirm_payment", response_model=OrderSummary)
def confirm_simulated_payment(
    order_id: int,
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        updated_order = crud_order.mark_order_as_paid(
            db=session,
            order_id=order_id,
            user_id=current_user.User_ID
        )
        return OrderSummary.model_validate(updated_order)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error: {str(e)}")