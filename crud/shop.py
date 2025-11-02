from sqlmodel import Session, select
from models.shop import Shop, ShopCreate, ShopUpdate
from typing import Optional

def create_shop(session: Session, shop: ShopCreate) -> Shop:
    db_shop = Shop.model_validate(shop)
    session.add(db_shop)
    session.commit()
    session.refresh(db_shop)
    return db_shop

def update_shop(session: Session, shop_id: int, shop_update: ShopUpdate) -> Optional[Shop]:
    db_shop = session.get(Shop, shop_id)
    if not db_shop:
        return None
    update_data = shop_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_shop, key, value)
    session.add(db_shop)
    session.commit()
    session.refresh(db_shop)
    return db_shop

def delete_shop(session: Session, shop_id: int) -> Optional[Shop]:
    db_shop = session.get(Shop, shop_id)
    if not db_shop:
        return None
    session.delete(db_shop)
    session.commit()
    return db_shop

def get_shop_by_user_id(session: Session, user_id: int) -> Optional[Shop]:
    statement = select(Shop).where(Shop.User_ID == user_id)
    return session.exec(statement).first()
