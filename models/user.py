from __future__ import annotations
from sqlmodel import SQLModel,Field, table, Relationship
from typing import Optional,TYPE_CHECKING,List
from sqlalchemy.orm import relationship, Mapped

if TYPE_CHECKING :
    from .useraddress import UserAddress
    from .shop import Shop
    from .cart import Cart
    from .order import Order

class UserBase(SQLModel):
    Username : str = Field(max_length=100, min_length=1)
    Password : str = Field(max_length=255)
    Name : str = Field(max_length=100, min_length=1)
    Email : str = Field(max_length =100, min_length=1)
    Phone : str = Field(max_length=20)
    


class User(UserBase, table = True):
    __tablename__ = "user"
    User_ID : Optional[int] = Field(primary_key= True, default= None)
    
User.useraddress = Relationship(sa_relationship=relationship(back_populates="user"))
User.shop = Relationship(sa_relationship=relationship(back_populates="user"))
User.cart = Relationship(sa_relationship=relationship(back_populates="user"))
User.order = Relationship(sa_relationship=relationship(back_populates="user"))