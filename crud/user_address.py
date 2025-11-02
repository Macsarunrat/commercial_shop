from sqlmodel import Session
from models.user_address import UserAddress, AddressCreate

def create_user_address(session: Session, address: AddressCreate, user_id: int) -> UserAddress:
    db_address = UserAddress.model_validate(address, update={"User_ID": user_id})
    session.add(db_address)
    session.commit()
    session.refresh(db_address)
    return db_address
