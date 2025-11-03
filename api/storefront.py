from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.public_store as crud_public
from models.sell import ItemPublic # <--- Import Schema ใหม่จาก models.sell

router = APIRouter(
    prefix="/store", # ใช้ prefix ใหม่สำหรับหน้าร้าน
    tags=["Storefront - Public"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/by-category/{category_id}", response_model=List[ItemPublic])
def read_items_by_category(session: SessionDep, category_id: int):
    """
    API: ดึงสินค้าทั้งหมดตาม Category
    """
    items = crud_public.get_items_by_category(session, category_id)
    if not items:
        raise HTTPException(status_code=404, detail="No items found for this category")
    return items

@router.get("/by-brand/{brand_id}", response_model=List[ItemPublic])
def read_items_by_brand(session: SessionDep, brand_id: int):
    """
    API: ดึงสินค้าทั้งหมดตาม Brand
    """
    items = crud_public.get_items_by_brand(session, brand_id)
    if not items:
        raise HTTPException(status_code=404, detail="No items found for this brand")
    return items

@router.get("/by-shop/{shop_id}", response_model=List[ItemPublic])
def read_items_by_shop(session: SessionDep, shop_id: int):
    """
    API: ดึงสินค้าทั้งหมดใน Shop
    """
    items = crud_public.get_items_by_shop(session, shop_id)
    if not items:
        raise HTTPException(status_code=404, detail="No items found for this shop")
    return items