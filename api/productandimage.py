# from fastapi import APIRouter, Depends
# from sqlmodel import Session
# from typing import Annotated,List
# from database import get_session
# import crud.productandimage as crud_productandimage

# SessionDep = Annotated[Session,Depends(get_session)]

# router = APIRouter(
#     prefix= "/product-image",
#     tags = ["product-image"]
# )

# @router.get("/{shop_id}/product-image")
# def read_product_image_by_shop(session : SessionDep, shop_id: int):
#     return crud_productandimage.read_product_image_by_shop(session,shop_id)