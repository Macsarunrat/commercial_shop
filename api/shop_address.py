from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.shop_address as crud_shop_addr
from models.shop_address import ShopAddressRead, ShopAddressCreate, ShopAddressUpdate
from pydantic import BaseModel

from security import get_current_user
from models.user import User

router = APIRouter(
    prefix="/shops/{shop_id}/address", 
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

    try:
        address = crud_shop_addr.get_shop_address(session, shop_id, current_user.User_ID)
        if not address:
            raise HTTPException(status_code=404, detail="Address not found for this shop")
        return address
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/", response_model=ShopAddressRead)
def create_my_shop_address(
    shop_id: int,
    data: ShopAddressCreate,
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        address = crud_shop_addr.create_or_update_shop_address(
            session, shop_id, current_user.User_ID, data
        )
        return address
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: 
        raise HTTPException(status_code=403, detail=str(e)) 

@router.put("/", response_model=ShopAddressRead)
def update_my_shop_address(
    shop_id: int,
    data: ShopAddressUpdate,
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        address = crud_shop_addr.create_or_update_shop_address(
            session, shop_id, current_user.User_ID, data
        )
        return address
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: 
        raise HTTPException(status_code=403, detail=str(e)) 

@router.delete("/", response_model=DeleteResponse)
def delete_my_shop_address(
    shop_id: int,
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        crud_shop_addr.delete_shop_address(session, shop_id, current_user.User_ID)
        return {"detail": "Shop address deleted successfully"}
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) 