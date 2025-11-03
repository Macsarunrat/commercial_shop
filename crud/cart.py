from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List, Optional

# Import models ที่ต้องใช้
from models.cart import Cart, CartItemPublic
from models.sell import Sell, ItemPublic
from models.products import Products
from models.images import Image
from models.user import User

def get_cart_items_by_user(db: Session, user_id: int) -> List[CartItemPublic]:
    """
    ดึงสินค้าทั้งหมดในตะกร้าของ User ID
    """
    
    # 1. ตรวจสอบว่ามี User นี้จริงไหม
    user = db.get(User, user_id)
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    # 2. Query ตาราง Cart โดย join ข้อมูลที่จำเป็นทั้งหมด
    statement = (
        select(Cart)
        .where(Cart.User_ID == user_id)
        .options(
            # Eager load 'sell_item' (ตาราง Sell)
            joinedload(Cart.sell_item) 
            # จาก Sell, Eager load 'product_details' (ตาราง Products)
            .joinedload(Sell.product_details) 
            # จาก Products, Eager load 'images' (ตาราง Image)
            .joinedload(Products.images) 
        )
    )
    
    cart_items = db.exec(statement).all()
    
    # 3. แปลงข้อมูลให้อยู่ในรูปแบบ CartItemPublic
    public_cart_items = []
    for item in cart_items:
        if not item.sell_item:
            # กันเหนียว กรณี Sell_ID ในตะกร้าไม่มีอยู่จริง
            continue
            
        sell_details = item.sell_item
        product_details = sell_details.product_details
        
        # หา Cover Image
        cover_img = next(
            (img.Img_Src for img in product_details.images if img.IsCover),
            None
        )
        
        # ประกอบร่าง ItemPublic
        item_public_data = ItemPublic(
            Sell_ID=sell_details.Sell_ID,
            Product_Name=product_details.Product_Name,
            Price=sell_details.Price,
            Stock=sell_details.Stock,
            Shop_ID=sell_details.Shop_ID,
            Cover_Image=cover_img
        )
        
        # ประกอบร่าง CartItemPublic
        public_cart_items.append(
            CartItemPublic(
                Quantity=item.Quantity,
                ItemDetails=item_public_data
            )
        )
        
    return public_cart_items