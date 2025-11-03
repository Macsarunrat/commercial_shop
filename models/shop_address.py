from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING:
    from .shop import Shop

class ShopAddressBase(SQLModel):
    Province: Optional[str] = Field(default=None, max_length=100)
    Amphur: Optional[str] = Field(default=None, max_length=100)
    Tumbon: Optional[str] = Field(default=None, max_length=100)
    Soi: Optional[str] = Field(default=None, max_length=100)
    Road: Optional[str] = Field(default=None, max_length=100)
    Optional_Detail: Optional[str] = Field(default=None, max_length=255)
    Address_Number: Optional[str] = Field(default=None, max_length=50)
    
    Shop_ID: int = Field(foreign_key="shop.Shop_ID", unique=True) # 1-to-1

class Shop_Address(ShopAddressBase, table=True):
    __tablename__ = "shop_address"
    Shop_Address_ID: Optional[int] = Field(primary_key=True, default=None)
    
    # Relationship
    shop: Mapped["Shop"] = Relationship(sa_relationship=relationship(back_populates="address")) # 1-to-1

class ShopAddressRead(ShopAddressBase):
    Shop_Address_ID: int
    Shop_ID: int

# Model สำหรับรับ Body ตอน POST (สร้างใหม่)
class ShopAddressCreate(ShopAddressBase):
    pass # (รับ fields จาก Base)

# Model สำหรับรับ Body ตอน PUT (อัปเดต)
class ShopAddressUpdate(SQLModel):
    # (ตั้งเป็น Optional ทั้งหมดสำหรับ PUT)
    Province: Optional[str] = None
    Amphur: Optional[str] = None
    Tumbon: Optional[str] = None
    Address_Number: Optional[str] = None
    Soi: Optional[str] = None
    Road: Optional[str] = None
    Optional_Detail: Optional[str] = None