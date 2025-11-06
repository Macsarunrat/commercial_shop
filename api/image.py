# api/images.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from models.images import ImageRead
from typing import List, Annotated
from sqlmodel import Session
from database import get_session
import crud.images as crud_images
import os
import uuid
import aiofiles  # 1. Import aiofiles

SessionDep = Annotated[Session, Depends(get_session)]

UPLOAD_FOLDER = "static/images/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter(
    prefix="/image",
    tags=["image"]
)

@router.get("/", response_model=List[ImageRead])
def read_image(session: SessionDep):
    # ฟังก์ชันนี้เป็น Sync OK ไม่มีปัญหา
    return crud_images.read_images(session)


# 2. เปลี่ยนเป็น async def
@router.post("/product/{product_id}", response_model=ImageRead)
async def create_cover_image(
    session: SessionDep, 
    product_id: int, 
    file: Annotated[UploadFile, File(description="upload single cover image")]
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")

    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        # 3. เปลี่ยนมาใช้ aiofiles แบบ async
        async with aiofiles.open(file_path, "wb") as buffer:
            content = await file.read()  # อ่านไฟล์แบบ async
            await buffer.write(content)  # เขียนไฟล์แบบ async
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    img_src = f"/{file_path}"
    
    try:
        # ส่วนนี้ยังคงเป็น Sync DB Call ซึ่งโอเคสำหรับตอนนี้
        new_image = crud_images.upload_cover_image(session, product_id, img_src)
        return new_image
    except ValueError as ve:
        os.remove(file_path) # จัดการ Error ยอดเยี่ยมเหมือนเดิม
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        os.remove(file_path) # จัดการ Error ยอดเยี่ยมเหมือนเดิม
        raise HTTPException(status_code=500, detail=f"Failed to upload cover image: {str(e)}")

# 4. เปลี่ยนเป็น async def
@router.post("/products/{product_id}", response_model=List[ImageRead])
async def create_images(
    session: SessionDep, 
    product_id: int, 
    files: Annotated[List[UploadFile], File(description="upload multiple images")]
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    if len(files) > 10:  
        raise HTTPException(status_code=400, detail="Too many files. Maximum 10 allowed.")
    
    img_srcs = []
    save_files = []
    
    try:
        for file in files:
            if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
                raise ValueError("Invalid file type. Only images allowed.")
            
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            # 5. เปลี่ยนมาใช้ aiofiles แบบ async
            async with aiofiles.open(file_path, "wb") as buffer:
                content = await file.read()  # อ่านไฟล์แบบ async
                await buffer.write(content)  # เขียนไฟล์แบบ async

            img_src = f"/{file_path}"
            img_srcs.append(img_src)
            save_files.append(file_path)

    except Exception as e:
        for path in save_files:
            os.remove(path)
        raise HTTPException(status_code=500, detail=f"Failed to save files: {str(e)}")
    
    try:
        # ส่วนนี้ยังคงเป็น Sync DB Call
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