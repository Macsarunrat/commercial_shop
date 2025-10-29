from sqlmodel import SQLModel, Session, select
from models.brand import Brand,BrandCreate
from typing import List


def get_AllBrand(db : Session) -> List[Brand]:
    statement = select(Brand)
    result = db.exec(statement)
    return result.all()

def create_brand(db: Session, brand : BrandCreate) -> Brand:
    db_brand = Brand.model_validate(brand)
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand
    