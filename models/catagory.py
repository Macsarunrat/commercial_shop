from __future__ import annotations
from sqlmodel import SQLModel,table,Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, relationship  # Add these

if TYPE_CHECKING:
    from .products import Products

#Catagory BaseModel
class CatagoryBase(SQLModel):
    Catagory_Name : str = Field(index=True,max_length=100,min_length=1)
    
#Catagory Model
class Catagory(CatagoryBase, table= True):
    __tablename__ = "catagory"
    Catagory_ID : Optional[int] = Field(primary_key=True,default=None)
    products : Mapped[List["Products"]]= Relationship(sa_relationship=relationship(back_populates="catagory"))  # Fixed typo: was "catagor"


#Create New Catagory
class Create_New_Catagory(CatagoryBase):
    Catagory_Name : str

#Get All Catagory
class Get_All_Catagory(CatagoryBase):
    Catagory_ID : int
    Catagory_Name : str
    