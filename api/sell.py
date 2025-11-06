from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.sell as crud_sell
from models.sell import SellCreate, SellRead

router = APIRouter(
    prefix="/sell",
    tags=["Sell (Items for Sale)"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.post("/", response_model=SellRead)
def create_new_sell_item(session: SessionDep, sell_data: SellCreate):

    try:
        sell_item = crud_sell.create_sell_item(session, sell_data)
        return sell_item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{sell_id}", response_model=SellRead)
def read_sell_item(session: SessionDep, sell_id: int):
 
    sell_item = crud_sell.get_sell_item(session, sell_id)
    if not sell_item:
        raise HTTPException(status_code=404, detail="Sell item not found")
    return sell_item