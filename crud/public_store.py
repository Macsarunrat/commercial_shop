from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List

# import models ที่เราจะ join ทั้งหมด
from models.sell import Sell
from models.products import Products
from models.images import Image
from models.sell import ItemPublic # <--- Import Schema ใหม่จาก models.sell

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

def get_items_by_category(db: Session, category_id: int) -> List[ItemPublic]:
    """
    ดึงสินค้าที่วางขาย (Sell) ทั้งหมดตาม Category ID
    """
    statement = (
        select(Sell)
        .join(Products, Sell.Product_ID == Products.Product_ID) # Join Sell -> Products
        .where(Products.Category_ID == category_id)
        .options(
            joinedload(Sell.product_details) # Eager load Products
            .joinedload(Products.images)     # Eager load Images (ที่ผูกกับ Products)
        )
    )
    items_for_sale = db.exec(statement).all()
    
    # แปลงร่างเป็น Schema ที่ Frontend ต้องการ
    return [_map_to_public(item) for item in items_for_sale]

def get_items_by_brand(db: Session, brand_id: int) -> List[ItemPublic]:
    """
    ดึงสินค้าที่วางขาย (Sell) ทั้งหมดตาม Brand ID
    """
    statement = (
        select(Sell)
        .join(Products, Sell.Product_ID == Products.Product_ID) # Join Sell -> Products
        .where(Products.Brand_ID == brand_id)
        .options(
            joinedload(Sell.product_details) # Eager load Products
            .joinedload(Products.images)     # Eager load Images
        )
    )
    items_for_sale = db.exec(statement).all()
    return [_map_to_public(item) for item in items_for_sale]

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
    items_for_sale = db.exec(statement).all()
    return [_map_to_public(item) for item in items_for_sale]