from sqlmodel import SQLModel, Session, select
from models.images import ImageRead, Image
from typing import List
from fastapi import HTTPException

def read_images(db: Session) -> List[ImageRead]:
    statement = select(Image)
    result = db.exec(statement)
    return result.all()

# create cover image
def upload_cover_image(db: Session, product_id: int, img_src: str) -> Image:
    # check product exist
    from models.products import Products  # ถ้า circular error ย้ายไป TYPE_CHECKING
    check_product_exist = select(Products).where(Products.Product_ID == product_id)
    result = db.exec(check_product_exist).first()
    if not result:
        raise ValueError(f"Product with ID {product_id} doesn't exist")
    # check cover image > 1
    check_cover_exist = select(Image).where(Image.IsCover == True, Image.Product_ID == product_id)
    result = db.exec(check_cover_exist).first()
    if result:
        raise ValueError("Product has cover image already")
    
    # Save to db
    new_cover_image = Image(IsCover=True, Product_ID=product_id, Img_Src=img_src)
    db.add(new_cover_image)
    db.commit()
    db.refresh(new_cover_image)
    return new_cover_image

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