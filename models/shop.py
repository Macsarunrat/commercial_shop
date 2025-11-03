from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from .shop_address import ShopAddressRead

if TYPE_CHECKING:
    from .user import User
    from .sell import Sell
    from .shoporders import Shop_Orders
    from .shop_address import Shop_Address

class ShopBase(SQLModel):
    Shop_Name: str = Field(max_length=100, index=True)
    Shop_Phone: Optional[str] = Field(default=None, max_length=20)
    User_ID: int = Field(foreign_key="users.User_ID",unique=True) # เจ้าของร้าน

class Shop(ShopBase, table=True):
    __tablename__ = "shop"
    Shop_ID: Optional[int] = Field(primary_key=True, default=None)
    
    # Relationships
    user: Mapped["User"] = Relationship(sa_relationship=relationship(back_populates="shops"))
    address: Mapped[Optional["Shop_Address"]] = Relationship(sa_relationship=relationship(back_populates="shop")) # 1-to-1
    items_for_sale: Mapped[List["Sell"]] = Relationship(sa_relationship=relationship(back_populates="shop"))
    shop_orders: Mapped[List["Shop_Orders"]] = Relationship(sa_relationship=relationship(back_populates="shop"))

class ShopRead(ShopBase):
    Shop_ID: int

class ShopCreate(ShopBase):
    pass

class ShopReadWithAddress(ShopRead):
    address: Optional[ShopAddressRead] = None