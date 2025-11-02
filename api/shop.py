from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from models.shop import ShopRead, ShopCreate, ShopUpdate
from crud import shop,user
from database import get_session

router = APIRouter()

@router.post("/shops/", response_model=ShopRead, tags=["Shops"])
def api_create_shop(shop_create: ShopCreate, session: Session = Depends(get_session)):
    db_user = user.get_user_by_id(session, user_id=shop_create.User_ID)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")
    existing_shop = shop.get_shop_by_user_id(session, user_id=shop_create.User_ID)
    if existing_shop:
        raise HTTPException(status_code=400, detail="User already has a shop. Cannot create another.")
    return shop.create_shop(session=session, shop=shop_create)

@router.put("/shops/{shop_id}", response_model=ShopRead, tags=["Shops"])
def api_update_shop(shop_id: int, shop_update: ShopUpdate, session: Session = Depends(get_session)):
    db_shop = shop.update_shop(session=session, shop_id=shop_id, shop_update=shop_update)
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return db_shop

@router.delete("/shops/{shop_id}", response_model=ShopRead, tags=["Shops"])
def api_delete_shop(shop_id: int, session: Session = Depends(get_session)):
    db_shop = shop.delete_shop(session=session, shop_id=shop_id)
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return db_shop
