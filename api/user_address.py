from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.user_address as crud_address
from models.user_address import UserAddressCreate, UserAddressRead

router = APIRouter(
    prefix="/user/address",
    tags=["User Address"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.post("/", response_model=UserAddressRead)
def add_address_to_user(
    session: SessionDep, 
    address_data: UserAddressCreate 
):
    try:
        address = crud_address.create_user_address(session, address_data)
        return address
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) # User not found
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=List[UserAddressRead])
def read_user_addresses(session: SessionDep, user_id: int):

    addresses = crud_address.get_addresses_by_user(session, user_id)
    if not addresses:
        raise HTTPException(status_code=404, detail="No addresses found for this user")
    return addresses