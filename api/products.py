from fastapi import APIRouter, Depends
from typing import List,Annotated
from models.products import AllProduct, CreateProduct
from sqlmodel import Session
from database import get_session
import crud.products as crud_product

router = APIRouter(
    prefix = "/products",
    tags = ["Product"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/",response_model = List[AllProduct])
def read_all_product(session : SessionDep):
    return crud_product.get_AllProduct(session)

@router.post("/NewProduct", response_model= AllProduct)
def create_new_product(session: SessionDep, product : CreateProduct):
    return crud_product.create_NewProduct(session,product)