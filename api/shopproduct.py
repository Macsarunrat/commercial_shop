# from fastapi import APIRouter, Depends
# from sqlmodel import Session
# from typing import Annotated
# from database import get_session
# import crud.shopproduct as crud_shopproduct


# router = APIRouter(
#     prefix = "/shop-product",
#     tags = ["shop-product"]
# )

# SessionDep = Annotated[Session, Depends(get_session)]

# #read_shop_product
# @router.get("/shop/{shop_id}/products")
# def read_product_shop(session: SessionDep, shop_id:int):
#     sells = crud_shopproduct.read_product_shop(session,shop_id)
#     return [
#         {
#             "Product_ID" : sell.product.Product_ID,
#             "Product_Name": sell.product.Product_Name,
#             "Price" : sell.Price,
#             "Stock" : sell.Stock
#         }
#         for sell in sells
#     ]
