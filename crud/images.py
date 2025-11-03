from sqlmodel import SQLModel, Session, select, update
from models.images import ImageRead, Image
from typing import List
from fastapi import HTTPException
from models.products import Products

def read_images(db: Session) -> List[ImageRead]:
    statement = select(Image)
    result = db.exec(statement)
    return result.all()

# create cover image
def upload_cover_image(db: Session, product_id: int, img_src: str) -> Image:
    """
    ตั้งค่าภาพปกสำหรับ Product
    - ถ้ามีภาพปกเก่าอยู่แล้ว จะเปลี่ยนภาพเก่านั้นเป็น IsCover = False
    - เพิ่มภาพใหม่เป็น IsCover = True
    """
    
    # 1. ตรวจสอบว่า Product มีอยู่จริง
    check_product_exist = select(Products).where(Products.Product_ID == product_id)
    result = db.exec(check_product_exist).first()
    if not result:
        raise ValueError(f"Product with ID {product_id} doesn't exist")

    # 2. ค้นหาภาพปกเก่า (ถ้ามี) และตั้งค่าเป็น False
    # (ใช้ statement .values() จะเร็วกว่าการ select มา add)
    statement_old = update(Image).where(
        Image.IsCover == True,
        Image.Product_ID == product_id
    ).values(IsCover=False)
    
    db.exec(statement_old) # รันคำสั่งอัปเดต
    
    # 3. เพิ่มภาพใหม่เป็น IsCover = True
    new_cover_image = Image(IsCover=True, Product_ID=product_id, Img_Src=img_src)
    
    try:
        db.add(new_cover_image)
        db.commit() # Commit ทั้งการ update และการ add พร้อมกัน
        db.refresh(new_cover_image)
        return new_cover_image
    except Exception as e:
        db.rollback()
        raise e

# Create sub images
def create_non_cover_image(db: Session, product_id: int, img_srcs: List[str]) -> List[Image]:
    # check product exist
    from models.products import Products  # ถ้า circular error ย้ายไป TYPE_CHECKING
    check_product_exist = select(Products).where(Products.Product_ID == product_id)
    result = db.exec(check_product_exist).first()
    if not result:
        raise ValueError(f"Product with ID {product_id} doesn't exist")
    
    new_images = []
    for img_src in img_srcs:
        new_image = Image(
            IsCover=False,
            Product_ID=product_id,
            Img_Src=img_src
        )
        db.add(new_image)
        new_images.append(new_image)

    db.commit()
    for img in new_images:
        db.refresh(img)
    return new_images

