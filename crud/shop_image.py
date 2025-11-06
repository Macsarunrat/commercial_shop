from sqlmodel import Session, select
from models.shop import Shop
from models.shop_image import ShopImage 
from typing import Optional
import os 

def _check_shop_owner(db: Session, shop_id: int, user_id: int) -> Shop:

    shop = db.get(Shop, shop_id)
    if not shop:
        raise ValueError(f"Shop with ID {shop_id} not found")
    if shop.User_ID != user_id:
        raise PermissionError("User is not authorized to manage this shop")
    return shop

def set_shop_cover_image(
    db: Session, 
    shop_id: int, 
    user_id: int, 
    img_src: str
) -> ShopImage:

    shop = _check_shop_owner(db, shop_id, user_id)
    
    existing_image = db.exec(
        select(ShopImage).where(ShopImage.Shop_ID == shop_id)
    ).first()
    
    if existing_image:

        if existing_image.Img_src:
            try:
                file_path = existing_image.Img_src.lstrip('/')
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass 
                
        existing_image.Img_src = img_src
        db.add(existing_image)
        db_image = existing_image
    else:
        new_image = ShopImage(Shop_ID=shop_id, Img_src=img_src)
        db.add(new_image)
        db_image = new_image
        
    db.commit()
    db.refresh(db_image)
    return db_image

def get_shop_cover_image(db: Session, shop_id: int) -> Optional[ShopImage]:
 
    statement = select(ShopImage).where(ShopImage.Shop_ID == shop_id)
    result = db.exec(statement).first()
    return result