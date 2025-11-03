from sqlmodel import Session, select
from models.shop import Shop # 👈 (ต้อง Import Shop)
from models.shop_address import Shop_Address, ShopAddressCreate, ShopAddressUpdate
from typing import Optional

def _check_shop_owner(db: Session, shop_id: int, user_id: int) -> Shop:
    """
    Helper Function: ตรวจสอบว่า User เป็นเจ้าของ Shop นี้หรือไม่
    - ถ้า Shop ไม่มี -> Raise ValueError
    - ถ้าไม่ใช่เจ้าของ -> Raise PermissionError
    """
    shop = db.get(Shop, shop_id)
    if not shop:
        raise ValueError(f"Shop with ID {shop_id} not found")
    if shop.User_ID != user_id:
        raise PermissionError("User is not authorized to manage this shop")
    return shop

def get_shop_address(db: Session, shop_id: int, user_id: int) -> Optional[Shop_Address]:
    """
    (API: GET) ดึงที่อยู่ร้าน (ต้องเป็นเจ้าของ)
    """
    # 1. ตรวจสอบสิทธิ์ (ถ้าไม่ผ่านจะ raise error)
    _check_shop_owner(db, shop_id, user_id)
    
    # 2. ดึงที่อยู่ (ถ้าผ่าน)
    statement = select(Shop_Address).where(Shop_Address.Shop_ID == shop_id)
    return db.exec(statement).first()

def create_or_update_shop_address(
    db: Session, 
    shop_id: int, 
    user_id: int, 
    data: ShopAddressCreate | ShopAddressUpdate
) -> Shop_Address:
    """
    (API: POST & PUT) สร้างหรืออัปเดตที่อยู่ร้าน (ต้องเป็นเจ้าของ)
    """
    # 1. ตรวจสอบสิทธิ์ (ถ้าไม่ผ่านจะ raise error)
    _check_shop_owner(db, shop_id, user_id)
    
    # 2. ค้นหาที่อยู่เดิม
    address = db.exec(
        select(Shop_Address).where(Shop_Address.Shop_ID == shop_id)
    ).first()
    
    address_data = data.model_dump(exclude_unset=True) # (เอาเฉพาะที่ส่งมา)

    if address:
        # 3a. ถ้ามี -> อัปเดต
        for key, value in address_data.items():
            setattr(address, key, value)
    else:
        # 3b. ถ้าไม่มี -> สร้างใหม่
        address = Shop_Address.model_validate(data, update={"Shop_ID": shop_id})
    
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

def delete_shop_address(db: Session, shop_id: int, user_id: int) -> bool:
    """
    (API: DELETE) ลบที่อยู่ (ต้องเป็นเจ้าของ)
    """
    # 1. ตรวจสอบสิทธิ์ (ถ้าไม่ผ่านจะ raise error)
    _check_shop_owner(db, shop_id, user_id)
        
    # 2. ค้นหาที่อยู่
    address = db.exec(
        select(Shop_Address).where(Shop_Address.Shop_ID == shop_id)
    ).first()
    
    if not address:
        # (ถ้าไม่มีที่อยู่ให้ลบ ก็ไม่เป็นไร)
        return True 
        
    # 3. ลบ
    db.delete(address)
    db.commit()
    return True