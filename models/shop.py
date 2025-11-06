from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from datetime import datetime 
from decimal import Decimal 

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
    address: Mapped[Optional["Shop_Address"]] = Relationship(sa_relationship=relationship(back_populates="shop")) 
    items_for_sale: Mapped[List["Sell"]] = Relationship(sa_relationship=relationship(back_populates="shop"))
    shop_orders: Mapped[List["Shop_Orders"]] = Relationship(sa_relationship=relationship(back_populates="shop"))

class ShopRead(ShopBase):
    Shop_ID: int
    User_ID: int
    cover_image: Optional[ShopImageRead] = None

class ShopCreate(ShopBase):
    User_ID: int

class ShopCreateBody(ShopBase):
    pass 


class ShopReadWithAddress(ShopRead):
    address: Optional[ShopAddressRead] = None


class ShopOrderSummary(SQLModel):

    Order_ID: int
    Order_Date: datetime
    Paid_Status: str
    Customer_Name: str 
    Total_Price_For_Shop: Decimal 

class ShopOrderDetails(SQLModel):

    Order_ID: int
    Order_Date: datetime
    Paid_Status: str
    Customer_Name: str 
    
    Items: List[OrderItemPublic] 
    Total_Price_For_Shop: Decimal


class ShopPublicCard(SQLModel):

    Shop_ID: int
    Shop_Name: str
    Shop_Phone: Optional[str] = None 
    Cover_Img_Url: Optional[str] = None


