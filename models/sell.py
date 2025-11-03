from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy import Column, DECIMAL
from decimal import Decimal

if TYPE_CHECKING:
    from .shop import Shop
    from .products import Products
    from .cart import Cart
    from .orderitems import OrderItems

class SellBase(SQLModel):
    Price: Decimal = Field(sa_column=Column(DECIMAL(10, 2)))
    Stock: int = Field(default=0)
    
    Shop_ID: int = Field(foreign_key="shop.Shop_ID")
    Product_ID: int = Field(foreign_key="products.Product_ID")

class Sell(SellBase, table=True):
    __tablename__ = "sell"
    Sell_ID: Optional[int] = Field(primary_key=True, default=None)
    
    # Relationships
    shop: Mapped["Shop"] = Relationship(sa_relationship=relationship(back_populates="items_for_sale"))
    product_details: Mapped["Products"] = Relationship(sa_relationship=relationship(back_populates="sell_instances"))
    cart_items: Mapped[List["Cart"]] = Relationship(sa_relationship=relationship(back_populates="sell_item"))
    order_items: Mapped[List["OrderItems"]] = Relationship(sa_relationship=relationship(back_populates="sell_item"))

class SellRead(SellBase):
    Sell_ID: int
    
class SellCreate(SellBase):
    pass

class ItemPublic(SQLModel):
    Sell_ID: int
    Product_Name: str
    Price: Decimal
    Stock: int
    Shop_ID: int
    Cover_Image: Optional[str] = None

class SellItemCreate(SQLModel):
    # ข้อมูลสำหรับค้นหา หรือ สร้าง Product
    Product_Name: str
    Category_ID: int
    Brand_ID: int
    
    # ข้อมูลสำหรับสร้าง Sell
    Price: Decimal
    Stock: int

