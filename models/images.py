from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship  # Add these

if TYPE_CHECKING:
    from .products import Products

#Image BaseModel
class ImageBase(SQLModel):
    IsCover : bool
    Img_Src : str = Field(max_length=200)
    Product_ID: int = Field(foreign_key="products.Product_ID")

#Image model
class Image(ImageBase, table=True):
    __tablename__ = "images"
    Img_ID : Optional[int] = Field(primary_key=True)
    Product_ID : Optional[int] = Field(foreign_key="products.Product_ID")
    products : Mapped[Optional["Products"]]= Relationship(sa_relationship=relationship(back_populates= "images"))

#Read Image
class ImageRead(ImageBase):
    Img_ID : int
    Product_ID : int
    IsCover : bool
    Img_Src : str

#Upload Image
class ImageUpload(ImageBase):
    Iscover : bool
    Img_Src : int
    Product_ID : int

class ImageRead(ImageBase):
    Img_ID: int
