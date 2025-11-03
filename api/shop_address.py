from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.shop_address as crud_shop_addr
from models.shop_address import ShopAddressRead, ShopAddressCreate, ShopAddressUpdate
from pydantic import BaseModel

# Import "ยาม"
from security import get_current_user # (ตรวจสอบ path นี้)
from models.user import User

router = APIRouter(
    prefix="/shops/{shop_id}/address", # 👈 (ย้าย shop_id มาไว้ที่ prefix)
    tags=["Shop Address (Protected)"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]

class DeleteResponse(BaseModel):
    detail: str

@router.get("/", response_model=ShopAddressRead)
def get_my_shop_address(
    shop_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: ดึงที่อยู่ร้านค้า (ต้องเป็นเจ้าของร้าน)
    """
    try:
        address = crud_shop_addr.get_shop_address(session, shop_id, current_user.User_ID)
        if not address:
            raise HTTPException(status_code=404, detail="Address not found for this shop")
        return address
    except ValueError as e: # Shop not found
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: # ไม่ใช่เจ้าของ
        raise HTTPException(status_code=403, detail=str(e)) # 403 Forbidden

@router.post("/", response_model=ShopAddressRead)
def create_my_shop_address(
    shop_id: int,
    data: ShopAddressCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: สร้างที่อยู่ร้านค้า (ต้องเป็นเจ้าของร้าน)
    """
    try:
        address = crud_shop_addr.create_or_update_shop_address(
            session, shop_id, current_user.User_ID, data
        )
        return address
    except ValueError as e: # Shop not found
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: # ไม่ใช่เจ้าของ
        raise HTTPException(status_code=403, detail=str(e)) # 403 Forbidden

@router.put("/", response_model=ShopAddressRead)
def update_my_shop_address(
    shop_id: int,
    data: ShopAddressUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: อัปเดตที่อยู่ร้านค้า (ต้องเป็นเจ้าของร้าน)
    (ถ้าไม่มีที่อยู่ จะสร้างให้ใหม่)
    """
    try:
        address = crud_shop_addr.create_or_update_shop_address(
            session, shop_id, current_user.User_ID, data
        )
        return address
    except ValueError as e: # Shop not found
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: # ไม่ใช่เจ้าของ
        raise HTTPException(status_code=403, detail=str(e)) # 403 Forbidden

@router.delete("/", response_model=DeleteResponse)
def delete_my_shop_address(
    shop_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    API: ลบที่อยู่ร้านค้า (ต้องเป็นเจ้าของร้าน)
    """
    try:
        crud_shop_addr.delete_shop_address(session, shop_id, current_user.User_ID)
        return {"detail": "Shop address deleted successfully"}
    except ValueError as e: # Shop not found
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: # ไม่ใช่เจ้าของ
        raise HTTPException(status_code=403, detail=str(e)) # 403 Forbidden