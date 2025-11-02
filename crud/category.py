from sqlmodel import Session, select
from models.category import Category, Create_New_Category
from typing import List


def create_NewCategory(db: Session, category: Create_New_Category ) -> Category:
    db_catagory = Category.model_validate(category)
    db.add(db_catagory)
    db.commit()
    db.refresh(db_catagory)
    return db_catagory

def get_AllCategory(db: Session) -> List[Category]:
    statement = select(Category)
    result = db.exec(statement)
    return result.all()

# #read_by_category
# def get_product_by_category(db: Session, catagory_id : int) -> List[Catagory]:
#     statement = select(Catagory).where(Catagory.Catagory_ID == catagory_id).join(Catagory.products)
