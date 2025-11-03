from __future__ import annotations
from sqlmodel import SQLModel,table,Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, relationship  # Add these

if TYPE_CHECKING:
    from .products import Products

#Catagory BaseModel
class CategoryBase(SQLModel):
    Category_Name : str = Field(index=True,max_length=100,min_length=1)
    
#Catagory Model
class Category(CategoryBase, table= True):
    __tablename__ = "category"
    Category_ID : Optional[int] = Field(primary_key=True,default=None)
    products : Mapped[List["Products"]]= Relationship(sa_relationship=relationship(back_populates="category"))  # Fixed typo: was "catagor"


#Create New Catagory
class Create_New_Category(CategoryBase):
    Category_Name : str

#Get All Catagory
class Get_All_Category(CategoryBase):
    Category_ID : int
    Category_Name : str

class CategoryRead(CategoryBase):
    Category_ID: int

class CategoryCreate(CategoryBase):
    pass
