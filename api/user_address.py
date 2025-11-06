from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.user_address as crud_address
from models.user_address import UserAddressRead, UserAddressCreateBody, UserAddressUpdateBody
from pydantic import BaseModel

from security import get_current_user
from models.user import User

router = APIRouter(
    prefix="/user-address",
    tags=["User Address (Protected)"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]

class DeleteResponse(BaseModel):
    detail: str

@router.get("/me", response_model=List[UserAddressRead])
def get_my_addresses(
    session: SessionDep,
    current_user: CurrentUser
):

    return crud_address.get_addresses_by_user(session, current_user.User_ID)

@router.post("/", response_model=UserAddressRead)
def create_my_address(
    data: UserAddressCreateBody,
    session: SessionDep,
    current_user: CurrentUser
):

    return crud_address.create_user_address(session, current_user.User_ID, data)

@router.put("/{address_id}", response_model=UserAddressRead)
def update_my_address(
    address_id: int,
    data: UserAddressUpdateBody,
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        updated = crud_address.update_user_address(session, current_user.User_ID, address_id, data)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) # 404 Not Found

@router.delete("/{address_id}", response_model=DeleteResponse)
def delete_my_address(
    address_id: int,
    session: SessionDep,
    current_user: CurrentUser
):

    try:
        crud_address.delete_user_address(session, current_user.User_ID, address_id)
        return {"detail": "Address deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) # 404 Not Found