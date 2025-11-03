from sqlmodel import Session, select
from models.sell import Sell, SellCreate
from models.shop import Shop
from models.products import Products

def create_sell_item(db: Session, sell_data: SellCreate) -> Sell:
    
    shop = db.get(Shop, sell_data.Shop_ID)
    if not shop:
        raise ValueError(f"Shop with ID {sell_data.Shop_ID} not found")

    product = db.get(Products, sell_data.Product_ID)
    if not product:
        raise ValueError(f"Product with ID {sell_data.Product_ID} not found")

    statement = select(Sell).where(
        Sell.Shop_ID == sell_data.Shop_ID,
        Sell.Product_ID == sell_data.Product_ID
    )
    existing_sell = db.exec(statement).first()
    if existing_sell:
        raise ValueError(f"This shop already sells this product. (Sell_ID: {existing_sell.Sell_ID})")

    # 4. สร้าง Sell item
    new_sell_item = Sell.model_validate(sell_data)
    db.add(new_sell_item)
    db.commit()
    db.refresh(new_sell_item)
    return new_sell_item

def get_sell_item(db: Session, sell_id: int) -> Sell | None:

    return db.get(Sell, sell_id)