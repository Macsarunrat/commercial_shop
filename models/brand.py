from __future__ import annotations
from sqlmodel import SQLModel,Field, Relationship,table
from typing import List,TYPE_CHECKING
from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from .products import Products


#Base Model
class BrandBase(SQLModel):
    Brand_Name : str = Field(max_length=100, min_length=1, index=True)


#Brand table model
class Brand(BrandBase, table = True):
    __tablename__ = "brand"
    Brand_ID : int = Field(primary_key= True, default=None)
    products : List["Products"] = Relationship(sa_relationship=relationship(back_populates="brand"))


#Get All Brand
class Get_All_Brand(BrandBase):
    Brand_ID : int
    Brand_Name : str

#Create New Brand
class BrandCreate(BrandBase):
    pass