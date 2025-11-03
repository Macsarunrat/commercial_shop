from __future__ import annotations
from sqlmodel import SQLModel, table, Field, Relationship
from typing import Optional,TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING :
    from .shop import Shop

class ShopAddressBase(SQLModel):
    Province : str = Field(max_length=100)
    Amphor : str = Field(max_length=100)
    Tumbon : str = Field(max_length=100)
    Soi : str = Field(max_length=100)
    Road : str = Field(max_length=100)
    Optional_Detail : str = Field()
    Address_Number : str = Field(max_length=100)
    Shop_ID : int = Field(foreign_key="shop.Shop_ID")

class ShopAddress(ShopAddressBase, table =True):
    __tablename__ = "shopaddress"
    Shop_Address_ID : int = Field(primary_key = True)
    
ShopAddress.shop = Relationship(sa_relationship=relationship(back_populates="shopaddress"))
