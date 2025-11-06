from sqlmodel import Session, select
from models.shop import Shop
from models.shop_address import Shop_Address, ShopAddressCreate, ShopAddressUpdate
from typing import Optional

def _check_shop_owner(db: Session, shop_id: int, user_id: int) -> Shop:

    shop = db.get(Shop, shop_id)
    if not shop:
        raise ValueError(f"Shop with ID {shop_id} not found")
    if shop.User_ID != user_id:
        raise PermissionError("User is not authorized to manage this shop")
    return shop

def get_shop_address(db: Session, shop_id: int, user_id: int) -> Optional[Shop_Address]:

    _check_shop_owner(db, shop_id, user_id)
    
    statement = select(Shop_Address).where(Shop_Address.Shop_ID == shop_id)
    return db.exec(statement).first()

def create_or_update_shop_address(
    db: Session, 
    shop_id: int, 
    user_id: int, 
    data: ShopAddressCreate | ShopAddressUpdate
) -> Shop_Address:

    _check_shop_owner(db, shop_id, user_id)
    
    address = db.exec(
        select(Shop_Address).where(Shop_Address.Shop_ID == shop_id)
    ).first()
    
    address_data = data.model_dump(exclude_unset=True) 

    if address:
        for key, value in address_data.items():
            setattr(address, key, value)
    else:
        address = Shop_Address.model_validate(data, update={"Shop_ID": shop_id})
    
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

def delete_shop_address(db: Session, shop_id: int, user_id: int) -> bool:

    _check_shop_owner(db, shop_id, user_id)
        
    address = db.exec(
        select(Shop_Address).where(Shop_Address.Shop_ID == shop_id)
    ).first()
    
    if not address:
        return True 
        
    db.delete(address)
    db.commit()
    return True