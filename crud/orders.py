from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List, Optional

# Import models
from models.order import Order, OrderSummary, OrderDetailsPublic  # <--- แก้เป็น Order (เอกพจน์)
from models.orderitems import OrderItems, OrderItemPublic      # <--- แก้เป็น models.orderitems และ OrderItems
from models.user import User
from models.user_address import UserAddressRead
from models.sell import Sell, ItemPublic
from models.products import Products
from models.images import Image

def get_orders_by_user(db: Session, user_id: int) -> List[OrderSummary]:
    """
    (API ข้อ 1) ดึง Order สรุปทั้งหมดของ User
    """
    user = db.get(User, user_id)
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    statement = (
        select(Order)  # <--- แก้เป็น Order (เอกพจน์)
        .where(Order.User_ID == user_id)
        .order_by(Order.Order_Date.desc()) 
    )
    
    orders = db.exec(statement).all()
    
    return [
        OrderSummary(
            Order_ID=order.Order_ID,
            Order_Date=order.Order_Date,
            Total_Price=order.Total_Price,
            Paid_Status=order.Paid_Status
        ) for order in orders
    ]

def get_order_details(db: Session, order_id: int) -> Optional[OrderDetailsPublic]:
    """
    (API ข้อ 2) ดึงรายละเอียด Order 1 ใบ
    """
    
    statement = (
        select(Order)  # <--- แก้เป็น Order (เอกพจน์)
        .where(Order.Order_ID == order_id)
        .options(
            joinedload(Order.user).joinedload(User.addresses),
            # vvvv แก้ชื่อ attribute และ class vvvv
            joinedload(Order.orderitems) 
            .joinedload(OrderItems.sell_item) 
            # ^^^^ ------------------------ ^^^^
            .joinedload(Sell.product_details)
            .joinedload(Products.images)
        )
    )
    
    order = db.exec(statement).first()
    
    if not order:
        return None

    public_items = []
    # vvvv แก้ชื่อ attribute vvvv
    for item in order.orderitems: 
    # ^^^^ ---------------- ^^^^
        if not item.sell_item or not item.sell_item.product_details:
            continue
            
        sell = item.sell_item
        product = sell.product_details
        
        cover_img = next(
            (img.Img_Src for img in product.images if img.IsCover), None
        )
        
        item_details = ItemPublic(
            Sell_ID=sell.Sell_ID,
            Product_Name=product.Product_Name,
            Price=sell.Price, 
            Stock=sell.Stock,
            Shop_ID=sell.Shop_ID,
            Cover_Image=cover_img
        )
        
        public_items.append(
            OrderItemPublic(
                Quantity=item.Quantity,
                Price_At_Purchase=item.Price_At_Purchase, 
                ItemDetails=item_details
            )
        )

    shipping_addr = None
    if order.user and order.user.addresses:
        addr = order.user.addresses[0] 
        shipping_addr = UserAddressRead.model_validate(addr)

    order_details = OrderDetailsPublic(
        Order_ID=order.Order_ID,
        Order_Date=order.Order_Date,
        Total_Price=order.Total_Price,
        Paid_Status=order.Paid_Status,
        Total_Weight=order.Total_Weight,
        Ship_Cost=order.Ship_Cost,
        Paid_Type_ID=order.Paid_Type_ID,
        Items=public_items,
        Shipping_Address=shipping_addr
    )
    
    return order_details