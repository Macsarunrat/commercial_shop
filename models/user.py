from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING:
    from .user_address import User_Address
    from .shop import Shop
    from .cart import Cart
    from .order import Order

class UserBase(SQLModel):
    Username: str = Field(index=True, unique=True, max_length=100)
    Name: str = Field(max_length=100)
    Email: str = Field(unique=True, index=True, max_length=100)
    Photo: Optional[str] = Field(default=None, max_length=255)

class User(UserBase, table=True):
    __tablename__ = "users"
    User_ID: Optional[int] = Field(primary_key=True, default=None)
    Password: str = Field() # ERD ใช้ Password (ควรเก็บ Hashed)
    
    # Relationships
    addresses: Mapped[List["User_Address"]] = Relationship(sa_relationship=relationship(back_populates="user"))
    cart_items: Mapped[List["Cart"]] = Relationship(sa_relationship=relationship(back_populates="user"))
    shops: Mapped[List["Shop"]] = Relationship(sa_relationship=relationship(back_populates="user"))
    orders: Mapped[List["Order"]] = Relationship(sa_relationship=relationship(back_populates="user"))

class UserRead(UserBase):
    User_ID: int

class UserCreate(UserBase):
    Password: str