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
    # 1. ตรวจสอบว่า User ที่ส่งมา มีตัวตนจริง
    user = db.get(User, shop_data.User_ID)
    if not user:
        raise ValueError(f"User with ID {shop_data.User_ID} not found")
        
    # 2. สร้าง object แต่ยังไม่ commit
    new_shop = Shop.model_validate(shop_data)
    db.add(new_shop)
    
    try:
        # 3. พยายาม commit
        db.commit() # ⭐️ ถ้า User_ID ซ้ำ, Error จะเกิดที่นี่
        db.refresh(new_shop)
        return new_shop
    except IntegrityError:
        # 4. ถ้าเกิด Error (เช่น unique ซ้ำ) ให้ rollback
        db.rollback()
        # ⭐️ ส่ง Error นี้กลับไปให้ API layer
        raise ValueError(f"User {shop_data.User_ID} already owns a shop")
    except Exception as e:
        db.rollback()
        raise e

def get_shop(db: Session, shop_id: int) -> Shop | None:
    """
    ดึงข้อมูลร้านค้า (พร้อมที่อยู่ ถ้ามี)
    """
    statement = select(Shop).where(Shop.Shop_ID == shop_id).options(joinedload(Shop.address))
    return db.exec(statement).first()
# 🔽 --- นี่คือฟังก์ชันที่ต้องเช็ค Authorization --- 🔽
def create_shop_product(
    db: Session, 
    shop_id: int, 
    item_data: SellItemCreate, 
    current_user_id: int # 👈 (รับ ID เจ้าของจาก Token)
) -> Sell:
    
    # 1. ⭐️ Authorization Check: ตรวจสอบว่า Shop มีอยู่จริง และ User เป็นเจ้าของ
    db_shop = db.get(Shop, shop_id)
    if not db_shop:
        raise ValueError(f"Shop with ID {shop_id} not found")
    if db_shop.User_ID != current_user_id:
        raise PermissionError("User is not authorized to manage this shop")
        
    # 2. (โค้ดเดิมของคุณ) ค้นหา Product ในแคตตาล็อกกลาง
    statement = select(Products).where(
        Products.Product_Name == item_data.Product_Name,
        Products.Brand_ID == item_data.Brand_ID,
        Products.Category_ID == item_data.Category_ID
    )
    product = db.exec(statement).first()

    # 3. (โค้ดเดิม) ถ้าไม่พบ Product, ให้สร้างใหม่
    if not product:
        product_data = ProductCreate(
            Product_Name=item_data.Product_Name,
            Category_ID=item_data.Category_ID,
            Brand_ID=item_data.Brand_ID
        )
        product = Products.model_validate(product_data)
        db.add(product)
        db.flush() 
        db.refresh(product) 

    # 4. (โค้ดเดิม) ตรวจสอบว่าร้านนี้เคยวางขายสินค้านี้แล้วหรือยัง
    statement_sell = select(Sell).where(
        Sell.Shop_ID == shop_id,
        Sell.Product_ID == product.Product_ID
    )
    existing_sell = db.exec(statement_sell).first()
    
    if existing_sell:
        raise ValueError("Item already exists in this shop")

    # 5. (โค้ดเดิม) สร้างรายการ Sell
    sell_data = SellCreate(
        Price=item_data.Price,
        Stock=item_data.Stock,
        Shop_ID=shop_id,
        Product_ID=product.Product_ID
    )
    new_sell_item = Sell.model_validate(sell_data)
    
    db.add(new_sell_item)
    db.commit()
    db.refresh(new_sell_item)
    return new_sell_item