from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.public_store as crud_public
from models.sell import ItemPublic
from models.shop import ShopPublicCard # <--- Import Schema ใหม่จาก models.sell

router = APIRouter(
    prefix="/store", # ใช้ prefix ใหม่สำหรับหน้าร้าน
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
    """
    API: ดึงสินค้าทั้งหมดใน Shop
    """
    items = crud_public.get_items_by_shop(session, shop_id)
    if not items:
        raise HTTPException(status_code=404, detail="No items found for this shop")
    return items
@router.get("/products", response_model=List[ItemPublic])
def search_products(
    session: SessionDep,
    category_id: int | None = None,
    brand_id: int | None = None,
    q: str | None = None  # 👈 1. เพิ่ม 'q' (คำค้นหา) เป็น Query Param
):
    """
    API: ค้นหาสินค้าที่วางขาย
    - /products?category_id=5 (กรองตามหมวดหมู่)
    - /products?brand_id=12 (กรองตามแบรนด์)
    - /products?q=iPhone (ค้นหาตามชื่อ)
    - /products?category_id=8&q=Galaxy (ค้นหาชื่อในหมวดหมู่)
    """
    
    items = crud_public.get_sell_items_by_filters(
        db=session,
        category_id=category_id,
        brand_id=brand_id,
        search_term=q  # 👈 2. ส่งคำค้นหา "q" ไปยัง CRUD
    )
    
    return items


@router.get("/shops", response_model=List[ShopPublicCard])
def get_all_shops_for_ui(session: SessionDep):
    """
    API: (Public) ดึงรายชื่อร้านค้าทั้งหมด
    สำหรับให้เพื่อนทำ Card UI
    """
    # (โค้ดนี้ทำงานได้เลย ไม่ต้องแก้)
    shops = crud_public.get_all_shops_public(session) 
    return shops