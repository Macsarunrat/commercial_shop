from sqlmodel import Session, select
from models.user_address import User_Address, UserAddressCreate
from models.user import User

def create_user_address(db: Session, address_data: UserAddressCreate) -> User_Address:
    user = db.get(User, address_data.User_ID)
    if not user:
        raise ValueError(f"User with ID {address_data.User_ID} not found")
        
    new_address = User_Address.model_validate(address_data)
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

def get_addresses_by_user(db: Session, user_id: int) -> list[User_Address]:
    statement = select(User_Address).where(User_Address.User_ID == user_id)
    addresses = db.exec(statement).all()
    return addresses