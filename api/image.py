from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from models.images import ImageRead
from typing import List, Annotated
from sqlmodel import Session
from database import get_session
import crud.images as crud_images
import os
import uuid

SessionDep = Annotated[Session, Depends(get_session)]

UPLOAD_FOLDER = "static/images/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter(
    prefix="/image",  # ถ้าต้องการเปลี่ยนเป็น "/products" เพื่อเข้ากับ design ก่อนหน้า เปลี่ยนที่นี่
    tags=["image"]
)

@router.get("/", response_model=List[ImageRead])
def read_image(session: SessionDep):
    return crud_images.read_images(session)

#get image depend on shop
# @router.get("/{shop_id}/images")
# def get_image_by_shop(session:SessionDep,shop_id: int)

#get image depend on order

#get image depend on cart

@router.post("/{product_id}/cover-image", response_model=ImageRead)
def create_cover_image(session: SessionDep, product_id: int, file: Annotated[UploadFile, File(description="upload single cover image")]):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Validation: Check file type
    if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")
    
    # Generate unique image name
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    img_src = f"/{file_path}"
    
    # Insert db
    try:
        new_image = crud_images.upload_cover_image(session, product_id, img_src)
        return new_image
    except ValueError as ve:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload cover image: {str(e)}")
    
@router.post("/{product_id}/images", response_model=List[ImageRead])
def create_images(session: SessionDep, product_id: int, files: Annotated[List[UploadFile], File(description="upload multiple images")]):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    if len(files) > 10:  # Limit to prevent overload
        raise HTTPException(status_code=400, detail="Too many files. Maximum 10 allowed.")
    
    img_srcs = []
    save_files = []  # ชื่อ save_files → saved_files เพื่อชัดเจน
    
    try:
        for file in files:
            # Validation: Check file type
            if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
                raise ValueError("Invalid file type. Only images allowed.")
            
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())
            img_src = f"/{file_path}"
            img_srcs.append(img_src)
            save_files.append(file_path)
    except Exception as e:
        for path in save_files:
            os.remove(path)
        raise HTTPException(status_code=500, detail=f"Failed to save files: {str(e)}")  # เปลี่ยนเป็น 500
    
    # Insert to db
    try:
        new_images = crud_images.create_non_cover_image(session, product_id, img_srcs)
        return new_images
    except ValueError as ve:
        for path in save_files:
            os.remove(path)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        for path in save_files:
            os.remove(path)
        raise HTTPException(status_code=500, detail=f"Failed to upload images: {str(e)}")