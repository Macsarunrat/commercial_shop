from __future__ import annotations
from sqlmodel import SQLModel, Field, table , Relationship
from datetime import datetime, timezone , timedelta
from typing import Optional,List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy import DECIMAL, Column, DateTime
from decimal import Decimal
from models.orderitems import OrderItemPublic
from models.user_address import UserAddressRead

if TYPE_CHECKING:
    from .paidtype import PaidType
    from .orderitems import OrderItems
    from .user import User
    from .shoporders import ShopOrders


THAI_TZ = timezone(timedelta(hours=7))

#Create Base model
class OrderBase(SQLModel):
    Order_Date : datetime = Field(default=lambda : datetime.now(THAI_TZ),sa_column=Column(DateTime(timezone=True)))
    Total_Price : Decimal = Field(sa_column=Column(DECIMAL(10,2)))
    Paid_Status : str = Field(max_length=100,min_length=1)
    Total_Weight : Decimal = Field(sa_column=DECIMAL(5,2))
    Ship_Cost: Decimal = Field(sa_column=Column(DECIMAL(10,2)))

    User_ID: int = Field(foreign_key="users.User_ID")
    Paid_Type_ID: int = Field(foreign_key="paidtype.Paid_Type_ID")
    
#Create table
class Order(OrderBase, table=True):
    __tablename__ = "orders"
    Order_ID : Optional[int] = Field(primary_key=True,default=None)
    #User_ID : int = Field(foreign_key="user.User_ID")
    Paid_Type_ID : int = Field(foreign_key = "paidtype.Paid_Type_ID")
    paidtype : Mapped[Optional["PaidType"]] = Relationship(sa_relationship= relationship(back_populates= "order"))
    orderitems : Mapped[List["OrderItems"]] = Relationship(sa_relationship= relationship(back_populates="order"))
    user: Mapped["User"] = Relationship(sa_relationship=relationship(back_populates="orders"))
    shoporders: Mapped[List["Shop_Orders"]] = Relationship(sa_relationship=relationship(back_populates="order"))

class OrderRead(OrderBase):
    Order_ID: int

class OrderCreate(OrderBase):
    pass

class OrderSummary(SQLModel):
    Order_ID: int
    Order_Date: datetime
    Total_Price: Decimal
    Paid_Status: str

class OrderDetailsPublic(OrderSummary):
    Total_Weight: Decimal
    Ship_Cost: Decimal
    Paid_Type_ID: int
    
    Items: List[OrderItemPublic] = []

    Shipping_Address: Optional[UserAddressRead] = None