from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Annotated,List
from database import get_session
from models.paidtype import PaidTypeReadAll
import crud.paidtype as crud_paidtype


SessionDep = Annotated[Session , Depends(get_session) ] 

router = APIRouter(
    prefix="/paidtype",
    tags=["paidtype"]
)

@router.get("/", response_model= List[PaidTypeReadAll])
def read_all_paidtype(session: SessionDep):
    return crud_paidtype.read_all_paidtype(session)