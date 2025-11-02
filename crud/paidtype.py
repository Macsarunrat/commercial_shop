from sqlmodel import SQLModel,Session, select
from typing import List
from models.paidtype import PaidType

def read_all_paidtype(db: Session) ->List[PaidType]:
    statement = select(PaidType)
    result = db.exec(statement)
    return result.all()