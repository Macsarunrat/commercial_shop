from __future__ import annotations
from sqlmodel import Field, SQLModel, Relationship, table
from typing import Optional, TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, relationship
from pydantic import ConfigDict

if TYPE_CHECKING:
    from .category import Catagory
    from .images import Image
    from .brand import Brand

# Product BaseModel
class ProductBase(SQLModel):
    Product_Name : str = Field(index=True, max_length=100, min_length=1)
    Catagory_ID : int = Field(foreign_key= "catagory.Catagory_ID")
    Brand_ID : int = Field(foreign_key = "brand.Brand_ID")

# Product table
class Products(ProductBase, table=True):
    model_config = ConfigDict(from_attributes=True)
    __tablename__ = "products"
    Product_ID : Optional[int] = Field(primary_key=True,default=None)
    category: Mapped[Optional["Category"]] = Relationship(sa_relationship=relationship(back_populates="products"))
    images: Mapped[List["Image"]] = Relationship(sa_relationship=relationship(back_populates="products"))
    brand : Mapped[Optional["Brand"]] = Relationship(sa_relationship = relationship(back_populates = "products"))

#Get all product
class AllProduct(ProductBase):
    Product_ID : int
    Product_Name : str
    Catagory_ID : int

#Create new product
class CreateProduct(ProductBase):
    Product_Name : str
    Catagory_ID : int