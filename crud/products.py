from sqlmodel import Session, select
from models.products import Products, CreateProduct
from typing import List

def get_AllProduct(db:Session) -> List[Products]:
    statement = select(Products)
    result = db.exec(statement).all()
    return result

def create_NewProduct(db: Session,product : CreateProduct) -> Products:
    db_product = Products.model_validate(product)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
