from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.category as crud_category
from models.category import Get_All_Category,Create_New_Category


SessionDep = Annotated[Session, Depends(get_session)]
router = APIRouter(
    prefix = "/category",
    tags = ["category"]
)

@router.get('/', response_model=List[Get_All_Category])
def read_ALlCategory(session: SessionDep):
    return crud_category.get_AllCategory(session)

@router.post('/NewCategory', response_model=Get_All_Category)
def create_NewCategory(session: SessionDep, category : Create_New_Category):
    return crud_category.create_NewCategory(session, category)