from __future__ import annotations
from sqlmodel import SQLModel, table, Field, Relationship
from typing import Optional,TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING :
    from .user import User

class UserAddressBase(SQLModel):
    Province : str = Field(max_length=100)
    Amphor : str = Field(max_length=100)
    Tumbon : str = Field(max_length=100)
    Soi : str = Field(max_length=100)
    Road : str = Field(max_length=100)
    Optional_Detail : str = Field()
    Address_Number : str = Field(max_length=100)
    User_ID : int = Field(foreign_key="user.User_ID")

class UserAddress(UserAddressBase,table= True):
    __tablename__ = "useraddress"
    User_Address_ID : int = Field(primary_key = True)
    user : Mapped[Optional["User"]] = Relationship(sa_relationship=relationship(back_populates="useraddresses"))