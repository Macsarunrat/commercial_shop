from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.orders as crud_order 

# 🔽 Import "ยาม" และ Models ที่จำเป็น
from security import get_current_user
from models.user import User
from models.order import OrderSummary, OrderDetailsPublic, OrderCheckoutRequest, Order

router = APIRouter(
    prefix="/orders",
    tags=["Orders (Protected)"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]

# 1. API: ดูประวัติการสั่งซื้อ (ของฉัน)
@router.get("/me", response_model=List[OrderSummary])
def get_my_orders(
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: ดึงประวัติการสั่งซื้อทั้งหมด (ของฉัน)
    (Token จะบอกว่า 'ฉัน' คือใคร)
    """
    orders = crud_order.get_orders_by_user(session, current_user.User_ID)
    return orders

# 2. API: ดูรายละเอียด Order (ของฉัน)
@router.get("/{order_id}", response_model=OrderDetailsPublic)
def get_my_order_details(
    order_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: ดึงรายละเอียด Order 1 ใบ (ต้องเป็นของฉันเท่านั้น)
    """
    details = crud_order.get_order_details_for_user(
        db=session, 
        order_id=order_id, 
        user_id=current_user.User_ID
    )
    
    if not details:
        # ถ้า order_id นี้ไม่มี หรือ เป็นของคนอื่น
        raise HTTPException(status_code=404, detail="Order not found")
        
    return details

# 3. API: ยืนยันการสั่งซื้อ (Checkout)
@router.post("/checkout", response_model=OrderSummary)
def checkout_my_cart(
    checkout_body: OrderCheckoutRequest, # 👈 (ใช้ Model ที่ไม่มี User_ID)
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: ยืนยันการสั่งซื้อ (Checkout)
    - ย้ายของจาก Cart -> Order
    - ตัด Stock
    - ล้าง Cart
    (Body ไม่ต้องส่ง User_ID, ระบบจะดึงจาก Token)
    """
    try:
        new_order = crud_order.create_order_from_cart(
            db=session,
            user_id=current_user.User_ID,
            checkout_data=checkout_body
        )
        # ส่ง Order สรุปกลับไป
        return OrderSummary.model_validate(new_order)
        
    except ValueError as e:
        # (ดัก Error จาก CRUD เช่น Cart is empty, Not enough stock)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")