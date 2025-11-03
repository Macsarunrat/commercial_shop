from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.shop as crud_shop

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
        raise HTTPException(status_code=404, detail=str(e)) # User not found
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) # กัน Error (เช่น Shop_Name ซ้ำ)

@router.get("/{shop_id}", response_model=ShopReadWithAddress)
def read_shop(session: SessionDep, shop_id: int):
    """
    API: ดึงข้อมูลร้านค้า (พร้อมที่อยู่ ถ้ามี)
    """
    shop = crud_shop.get_shop(session, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop