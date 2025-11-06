from decimal import Decimal
from typing import List
from pymysql import IntegrityError
from sqlalchemy import func
from sqlmodel import Session, select
from models.images import Image
from models.order import Order
from models.orderitems import OrderItemPublic, OrderItems
from models.shop import Shop, ShopCreate, ShopOrderDetails, ShopOrderSummary
from models.user import User
from models.sell import ItemPublic, Sell, SellCreate, SellItemCreate
from models.products import Products, ProductCreate
from sqlalchemy.orm import joinedload

def create_shop(db: Session, shop_data: ShopCreate) -> Shop:
    """
    สร้างร้านค้าใหม่ (Shop) - (ยังไม่มีที่อยู่)
    """
    user = db.get(User, shop_data.User_ID)
    if not user:
        raise ValueError(f"User with ID {shop_data.User_ID} not found")
        
    new_shop = Shop.model_validate(shop_data)
    db.add(new_shop)
    
    try:
        db.commit() 
        db.refresh(new_shop)
        return new_shop
    except IntegrityError:
        db.rollback()
        raise ValueError(f"User {shop_data.User_ID} already owns a shop")
    except Exception as e:
        db.rollback()
        raise e

def get_shop(db: Session, shop_id: int) -> Shop | None:
    statement = select(Shop).where(Shop.Shop_ID == shop_id).options(joinedload(Shop.address))
    return db.exec(statement).first()
def create_shop_product(
    db: Session, 
    shop_id: int, 
    item_data: SellItemCreate, 
    current_user_id: int 
) -> Sell:
    
    db_shop = db.get(Shop, shop_id)
    if not db_shop:
        raise ValueError(f"Shop with ID {shop_id} not found")
    if db_shop.User_ID != current_user_id:
        raise PermissionError("User is not authorized to manage this shop")
        
    statement = select(Products).where(
        Products.Product_Name == item_data.Product_Name,
        Products.Brand_ID == item_data.Brand_ID,
        Products.Category_ID == item_data.Category_ID
    )
    product = db.exec(statement).first()

    if not product:
        product_data = ProductCreate(
            Product_Name=item_data.Product_Name,
            Category_ID=item_data.Category_ID,
            Brand_ID=item_data.Brand_ID
        )
        product = Products.model_validate(product_data)
        db.add(product)
        db.flush() 
        db.refresh(product) 

    statement_sell = select(Sell).where(
        Sell.Shop_ID == shop_id,
        Sell.Product_ID == product.Product_ID
    )
    existing_sell = db.exec(statement_sell).first()
    
    if existing_sell:
        raise ValueError("Item already exists in this shop")

    sell_data = SellCreate(
        Price=item_data.Price,
        Stock=item_data.Stock,
        Shop_ID=shop_id,
        Product_ID=product.Product_ID
    )
    new_sell_item = Sell.model_validate(sell_data)
    
    db.add(new_sell_item)
    db.commit()
    db.refresh(new_sell_item)
    return new_sell_item


def get_orders_for_shop(db: Session, shop_id: int) -> List[ShopOrderSummary]:

    statement = (
        select(
            Order.Order_ID,
            Order.Order_Date,
            Order.Paid_Status,
            User.Name.label("Customer_Name"), 
            func.sum(OrderItems.Price_At_Purchase * OrderItems.Quantity).label("Total_Price_For_Shop")
        )
        .join(Order, Order.Order_ID == OrderItems.Order_ID)
        .join(Sell, Sell.Sell_ID == OrderItems.Sell_ID)
        .join(User, User.User_ID == Order.User_ID) 
        .where(Sell.Shop_ID == shop_id) 
        .group_by(Order.Order_ID, Order.Order_Date, Order.Paid_Status, User.Name) 
        .order_by(Order.Order_Date.desc())
    )
    
    results = db.exec(statement).all()
    
    return [ShopOrderSummary.model_validate(res) for res in results]
def get_order_details_for_shop(db: Session, order_id: int, shop_id: int) -> ShopOrderDetails | None:

    order_main = db.exec(
        select(Order, User.Name.label("Customer_Name"))
        .join(User, User.User_ID == Order.User_ID)
        .where(Order.Order_ID == order_id)
    ).first()

    if not order_main:
        raise ValueError("Order not found")

    order = order_main[0]
    customer_name = order_main[1]

    items_statement = (
        select(OrderItems, Products, Image)
        .join(Sell, Sell.Sell_ID == OrderItems.Sell_ID)
        .join(Products, Products.Product_ID == Sell.Product_ID)
        .outerjoin(Image, (Image.Product_ID == Products.Product_ID) & (Image.IsCover == True))
        .where(OrderItems.Order_ID == order_id)
        .where(Sell.Shop_ID == shop_id) 
    )
    item_results = db.exec(items_statement).unique().all() 

    if not item_results:
        raise PermissionError("This order does not contain items from your shop")

    public_items_list = []
    total_price_for_shop = Decimal("0.00")

    for order_item, product, image in item_results:
        total_price_for_shop += (order_item.Price_At_Purchase * order_item.Quantity)
        
        item_details = ItemPublic(
            Sell_ID=order_item.Sell_ID, 
            Product_Name=product.Product_Name,
            Price=order_item.Price_At_Purchase, 
            Stock=0, 
            Shop_ID=shop_id,
            Cover_Image=image.Img_Src if image else None
        )
        
        public_items_list.append(
            OrderItemPublic(
                Quantity=order_item.Quantity,
                Price_At_Purchase=order_item.Price_At_Purchase,
                ItemDetails=item_details
            )
        )

    return ShopOrderDetails(
        Order_ID=order.Order_ID,
        Order_Date=order.Order_Date,
        Paid_Status=order.Paid_Status,
        Customer_Name=customer_name,
        Items=public_items_list,
        Total_Price_For_Shop=total_price_for_shop
    )


def get_shop_details_by_id(db: Session, shop_id: int) -> Shop | None:

    stmt = (
        select(Shop)
        .where(Shop.Shop_ID == shop_id)
        .options(joinedload(Shop.cover_image))
    )

    return db.exec(stmt).first()