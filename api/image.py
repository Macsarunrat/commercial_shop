from fastapi import APIRouter, Depends, Form
from models.images import ImageRead
from typing import List, Annotated
from sqlmodel import Session
from database import get_session
import crud.images as crud_images
import os

SessionDep = Annotated[Session, Depends(get_session)]

UPLOAD_FOLDER = "static/images/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter(
    prefix = "/image",
    tags = ["image"]
)

@router.get("/", response_model = List[ImageRead])
def read_image(session : SessionDep):
    return crud_images.read_images(session)


@router.post("/product/{product_id}/upload/image", response_model = ImageRead)
def create_image(session: SessionDep, product_id : int, IsCover: Annotated[bool, Form()]= False, file: Annotated[UploadFile, None]= False):

