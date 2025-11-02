from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from sqlalchemy import ForeignKeyConstraint
from .user import User



class UserAddressBase(SQLModel):
    Province: str = Field(max_length=100)
    Amphor: str = Field(max_length=100)
    Tumbon: str = Field(max_length=100)
    Soi: Optional[str] = Field(default=None, max_length=100)
    Road: Optional[str] = Field(default=None, max_length=100)
    Optional_detail: Optional[str] = None
    Address_Number: Optional[str] = Field(default=None, max_length=50)


class UserAddress(UserAddressBase, table=True):
    __tablename__ = "User_Address"
    User_Address_ID: Optional[int] = Field(default=None, primary_key=True)
    User_ID: Optional[int] = Field(default=None, foreign_key="User.User_ID")
    
    user: Optional["User"] = Relationship(back_populates="addresses")

    __table_args__ = (
        ForeignKeyConstraint(
            ["User_ID"], ["User.User_ID"], name="fk_useraddress_user"
        ),
    )


class AddressRead(UserAddressBase):
    User_Address_ID: int
    User_ID: int


class AddressCreate(UserAddressBase):
    pass
