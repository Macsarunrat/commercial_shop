from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from fastapi import HTTPException

from models.cart import Cart, CartItemPublic, CartAdd, CartRead, CartUpdate
from models.sell import Sell, ItemPublic
from models.products import Products
from models.images import Image
from models.user import User

def get_cart_items_by_user(db: Session, user_id: int) -> List[CartItemPublic]:

    user = db.get(User, user_id)
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    statement = (
        select(Cart)
        .where(Cart.User_ID == user_id)
        .options(
            joinedload(Cart.sell_item) 
            .joinedload(Sell.product_details) 
            .joinedload(Products.images) 
        )
    )
    
    cart_items = db.exec(statement).unique().all()
    
    public_cart_items = []
    for item in cart_items:
        if not item.sell_item:
            continue
            
        sell_details = item.sell_item
        product_details = sell_details.product_details
        
        cover_img = next(
            (img.Img_Src for img in product_details.images if img.IsCover),
            None
        )
        
        item_public_data = ItemPublic(
            Sell_ID=sell_details.Sell_ID,
            Product_ID=product_details.Product_ID,
            Product_Name=product_details.Product_Name,
            Price=sell_details.Price,
            Stock=sell_details.Stock,
            Shop_ID=sell_details.Shop_ID,
            Cover_Image=cover_img
        )
        
        public_cart_items.append(
            CartItemPublic(
                Quantity=item.Quantity,
                ItemDetails=item_public_data
            )
        )
        
    return public_cart_items

def add_to_cart(db: Session, cart_data: CartAdd) -> Cart:
    user = db.get(User, cart_data.User_ID)
    item_to_add = db.get(Sell, cart_data.Sell_ID)
    
    if not user:
        raise ValueError("User not found")
    if not item_to_add:
        raise ValueError("Item (Sell_ID) not found")
    if cart_data.Quantity <= 0:
        raise ValueError("Quantity must be greater than 0")

    statement = select(Cart).where(
        Cart.User_ID == cart_data.User_ID,
        Cart.Sell_ID == cart_data.Sell_ID
    )
    existing_cart_item = db.exec(statement).first()
    
    if existing_cart_item:
        new_quantity = existing_cart_item.Quantity + cart_data.Quantity
        
        if new_quantity > item_to_add.Stock:
            raise ValueError(f"Not enough stock. Only {item_to_add.Stock} available.")
            
        existing_cart_item.Quantity = new_quantity
        db.add(existing_cart_item)
        db.commit()
        db.refresh(existing_cart_item)
        return existing_cart_item
    
    else:
        
        if cart_data.Quantity > item_to_add.Stock:
            raise ValueError(f"Not enough stock. Only {item_to_add.Stock} available.")
        
        new_cart_item = Cart.model_validate(cart_data)
        db.add(new_cart_item)
        db.commit()
        db.refresh(new_cart_item)
        return new_cart_item

def update_cart_item(db: Session, user_id: int, sell_id: int, cart_update: CartUpdate) -> Cart:
    if cart_update.Quantity <= 0:
        raise ValueError("Quantity must be greater than 0")

    cart_item = db.get(Cart, (user_id, sell_id))
    
    if not cart_item:
        raise ValueError("Item not found in cart")
    item_in_stock = db.get(Sell, sell_id)
    if not item_in_stock:
        raise ValueError("Item (Sell_ID) no longer exists")
    if cart_update.Quantity > item_in_stock.Stock:
        raise ValueError(f"Not enough stock. Only {item_in_stock.Stock} available.")

    cart_item.Quantity = cart_update.Quantity
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

def remove_cart_item(db: Session, user_id: int, sell_id: int):

    cart_item = db.get(Cart, (user_id, sell_id)) 
    
    if not cart_item:
        raise ValueError("Item not found in cart")
        
    db.delete(cart_item)
    db.commit()
    return {"detail": "Item removed successfully"}