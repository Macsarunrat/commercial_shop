from sqlmodel import Session, select
from models.category import Category, Create_New_Category
from typing import List


def create_NewCetagory(db: Session, category: Create_New_Category ) -> Category:
    db_category = Category.model_validate(category)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_AllCategory(db: Session) -> List[Category]:
    statement = select(Category)
    result = db.exec(statement)
    return result.all()
