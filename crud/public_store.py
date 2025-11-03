from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List

# import models ที่เราจะ join ทั้งหมด
from models.sell import Sell
from models.products import Products
from models.images import Image
from models.sell import ItemPublic
from models.shop import Shop, ShopPublicCard # <--- Import Schema ใหม่จาก models.sell
from models.brand import Brand, BrandRead # 👈 1. เพิ่ม Brand, BrandRead
from sqlalchemy import distinct # 👈 2. เพิ่ม distinct

def _map_to_public(sell_item: Sell) -> ItemPublic:
    """Helper function ช่วยแปลงข้อมูล Sell -> ItemPublic"""
    
    # หา รูป IsCover = True (ถ้ามี)
    cover_img = next(
        (img.Img_Src for img in sell_item.product_details.images if img.IsCover), 
        None
    )
    
    return ItemPublic(
        Sell_ID=sell_item.Sell_ID,
        Product_Name=sell_item.product_details.Product_Name,
        Price=sell_item.Price,
        Stock=sell_item.Stock,
        Shop_ID=sell_item.Shop_ID,
        Cover_Image=cover_img
    )

# def get_items_by_category(db: Session, category_id: int) -> List[ItemPublic]:
#     """
#     ดึงสินค้าที่วางขาย (Sell) ทั้งหมดตาม Category ID
#     """
#     statement = (
#         select(Sell)
#         .join(Products, Sell.Product_ID == Products.Product_ID) # Join Sell -> Products
#         .where(Products.Category_ID == category_id)
#         .options(
#             joinedload(Sell.product_details) # Eager load Products
#             .joinedload(Products.images)     # Eager load Images (ที่ผูกกับ Products)
#         )
#     )
#     items_for_sale = db.exec(statement).unique().all()
    
#     # แปลงร่างเป็น Schema ที่ Frontend ต้องการ
#     return [_map_to_public(item) for item in items_for_sale]

# def get_items_by_brand(db: Session, brand_id: int) -> List[ItemPublic]:
#     """
#     ดึงสินค้าที่วางขาย (Sell) ทั้งหมดตาม Brand ID
#     """
#     statement = (
#         select(Sell)
#         .join(Products, Sell.Product_ID == Products.Product_ID) # Join Sell -> Products
#         .where(Products.Brand_ID == brand_id)
#         .options(
#             joinedload(Sell.product_details) # Eager load Products
#             .joinedload(Products.images)     # Eager load Images
#         )
#     )
#     items_for_sale = db.exec(statement).unique().all()
#     return [_map_to_public(item) for item in items_for_sale]

def get_items_by_shop(db: Session, shop_id: int) -> List[ItemPublic]:
    """
    ดึงสินค้าที่วางขาย (Sell) ทั้งหมดตาม Shop ID
    """
    statement = (
        select(Sell)
        .where(Sell.Shop_ID == shop_id) # กรองจากตาราง Sell โดยตรง
        .options(
            joinedload(Sell.product_details) # Eager load Products
            .joinedload(Products.images)     # Eager load Images
        )
    )
    items_for_sale = db.exec(statement).unique().all()
    return [_map_to_public(item) for item in items_for_sale]


#Select by category and brand and Search
def get_sell_items_by_filters(
    db: Session, 
    category_id: int | None = None, 
    brand_id: int | None = None,
    search_term: str | None = None  # 👈 1. เพิ่มพารามิเตอร์สำหรับคำค้นหา
) -> List[ItemPublic]:
    """
    ดึงรายการสินค้าที่วางขาย (Sell) โดยกรองตาม Category, Brand, และ Search
    """
    
    statement = select(Sell)

    # (Eager load เหมือนเดิม)
    statement = statement.options(
        joinedload(Sell.shop),
        joinedload(Sell.product_details).options(
            joinedload(Products.images),
            joinedload(Products.brand),
            joinedload(Products.category)
        )
    )

    # 2. อัปเดตเงื่อนไขการ JOIN (ถ้ามีการกรอง 3 อย่างนี้ ต้อง Join Products)
    needs_product_join = category_id or brand_id or search_term
    if needs_product_join:
        statement = statement.join(Products, Sell.Product_ID == Products.Product_ID)
    
    # 3. เพิ่มเงื่อนไข WHERE
    if category_id:
        statement = statement.where(Products.Category_ID == category_id)
        
    if brand_id:
        statement = statement.where(Products.Brand_ID == brand_id)
        
    if search_term:
        # 4. ⭐️ นี่คือลอจิก LIKE ที่คุณต้องการ ⭐️
        # .ilike() คือ "LIKE" ที่ไม่สนตัวพิมพ์เล็ก/ใหญ่ (case-insensitive)
        search_pattern = f"%{search_term}%"
        statement = statement.where(Products.Product_Name.ilike(search_pattern))

    results = db.exec(statement).unique().all()
    
    return [_map_to_public(item) for item in results]

def get_all_shops_public(db: Session) -> List[ShopPublicCard]:
    """
    (API: GET /store/shops)
    ดึงข้อมูลร้านค้าทั้งหมด (แบบย่อ) สำหรับแสดงผล Card UI
    """
    
    statement = (
        select(Shop)
        .options(joinedload(Shop.cover_image)) 
    )
    
    shops = db.exec(statement).all()
    
    # แปลงข้อมูล (Mapping) ให้อยู่ในรูป ShopPublicCard
    shop_cards = []
    for shop in shops:
        img_url = None
        if shop.cover_image:
            img_url = shop.cover_image.Img_src
            
        shop_cards.append(
            ShopPublicCard(
                Shop_ID=shop.Shop_ID,
                Shop_Name=shop.Shop_Name,
                Shop_Phone=shop.Shop_Phone, # 👈 *** เพิ่มบรรทัดนี้ ***
                Cover_Img_Url=img_url
            )
        )
        
    return shop_cards

def get_brands_by_category(db: Session, category_id: int) -> List[BrandRead]:
    """
    (API ใหม่) ดึง "แบรนด์" ทั้งหมด ที่มีสินค้า "วางขาย"
    อยู่ใน "หมวดหมู่" (Category) ที่กำหนด
    """
    
    # SQL: SELECT DISTINCT T3.*
    #      FROM Sell T1
    #      JOIN Products T2 ON T1.Product_ID = T2.Product_ID
    #      JOIN Brand T3 ON T2.Brand_ID = T3.Brand_ID
    #      WHERE T2.Category_ID = {category_id}
    
    statement = (
        select(Brand) # 👈 (T3)
        .join(Products, Brand.Brand_ID == Products.Brand_ID) # 👈 (Join T3 -> T2)
        .join(Sell, Products.Product_ID == Sell.Product_ID) # 👈 (Join T2 -> T1)
        .where(Products.Category_ID == category_id) # 👈 (Where)
        .distinct() # 👈 (เอาแค่ชื่อแบรนด์ที่ไม่ซ้ำ)
    )
    
    brands = db.exec(statement).all()
    
    # แปลงเป็น Schema BrandRead (ที่มี ID และ Name)
    return [BrandRead.model_validate(b) for b in brands]