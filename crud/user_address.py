# (ในไฟล์ crud/user_address.py)

from sqlmodel import Session, select
from models.user_address import User_Address, UserAddressCreateBody, UserAddressUpdateBody
from typing import List

def get_addresses_by_user(db: Session, user_id: int) -> List[User_Address]:
    """
    (API: GET /me) ดึงที่อยู่ทั้งหมดของ User ที่ Login
    """
    statement = select(User_Address).where(User_Address.User_ID == user_id)
    return db.exec(statement).all()

def create_user_address(db: Session, user_id: int, data: UserAddressCreateBody) -> User_Address:
    """
    (API: POST /) สร้างที่อยู่ใหม่สำหรับ User ที่ Login
    """
    # สร้าง object โดยผสม User_ID จาก Token
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
    """
    (API: PUT /{id}) อัปเดตที่อยู่ (ต้องเช็คว่าเป็นเจ้าของ)
    """
    # 1. ⭐️ Authorization Check: ค้นหาที่อยู่ + เช็คว่าเป็นของ User นี้
    address = db.exec(
        select(User_Address).where(
            User_Address.User_Address_ID == address_id,
            User_Address.User_ID == user_id
        )
    ).first()

    if not address:
        # ไม่พบ หรือ ไม่ใช่เจ้าของ
        raise ValueError("Address not found or not owned by user")
    
    # 2. อัปเดต Fields
    address_data = data.model_dump(exclude_unset=True)
    for key, value in address_data.items():
        setattr(address, key, value)
        
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

def delete_user_address(db: Session, user_id: int, address_id: int) -> bool:
    """
    (API: DELETE /{id}) ลบที่อยู่ (ต้องเช็คว่าเป็นเจ้าของ)
    """
    # 1. ⭐️ Authorization Check
    address = db.exec(
        select(User_Address).where(
            User_Address.User_Address_ID == address_id,
            User_Address.User_ID == user_id
        )
    ).first()
    
    if not address:
        raise ValueError("Address not found or not owned by user")
        
    # 2. ลบ
    db.delete(address)
    db.commit()
    return True