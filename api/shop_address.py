from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.shop_address as crud_address
# vvvv Import Schema ที่เราเตรียมไว้ vvvv
from models.shop_address import ShopAddressForm, ShopAddressRead

router = APIRouter(
    prefix="/shop/address",
    tags=["Shop Address"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.post("/{shop_id}", response_model=ShopAddressRead)
def add_address_to_shop(
    session: SessionDep, 
    shop_id: int, 
    address_data: ShopAddressForm # <-- ใช้ Form ที่ไม่มี Shop_ID
):
    """
    API: 2. เพิ่มที่อยู่ให้กับร้านค้า (Shop_ID มาจาก URL)
    Body = { "Province": "กรุงเทพ", "Amphur": "บางกะปิ", ... }
    """
    try:
        address = crud_address.create_shop_address(session, shop_id, address_data)
        return address
    except ValueError as e:
        # ดัก Error (Shop not found or address exists)
        raise HTTPException(status_code=400, detail=str(e)) 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))