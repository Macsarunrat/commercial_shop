from sqlmodel import Session, select
from models.shop import Shop
from models.shop_image import ShopImage # (Model ที่คุณสร้างจากรูป)
from typing import Optional
import os # (สำหรับลบไฟล์)

def _check_shop_owner(db: Session, shop_id: int, user_id: int) -> Shop:
    """
    Helper: ตรวจสอบว่า User เป็นเจ้าของ Shop นี้หรือไม่
    """
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
    """
    (API: PUT /shops/my/cover-image)
    สร้างหรืออัปเดตภาพปกร้านค้า (ต้องเป็นเจ้าของ)
    """
    
    # 1. ⭐️ Authorization Check: ตรวจสอบสิทธิ์
    shop = _check_shop_owner(db, shop_id, user_id)
    
    # 2. ค้นหารูปเก่า (ถ้ามี)
    existing_image = db.exec(
        select(ShopImage).where(ShopImage.Shop_ID == shop_id)
    ).first()
    
    if existing_image:
        # 3a. ถ้ามี -> อัปเดต
        
        # (Optional: ลบไฟล์เก่าออกจาก Storage)
        if existing_image.Img_src:
            try:
                # (ลบไฟล์เก่าจาก "static/images/...")
                file_path = existing_image.Img_src.lstrip('/')
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass # (ถ้าลบไม่สำเร็จก็ไม่เป็นไร)
                
        existing_image.Img_src = img_src
        db.add(existing_image)
        db_image = existing_image
    else:
        # 3b. ถ้าไม่มี -> สร้างใหม่
        new_image = ShopImage(Shop_ID=shop_id, Img_src=img_src)
        db.add(new_image)
        db_image = new_image
        
    db.commit()
    db.refresh(db_image)
    return db_image