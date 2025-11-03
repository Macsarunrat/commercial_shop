from sqlmodel import Session, select
from models.shop import Shop, ShopCreate
from models.user import User

def create_shop(db: Session, shop_data: ShopCreate) -> Shop:
    """
    สร้างร้านค้าใหม่ (Shop) - (ยังไม่มีที่อยู่)
    """
    user = db.get(User, shop_data.User_ID)
    if not user:
        raise ValueError(f"User with ID {shop_data.User_ID} not found")
        
    new_shop = Shop.model_validate(shop_data)
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)
    return new_shop

def get_shop(db: Session, shop_id: int) -> Shop | None:
    """
    ดึงข้อมูลร้านค้า (พร้อมที่อยู่ ถ้ามี)
    """
    statement = select(Shop).where(Shop.Shop_ID == shop_id).options(joinedload(Shop.address))
    return db.exec(statement).first()