from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.orders as crud_orders
from models.order import OrderSummary, OrderDetailsPublic # Import 2 schemas

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/user/{user_id}", response_model=List[OrderSummary])
def read_orders_for_user(session: SessionDep, user_id: int):
    """
    API: ดึง Order สรุปทั้งหมดของ User
    """
    try:
        orders = crud_orders.get_orders_by_user(session, user_id)
        if not orders:
            raise HTTPException(status_code=404, detail="No orders found for this user")
        return orders
    except ValueError as e:
        # กรณี User ID ไม่มีอยู่จริง (จาก crud)
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}", response_model=OrderDetailsPublic)
def read_order_details(session: SessionDep, order_id: int):
    """
    API: ดึงรายละเอียด Order 1 ใบ
    """
    try:
        order_details = crud_orders.get_order_details(session, order_id)
        if not order_details:
            raise HTTPException(status_code=404, detail="Order not found")
        return order_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")