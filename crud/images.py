from sqlmodel import SQLModel, Session, select
from models.images import ImageRead,Image
from typing import List

def read_images(db : Session) -> List[ImageRead]:
    statement = select(Image)
    result = db.exec(statement)
    return result.all()