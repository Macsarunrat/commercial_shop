from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING:
    from .shop import Shop

class ShopImageBase(SQLModel):
    Img_src: str = Field(max_length=255) 
    
    Shop_ID: int = Field(foreign_key="shop.Shop_ID", unique=True) 

class ShopImage(ShopImageBase, table=True):
    __tablename__ = "shop_image" 
    Shop_Img_ID: Optional[int] = Field(primary_key=True, default=None)
    
    # Relationship กลับไปหา Shop
    shop: Mapped["Shop"] = Relationship(sa_relationship=relationship(back_populates="cover_image"))

class ShopImageRead(ShopImageBase):
    Shop_Img_ID: int