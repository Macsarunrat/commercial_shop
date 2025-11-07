from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List

from models.sell import Sell
from models.products import Products
from models.images import Image
from models.sell import ItemPublic
from models.shop import Shop, ShopPublicCard 
from models.brand import Brand, BrandRead 
from sqlalchemy import distinct 

def _map_to_public(sell_item: Sell) -> ItemPublic:

    cover_img = next(
        (img.Img_Src for img in sell_item.product_details.images if img.IsCover), 
        None
    )
    
    return ItemPublic(
        Sell_ID=sell_item.Sell_ID,
        Product_ID=sell_item.Product_ID,
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
        .where(Sell.Shop_ID == shop_id) 
        .options(
            joinedload(Sell.product_details) 
            .joinedload(Products.images)   
        )
    )
    items_for_sale = db.exec(statement).unique().all()
    return [_map_to_public(item) for item in items_for_sale]

def get_sell_items_by_filters(
    db: Session, 
    category_id: int | None = None, 
    brand_id: int | None = None,
    search_term: str | None = None 
) -> List[ItemPublic]:

    
    statement = select(Sell)

    statement = statement.options(
        joinedload(Sell.shop),
        joinedload(Sell.product_details).options(
            joinedload(Products.images),
            joinedload(Products.brand),
            joinedload(Products.category)
        )
    )

    needs_product_join = category_id or brand_id or search_term
    if needs_product_join:
        statement = statement.join(Products, Sell.Product_ID == Products.Product_ID)
    
    if category_id:
        statement = statement.where(Products.Category_ID == category_id)
        
    if brand_id:
        statement = statement.where(Products.Brand_ID == brand_id)
        
    if search_term:
        search_pattern = f"%{search_term}%"
        statement = statement.where(Products.Product_Name.ilike(search_pattern))

    results = db.exec(statement).unique().all()
    
    return [_map_to_public(item) for item in results]

def get_all_shops_public(db: Session) -> List[ShopPublicCard]:

    statement = (
        select(Shop)
        .options(joinedload(Shop.cover_image)) 
    )
    
    shops = db.exec(statement).all()
    
    shop_cards = []
    for shop in shops:
        img_url = None
        if shop.cover_image:
            img_url = shop.cover_image.Img_src
            
        shop_cards.append(
            ShopPublicCard(
                Shop_ID=shop.Shop_ID,
                Shop_Name=shop.Shop_Name,
                Shop_Phone=shop.Shop_Phone, 
                Cover_Img_Url=img_url
            )
        )
        
    return shop_cards

def get_brands_by_category(db: Session, category_id: int) -> List[BrandRead]:
 
    
    # SQL: SELECT DISTINCT T3.*
    #      FROM Sell T1
    #      JOIN Products T2 ON T1.Product_ID = T2.Product_ID
    #      JOIN Brand T3 ON T2.Brand_ID = T3.Brand_ID
    #      WHERE T2.Category_ID = {category_id}
    
    statement = (
        select(Brand) 
        .join(Products, Brand.Brand_ID == Products.Brand_ID) 
        .join(Sell, Products.Product_ID == Sell.Product_ID) 
        .where(Products.Category_ID == category_id) 
        .distinct() 
    )
    
    brands = db.exec(statement).all()
    
    return [BrandRead.model_validate(b) for b in brands]