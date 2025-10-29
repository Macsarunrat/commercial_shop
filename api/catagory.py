from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Annotated, List
from database import get_session
import crud.catagory as crud_catagory
from models.catagory import Get_All_Catagory,Create_New_Catagory


SessionDep = Annotated[Session, Depends(get_session)]
router = APIRouter(
    prefix = "/catagory",
    tags = ["catagory"]
)

@router.get('/', response_model=List[Get_All_Catagory])
def read_ALlCatagory(session: SessionDep):
    return crud_catagory.get_AllCatagory(session)

@router.post('/NewCatagory', response_model=Get_All_Catagory)
def create_NewCatagory(session: SessionDep, catagory : Create_New_Catagory):
    return crud_catagory.create_NewCatagory(session, catagory)