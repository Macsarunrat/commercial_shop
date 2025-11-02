from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from sqlalchemy import ForeignKeyConstraint, UniqueConstraint
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from sqlalchemy import ForeignKeyConstraint, UniqueConstraint



class ShopBase(SQLModel):
    Shop_Name: str = Field(max_length=100)
    Shop_Phone: str = Field(max_length=20)


class Shop(ShopBase, table=True):
    __tablename__ = "Shop"
    Shop_ID: Optional[int] = Field(default=None, primary_key=True)
    User_ID: Optional[int] = Field(default=None, foreign_key="User.User_ID")

    user: Optional["User"] = Relationship(back_populates="shop")
    sell_items: List["Sell"] = Relationship(back_populates="shop")
    order_links: List["Shop_Orders"] = Relationship(back_populates="shop")

    __table_args__ = (
        ForeignKeyConstraint(
            ["User_ID"], ["User.User_ID"], name="fk_shop_user"
        ),
        UniqueConstraint("User_ID", name="uq_shop_user_id")
    )


class ShopCreate(ShopBase):
    User_ID: int


class ShopRead(ShopBase):
    Shop_ID: int
    User_ID: int


class ShopUpdate(SQLModel):
    Shop_Name: Optional[str] = Field(default=None, max_length=100)
    Shop_Phone: Optional[str] = Field(default=None, max_length=20)
