from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Annotated,List
from database import get_session
import crud.brand as crud_brand
from models.brand import Get_All_Brand, BrandCreate

router = APIRouter(
    prefix = "/brand",
    tags = ["brand"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get('/',response_model = List[Get_All_Brand])
def read_Brand(session: SessionDep):
    return crud_brand.get_AllBrand(session)

@router.post('/new/product', response_model= Get_All_Brand)
def create_Brand(session: SessionDep, brand : BrandCreate ):
    return crud_brand.create_brand(session,brand)