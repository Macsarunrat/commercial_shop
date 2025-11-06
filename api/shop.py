from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, List, Optional 
from database import get_session
import crud.shop as crud_shop
from decimal import Decimal
from sqlmodel import SQLModel, Field 


from security import get_current_user
from models.user import User

from models.shop import ShopCreate, ShopOrderDetails, ShopOrderSummary, ShopRead, ShopCreateBody 
from models.sell import SellItemCreate, SellRead


from models.category import Category
from models.brand import Brand

router = APIRouter(
    prefix="/shops", 
    tags=["Shop (Protected)"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]


class SellItemCreateByName(SQLModel):

    Product_Name: str
    Category_Name: str 
    Brand_Name: str    
    Price: Decimal
    Stock: int


@router.post("/", response_model=ShopRead)
def create_my_shop(
    shop_data: ShopCreateBody, 
    session: SessionDep,
    current_user: CurrentUser
):

    
    full_shop_data = ShopCreate(
        Shop_Name=shop_data.Shop_Name,
        Shop_Phone=shop_data.Shop_Phone,
        User_ID=current_user.User_ID
    )
    
    try:
        shop = crud_shop.create_shop(session, full_shop_data)
        return shop
    
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail=error_msg)
        elif "already owns" in error_msg:
            raise HTTPException(status_code=409, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)


@router.post("/{shop_id}/items", response_model=SellRead)
def add_item_to_my_shop(
    shop_id: int, 
    item_data: SellItemCreate, 
    session: SessionDep,
    current_user: CurrentUser 
):

    try:
        sell_item = crud_shop.create_shop_product(
            db=session, 
            shop_id=shop_id, 
            item_data=item_data,
            current_user_id=current_user.User_ID 
        )
        return sell_item
    
    except ValueError as e: 
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail=error_msg) 
        if "already exists" in error_msg:
            raise HTTPException(status_code=409, detail=error_msg) 
        else:
            raise HTTPException(status_code=400, detail=error_msg)
            
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) 
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/{shop_id}/items/by_name", response_model=SellRead)
def add_item_to_my_shop_by_name(
    shop_id: int, 
    item_data: SellItemCreateByName, 
    session: SessionDep,
    current_user: CurrentUser 
):

    category_statement = select(Category).where(Category.Category_Name == item_data.Category_Name)
    category = session.exec(category_statement).first()
    
    if not category:
        raise HTTPException(
            status_code=404, 
            detail=f"Category '{item_data.Category_Name}' not found."
        )

    brand_statement = select(Brand).where(Brand.Brand_Name == item_data.Brand_Name)
    brand = session.exec(brand_statement).first()

    if not brand:
        raise HTTPException(
            status_code=404, 
            detail=f"Brand '{item_data.Brand_Name}' not found."
        )

    sell_data_with_ids = SellItemCreate(
        Product_Name=item_data.Product_Name,
        Category_ID=category.Category_ID, 
        Brand_ID=brand.Brand_ID,       
        Price=item_data.Price,
        Stock=item_data.Stock
    )

    try:
        sell_item = crud_shop.create_shop_product(
            db=session, 
            shop_id=shop_id, 
            item_data=sell_data_with_ids, 
            current_user_id=current_user.User_ID
        )
        return sell_item
    

    except ValueError as e: 
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail=error_msg) 
        if "already exists" in error_msg:
            raise HTTPException(status_code=409, detail=error_msg) 
        else:
            raise HTTPException(status_code=400, detail=error_msg)
            
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) 
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/my/orders", response_model=List[ShopOrderSummary])
def get_my_shop_orders(
    session: SessionDep,
    current_user: CurrentUser
):

    if not current_user.shops:
        raise HTTPException(status_code=404, detail="User does not own a shop")
        
    my_shop_id = current_user.shops.Shop_ID
    
    try:
        orders = crud_shop.get_orders_for_shop(session, my_shop_id) 
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my/orders/{order_id}", response_model=ShopOrderDetails)
def get_my_shop_order_details(
    order_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    
    if not current_user.shops:
        raise HTTPException(status_code=404, detail="User does not own a shop")
        
    my_shop_id = current_user.shops.Shop_ID
    
    try:
        order_details = crud_shop.get_order_details_for_shop(
            session, 
            order_id=order_id, 
            shop_id=my_shop_id
        )
        return order_details
        
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e: 
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get(
    "/me/profile", 
    response_model=ShopRead,
    summary="ดึงข้อมูล Profile ของร้านค้าที่กำลังล็อกอินอยู่"
)
def read_current_shop_profile(
    session: SessionDep,
    current_user: CurrentUser 
):

    
    if not current_user.shops:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not own a shop."
        )
        
    my_shop_id = current_user.shops.Shop_ID 

    shop = crud_shop.get_shop_details_by_id(db=session, shop_id=my_shop_id)
    
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop data corrupted or not found."
        )
        
    return shop


@router.get(
    "/{shop_id}", 
    response_model=ShopRead, 
    summary="ดึงข้อมูล Profile ร้านค้าสำหรับผู้เข้าชม (Public View)"
)
def read_shop_profile_public(
    shop_id: int,
    session: SessionDep,
):

    shop = crud_shop.get_shop_details_by_id(db=session, shop_id=shop_id)
    
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ไม่พบร้านค้า ID {shop_d}"
        )
        
    return shop