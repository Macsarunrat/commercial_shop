from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.public_store as crud_public
from models.sell import ItemPublic
from models.shop import ShopPublicCard 
from models.brand import BrandRead 

router = APIRouter(
    prefix="/store", 
    tags=["Storefront - Public"]
)

SessionDep = Annotated[Session, Depends(get_session)]

# @router.get("/by-category/{category_id}", response_model=List[ItemPublic])
# def read_items_by_category(session: SessionDep, category_id: int):
#     """
#     API: ดึงสินค้าทั้งหมดตาม Category
#     """
#     items = crud_public.get_items_by_category(session, category_id)
#     if not items:
#         raise HTTPException(status_code=404, detail="No items found for this category")
#     return items

# @router.get("/by-brand/{brand_id}", response_model=List[ItemPublic])
# def read_items_by_brand(session: SessionDep, brand_id: int):
#     """
#     API: ดึงสินค้าทั้งหมดตาม Brand
#     """
#     items = crud_public.get_items_by_brand(session, brand_id)
#     if not items:
#         raise HTTPException(status_code=404, detail="No items found for this brand")
#     return items

@router.get("/by-shop/{shop_id}", response_model=List[ItemPublic])
def read_items_by_shop(session: SessionDep, shop_id: int):
 
    items = crud_public.get_items_by_shop(session, shop_id)
    if not items:
        raise HTTPException(status_code=404, detail="No items found for this shop")
    return items
@router.get("/products", response_model=List[ItemPublic])
def search_products(
    session: SessionDep,
    category_id: int | None = None,
    brand_id: int | None = None,
    q: str | None = None  
):
    
    items = crud_public.get_sell_items_by_filters(
        db=session,
        category_id=category_id,
        brand_id=brand_id,
        search_term=q  
    )
    
    return items


@router.get("/shops", response_model=List[ShopPublicCard])
def get_all_shops_for_ui(session: SessionDep):

    shops = crud_public.get_all_shops_public(session) 
    return shops

@router.get("/brands-by-category/{category_id}", response_model=List[BrandRead])
def get_brands_for_category(session: SessionDep, category_id: int):

    brands = crud_public.get_brands_by_category(session, category_id)
    if not brands:
        raise HTTPException(status_code=404, detail="No brands found for this category or category does not exist")
    return brands