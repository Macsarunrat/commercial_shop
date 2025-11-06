from sqlmodel import Session, select
from models.user_address import User_Address, UserAddressCreateBody, UserAddressUpdateBody
from typing import List

def get_addresses_by_user(db: Session, user_id: int) -> List[User_Address]:

    statement = select(User_Address).where(User_Address.User_ID == user_id)
    return db.exec(statement).all()

def create_user_address(db: Session, user_id: int, data: UserAddressCreateBody) -> User_Address:

    new_address = User_Address.model_validate(data, update={"User_ID": user_id})
    
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

def update_user_address(
    db: Session, 
    user_id: int, 
    address_id: int, 
    data: UserAddressUpdateBody
) -> User_Address | None:

    address = db.exec(
        select(User_Address).where(
            User_Address.User_Address_ID == address_id,
            User_Address.User_ID == user_id
        )
    ).first()

    if not address:
        raise ValueError("Address not found or not owned by user")
    
    address_data = data.model_dump(exclude_unset=True)
    for key, value in address_data.items():
        setattr(address, key, value)
        
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

def delete_user_address(db: Session, user_id: int, address_id: int) -> bool:

    address = db.exec(
        select(User_Address).where(
            User_Address.User_Address_ID == address_id,
            User_Address.User_ID == user_id
        )
    ).first()
    
    if not address:
        raise ValueError("Address not found or not owned by user")
        
    db.delete(address)
    db.commit()
    return True