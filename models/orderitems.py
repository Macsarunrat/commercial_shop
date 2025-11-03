from sqlmodel import SQLModel, Field, DECIMAL, table, Relationship
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy import Column, DateTime
from decimal import Decimal
from typing import Optional
from models.sell import ItemPublic

if TYPE_CHECKING:
    from .order import Orders
    from .sell import Sell

#Create Base Class 
class OrderItemsBase(SQLModel):
    Quantity : int
    Price_At_Purchase : Decimal = Field(sa_column=Column(DECIMAL(10,2)))

    Order_ID: int = Field(foreign_key="orders.Order_ID")
    Sell_ID: int = Field(foreign_key="sell.Sell_ID")

class OrderItems(OrderItemsBase, table= True):
    __tablename__ = "orderitems"
    OrderItems_ID : Optional[int] = Field(primary_key=True,default=None)
    Order_ID : int = Field(foreign_key="orders.Order_ID")
    #Sell_ID : int = Field(foreign_key="sell.Sell_ID")
    order : Mapped[Optional["Order"]] = Relationship(sa_relationship= relationship(back_populates="orderitems"))
    sell_item: Mapped["Sell"] = Relationship(sa_relationship=relationship(back_populates="order_items"))

class OrderItemsRead(OrderItemsBase):
    OrderItem_ID: int

class OrderItemPublic(SQLModel):
    Quantity: int
    Price_At_Purchase: Decimal
    ItemDetails: Optional[ItemPublic] = None