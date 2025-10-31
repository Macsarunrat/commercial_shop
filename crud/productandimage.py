# from sqlmodel import select, Session
# from typing import List
# from ..models.products import Products
# from ..models.brand import Brand
# from ..models.images import Image
# from ..models.catagory import Catagory
# from sqlalchemy.orm import joinedload


# def read_product_image_by_shop(db:Session, shop_id:int) -> List[Products]:
#     statement = select(Products).where(Products.Shop_ID == shop_id).options(
#         joinedload(Products.brand),
#         joinedload(Products.catagory),
#         joinedload(Products.images)
#     )
#     results = db.exec(statement)
#     return results.all()