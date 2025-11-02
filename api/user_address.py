from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from models.user_address import AddressRead, AddressCreate
from crud import user_address, user
from database import get_session

router = APIRouter()

@router.post("/users/{user_id}/addresses/", response_model=AddressRead, tags=["Addresses"])
def api_create_address_for_user(
    user_id: int,
    address: AddressCreate,
    session: Session = Depends(get_session)
):
    db_user = user.get_user_by_id(session, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user_address.create_user_address(session=session, address=address, user_id=user_id)
