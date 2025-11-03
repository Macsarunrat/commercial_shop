from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING:
    from .user import User

class UserAddressBase(SQLModel):
    Province: Optional[str] = Field(default=None, max_length=100)
    Amphur: Optional[str] = Field(default=None, max_length=100)
    Tumbon: Optional[str] = Field(default=None, max_length=100)
    Soi: Optional[str] = Field(default=None, max_length=100)
    Road: Optional[str] = Field(default=None, max_length=100)
    Optional_Detail: Optional[str] = Field(default=None, max_length=255)
    Address_Number: Optional[str] = Field(default=None, max_length=50)
    
    User_ID: int = Field(foreign_key="users.User_ID")

class User_Address(UserAddressBase, table=True):
    __tablename__ = "user_address"
    User_Address_ID: Optional[int] = Field(primary_key=True, default=None)
    
    # Relationship
    user: Mapped["User"] = Relationship(sa_relationship=relationship(back_populates="addresses"))

class UserAddressRead(UserAddressBase):
    User_Address_ID: int

class UserAddressCreate(UserAddressBase):
    pass

# Model สำหรับรับ Body ตอนสร้าง (ไม่เอา User_ID)
class UserAddressCreateBody(UserAddressBase):
    pass

# Model สำหรับรับ Body ตอนอัปเดต (ไม่เอา User_ID)
class UserAddressUpdateBody(SQLModel):
    Province: Optional[str] = None
    Amphor: Optional[str] = None
    Tumbon: Optional[str] = None
    Soi : Optional[str] = None
    Road: Optional[str] = None
    Optional_detail: Optional[str] = None
    Address_Number : Optional[str] = None
    # ... (fields ที่อนุญาตให้อัปเดต)