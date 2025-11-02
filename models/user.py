from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from .user_address import UserAddress
from .shop import Shop
from .cart import Cart
from .orders import Orders


class UserBase(SQLModel):
    Username: str = Field(max_length=100, index=True, unique=True)
    Name: str = Field(max_length=100)
    Email: str = Field(max_length=100)
    Phone: str = Field(max_length=20)


class User(UserBase, table=True):
    __tablename__ = "User"
    User_ID: Optional[int] = Field(default=None, primary_key=True)
    Password: str = Field(max_length=255)

    addresses: List[UserAddress] = Relationship(back_populates="user")
    shop: List["Shop"] = Relationship(back_populates="user")
    cart_items: List["Cart"] = Relationship(back_populates="user")
    orders: List["Orders"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    Password: str


class UserRead(UserBase):
    User_ID: int


class UserUpdate(SQLModel):
    Username: Optional[str] = Field(default=None, max_length=100)
    Name: Optional[str] = Field(default=None, max_length=100)
    Email: Optional[str] = Field(default=None, max_length=100)
    Phone: Optional[str] = Field(default=None, max_length=20)
    Password: Optional[str] = Field(default=None)
