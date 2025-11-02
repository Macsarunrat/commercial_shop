from sqlmodel import SQLModel, Field, table , Relationship
from datetime import datetime, timezone , timedelta
from typing import Optional,List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy import DECIMAL, Column, DateTime
from decimal import Decimal

if TYPE_CHECKING:
    from .paidtype import PaidType
    from .orderitems import OrderItems


THAI_TZ = timezone(timedelta(hours=7))

#Create Base model
class OrderBase(SQLModel):
    Order_Date : datetime = Field(default=lambda : datetime.now(THAI_TZ),sa_column=Column(DateTime(timezone=True)))
    Total_Price : Decimal = Field(sa_column=Column(DECIMAL(10,2)))
    Paid_Status : str = Field(max_length=100,min_length=1)
    Total_Weight : Decimal = Field(sa_column=DECIMAL(5,2))
    Ship_Cost: Decimal = Field(sa_column=Column(DECIMAL(10,2)))
    
#Create table
class Order(OrderBase, table=True):
    __tablename__ = "orders"
    Order_ID : Optional[int] = Field(primary_key=True,default=None)
    #User_ID : int = Field(foreign_key="user.User_ID")
    Paid_Type_ID : int = Field(foreign_key = "paidtype.Paid_Type_ID")
    paidtype : Mapped[Optional["PaidType"]] = Relationship(sa_relationship= relationship(back_populates= "order"))
    orderitems : Mapped[List["OrderItems"]] = Relationship(sa_relationship= relationship(back_populates="order"))
    

