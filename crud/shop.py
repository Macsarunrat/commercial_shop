from pymysql import IntegrityError
from sqlmodel import Session, select
from models.shop import Shop, ShopCreate
from models.user import User
from models.sell import Sell, SellCreate, SellItemCreate
from models.products import Products, ProductCreate
from sqlalchemy.orm import joinedload

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

def create_shop_product(db: Session, shop_id: int, item_data: SellItemCreate) -> Sell:
    """
    สร้างรายการขาย (Sell) ใหม่สำหรับร้านค้า
    1. ค้นหา Product กลาง ถ้าไม่มี ให้สร้างใหม่
    2. สร้าง Sell item โดยเชื่อมกับ Shop_ID และ Product_ID
    """
    
    # 1. ตรวจสอบว่า Shop มีอยู่จริง
    db_shop = db.get(Shop, shop_id)
    if not db_shop:
        raise ValueError(f"Shop with ID {shop_id} not found")

    # 2. ค้นหา Product ในแคตตาล็อกกลาง
    statement = select(Products).where(
        Products.Product_Name == item_data.Product_Name,
        Products.Brand_ID == item_data.Brand_ID,
        Products.Category_ID == item_data.Category_ID
    )
    product = db.exec(statement).first()

    # 3. ถ้าไม่พบ Product, ให้สร้างใหม่
    if not product:
        product_data = ProductCreate(
            Product_Name=item_data.Product_Name,
            Category_ID=item_data.Category_ID,
            Brand_ID=item_data.Brand_ID
        )
        product = Products.model_validate(product_data)
        db.add(product)
        # เราจะ commit พร้อมกันทีหลัง
        # db.commit()
        # db.refresh(product)
        
        # ต้อง flush เพื่อให้ได้ Product_ID มาใช้ก่อน commit จริง
        db.flush() 
        db.refresh(product) 


    # 4. ตรวจสอบว่าร้านนี้เคยวางขายสินค้านี้แล้วหรือยัง (ป้องกันการซ้ำ)
    statement_sell = select(Sell).where(
        Sell.Shop_ID == shop_id,
        Sell.Product_ID == product.Product_ID
    )
    existing_sell = db.exec(statement_sell).first()
    
    if existing_sell:
        raise IntegrityError("Item already exists in this shop", params=None, orig=None)

    # 5. สร้างรายการ Sell (ป้ายราคา)
    sell_data = SellCreate(
        Price=item_data.Price,
        Stock=item_data.Stock,
        Shop_ID=shop_id,
        Product_ID=product.Product_ID
    )
    new_sell_item = Sell.model_validate(sell_data)
    
    try:
        db.add(new_sell_item)
        db.commit()
        db.refresh(new_sell_item)
        return new_sell_item
    except IntegrityError as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise e