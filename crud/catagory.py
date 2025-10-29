from sqlmodel import Session, select
from models.catagory import Catagory, Create_New_Catagory
from typing import List


def create_NewCatagory(db: Session, catagory: Create_New_Catagory ) -> Catagory:
    db_catagory = Catagory.model_validate(catagory)
    db.add(db_catagory)
    db.commit()
    db.refresh(db_catagory)
    return db_catagory

def get_AllCatagory(db: Session) -> List[Catagory]:
    statement = select(Catagory)
    result = db.exec(statement)
    return result.all()
