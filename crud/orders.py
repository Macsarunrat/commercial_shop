from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from models.order import THAI_TZ # (เรา import เขตเวลามาจาก model)

# Import models
from models.order import Order, OrderSummary, OrderDetailsPublic, OrderCheckoutRequest
from models.orderitems import OrderItems, OrderItemPublic
from models.user import User
from models.user_address import UserAddressRead
from models.sell import Sell, ItemPublic
from models.products import Products
from models.images import Image
from models.cart import Cart
from models.shoporders import Shop_Orders

def get_orders_by_user(db: Session, user_id: int) -> List[OrderSummary]:
    """
    (API ข้อ 1) ดึง Order สรุปทั้งหมดของ User
    (user_id นี้ถูกส่งมาจาก Token ที่ปลอดภัยแล้ว)
    """
    user = db.get(User, user_id)
    if not user:
        # นี่เป็น Error ภายใน (Token มี แต่ User หาย)
        raise ValueError(f"User with ID {user_id} not found")

    statement = (
        select(Order)
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

def get_order_details_for_user(db: Session, order_id: int, user_id: int) -> Optional[OrderDetailsPublic]:
    """
    (API ข้อ 2) ดึงรายละเอียด Order 1 ใบ (ที่ตรวจสอบความเป็นเจ้าของแล้ว)
    """
    
    statement = (
        select(Order)
        # ⭐️ ตรวจสอบ User_ID ⭐️
        .where(Order.Order_ID == order_id, Order.User_ID == user_id) 
        .options(
            joinedload(Order.user).joinedload(User.addresses),
            joinedload(Order.orderitems) 
            .joinedload(OrderItems.sell_item) 
            .joinedload(Sell.product_details)
            .joinedload(Products.images)
        )
    )
    
    # ถ้า order_id นี้ไม่ใช่ของ user_id นี้, order จะเป็น None
    order = db.exec(statement).first()
    
    if not order:
        return None

    # (โค้ดแปลงข้อมูล public_items, shipping_addr, order_details)
    public_items = []
    for item in order.orderitems:
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

def create_order_from_cart(db: Session, user_id: int, checkout_data: OrderCheckoutRequest) -> Order:
    """
    สร้าง Order จากตะกร้าสินค้า (Checkout)
    (user_id ถูกส่งมาจาก Token ที่ปลอดภัย)
    """

    # 1. ดึงของในตะกร้า (ใช้ user_id ที่ปลอดภัย)
    cart_items_statement = select(Cart).where(Cart.User_ID == user_id).options(joinedload(Cart.sell_item))
    cart_items = db.exec(cart_items_statement).all()

    if not cart_items:
        raise ValueError("Cart is empty. Cannot create order.")

    backend_total_price = Decimal("0.00")
    items_to_process = [] # (cart_item, sell_item)
    shop_ids = set() # สำหรับเก็บ Shop ID ที่ไม่ซ้ำกัน

    # --- 2. VALIDATION LOOP (เช็ค Stock และคำนวณราคา) ---
    for item in cart_items:
        if not item.sell_item:
            raise ValueError(f"Item Sell_ID {item.Sell_ID} in cart does not exist.")
            
        sell_item = item.sell_item
            
        if item.Quantity > sell_item.Stock:
            raise ValueError(f"Not enough stock for item {sell_item.Product_ID}. Requested: {item.Quantity}, Available: {sell_item.Stock}")
            
        backend_total_price += (sell_item.Price * item.Quantity)
        items_to_process.append((item, sell_item))
        shop_ids.add(sell_item.Shop_ID)
    
    # --- 3. สร้าง Order (ใบสั่งซื้อหลัก) ---
    new_order = Order(
        Order_Date=datetime.now(THAI_TZ), # ⭐️ <--- เพิ่มบรรทัดนี้
        User_ID=user_id,
        Paid_Type_ID=checkout_data.Paid_Type_ID,
        Total_Price=backend_total_price, 
        Total_Weight=checkout_data.Total_Weight,
        Ship_Cost=checkout_data.Ship_Cost,
        Paid_Status=checkout_data.Paid_Status
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order) # <-- refresh เพื่อเอา Order_ID ใหม่

    # --- 4. CREATION/DELETION LOOP (ย้ายของ & ตัด Stock) ---
    for cart_item, sell_item in items_to_process:
        
        # a. สร้าง OrderItems (Snapshot ราคาตอนซื้อ)
        order_item_entry = OrderItems(
            Order_ID=new_order.Order_ID,
            Sell_ID=sell_item.Sell_ID,
            Quantity=cart_item.Quantity,
            Price_At_Purchase=sell_item.Price 
        )
        db.add(order_item_entry)
        
        # b. ตัด Stock สินค้า (สำคัญมาก)
        sell_item.Stock -= cart_item.Quantity
        db.add(sell_item)
        
        # c. ลบของออกจากตะกร้า
        db.delete(cart_item)

    # --- 5. สร้าง Shop_Orders (Link Order กับ Shop) ---
    for shop_id in shop_ids:
        shop_order_link = Shop_Orders(
            Shop_ID=shop_id,
            Order_ID=new_order.Order_ID
        )
        db.add(shop_order_link)

    # --- 6. Commit Transaction ---
    db.commit()
    
    return new_order



def mark_order_as_paid(db: Session, order_id: int, user_id: int) -> Order:
    """
    (จำลอง) อัปเดตสถานะ Order เป็น 'Success'
    - ตรวจสอบความเป็นเจ้าของด้วย user_id
    """
    
    # 1. ค้นหา Order และตรวจสอบว่าเป็นของ User คนนี้จริง
    statement = select(Order).where(Order.Order_ID == order_id, Order.User_ID == user_id)
    order = db.exec(statement).first()

    if not order:
        raise ValueError("Order not found or not owned by user")
    
    # 2. ตรวจสอบว่ายังไม่ได้จ่าย
    if order.Paid_Status != "Pending":
        raise ValueError(f"Order is already in '{order.Paid_Status}' state.")

    # 3. อัปเดตสถานะ (นี่คือการ "จำลอง" จ่ายเงิน)
    order.Paid_Status = "Success"
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return order