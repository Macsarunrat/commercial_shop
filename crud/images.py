from sqlmodel import SQLModel, Session, select, update
from models.images import ImageRead, Image, ImageReadWithProduct
from models.products import Products
from typing import List
from fastapi import HTTPException

def read_images(db: Session) -> List[ImageReadWithProduct]:
    """
    ดึงข้อมูลรูปภาพทั้งหมด พร้อมชื่อ Product ที่เกี่ยวข้อง
    """
    statement = select(
        Image.Img_ID,
        Image.Img_Src,
        Image.Product_ID,
        Image.IsCover,
        Products.Product_Name 
    ).join(Products, Image.Product_ID == Products.Product_ID) 
    
    results = db.exec(statement).all()
    
    images_with_product_name = [
        ImageReadWithProduct(
            Img_ID=row.Img_ID,
            Img_Src=row.Img_Src,
            Product_ID=row.Product_ID,
            IsCover=row.IsCover,
            product_name=row.Product_Name
        ) 
        for row in results
    ]
    
    return images_with_product_name

# --- MODIFIED ---
def upload_cover_image(db: Session, product_id: int, img_src: str) -> Image:
    """
    ตั้งค่าภาพปกสำหรับ Product
    (เพิ่ม db.flush())
    """
    
    check_product_exist = select(Products).where(Products.Product_ID == product_id)
    result = db.exec(check_product_exist).first()
    if not result:
        raise ValueError(f"Product with ID {product_id} doesn't exist")

    statement_old = update(Image).where(
        Image.IsCover == True,
        Image.Product_ID == product_id
    ).values(IsCover=False)
    
    db.exec(statement_old)
    
    new_cover_image = Image(IsCover=True, Product_ID=product_id, Img_Src=img_src)
    
    db.add(new_cover_image)
    
    db.flush() 
    
    db.refresh(new_cover_image) 
    return new_cover_image

def create_non_cover_image(db: Session, product_id: int, img_srcs: List[str]) -> List[Image]:

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
    db.flush() 
    
    for img in new_images:
        db.refresh(img) 
    return new_images