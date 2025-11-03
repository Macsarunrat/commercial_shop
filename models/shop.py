from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from datetime import datetime # 👈 (เพิ่ม)
from decimal import Decimal # 👈 (เพิ่ม)

from models.orderitems import OrderItemPublic
from models.shop_image import ShopImageRead
from .shop_address import ShopAddressRead

if TYPE_CHECKING:
    from .user import User
    from .sell import Sell
    from .shoporders import Shop_Orders
    from .shop_address import Shop_Address
    from .shop_image import ShopImage

class ShopBase(SQLModel):
    Shop_Name: str = Field(max_length=100, index=True)
    Shop_Phone: Optional[str] = Field(default=None, max_length=20)
    

class Shop(ShopBase, table=True):
    __tablename__ = "shop"
    Shop_ID: Optional[int] = Field(primary_key=True, default=None)
    User_ID: int = Field(foreign_key="users.User_ID",unique=True) # เจ้าของร้าน
    cover_image: Mapped[Optional["ShopImage"]] = Relationship(
        sa_relationship=relationship(back_populates="shop", cascade="all, delete-orphan")
    )
    
    # Relationships
    user: Mapped["User"] = Relationship(sa_relationship=relationship(back_populates="shops"))
    address: Mapped[Optional["Shop_Address"]] = Relationship(sa_relationship=relationship(back_populates="shop")) # 1-to-1
    items_for_sale: Mapped[List["Sell"]] = Relationship(sa_relationship=relationship(back_populates="shop"))
    shop_orders: Mapped[List["Shop_Orders"]] = Relationship(sa_relationship=relationship(back_populates="shop"))

# Model สำหรับ Response (มี User_ID)
class ShopRead(ShopBase):
    Shop_ID: int
    User_ID: int
    cover_image: Optional[ShopImageRead] = None
    # ... (อาจจะมี address ฯลฯ)

# Model ที่ CRUD ใช้ (มี User_ID)
class ShopCreate(ShopBase):
    User_ID: int

# Model ที่ API รับ Body (ไม่มี User_ID)
class ShopCreateBody(ShopBase):
    pass # (รับแค่ Shop_Name, Shop_Phone)


class ShopReadWithAddress(ShopRead):
    address: Optional[ShopAddressRead] = None


class ShopOrderSummary(SQLModel):
    """
    (View 1) Model สำหรับแสดง "รายการออเดอร์" (แบบสรุป)
    - วันที่, ราคารวม (ของร้านนี้), ชื่อลูกค้า
    """
    Order_ID: int
    Order_Date: datetime
    Paid_Status: str
    Customer_Name: str # 👈 (ชื่อลูกค้า)
    Total_Price_For_Shop: Decimal 

class ShopOrderDetails(SQLModel):
    """
    (View 2) Model สำหรับแสดง "รายละเอียดออเดอร์"
    - ชื่อลูกค้า, วันที่, รายการสินค้า (รูป, ชื่อ, จำนวน, ราคา), ราคารวม
    """
    Order_ID: int
    Order_Date: datetime
    Paid_Status: str
    Customer_Name: str # 👈 (ชื่อลูกค้า)
    
    Items: List[OrderItemPublic] # 👈 (รายการสินค้า)
    Total_Price_For_Shop: Decimal


# 🔽 --- โมเดลนี้ที่คุณเพิ่งแก้ไข ถูกต้องครับ --- 🔽
class ShopPublicCard(SQLModel):
    """
    Model สำหรับแสดง Card UI (ข้อมูลร้านค้าแบบย่อ - สาธารณะ)
    """
    Shop_ID: int
    Shop_Name: str
    Shop_Phone: Optional[str] = None # 👈 (เพิ่ม Optional[str] = None ดีกว่า)
    Cover_Img_Url: Optional[str] = None