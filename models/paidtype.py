from sqlmodel import SQLModel,Field, table, Relationship
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING:
    from .order import Order

#Create Base class
class PaidTypeBase(SQLModel):
    Name_Type : str = Field(max_length=100, min_length=1)
    Payment_Detail : Optional[str] = Field(max_length=100, default=None)

#Create table
class PaidType(PaidTypeBase, table= True):
    __tablename__ = "paidtype"
    Paid_Type_ID : Optional[int] | None = Field(primary_key=True,default=None)
    order : Mapped[Optional["Order"]] = Relationship(sa_relationship= relationship(back_populates="paidtype"))


#Read all type
class PaidTypeReadAll(PaidTypeBase):
    pass
