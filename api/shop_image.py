from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from models.shop_image import ShopImageRead 
from typing import Annotated
from sqlmodel import Session
from database import get_session
import crud.shop_image as crud_shop_image 
import os
import uuid

from security import get_current_user
from models.user import User

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)] 

UPLOAD_FOLDER = "static/images/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter(
    prefix="/shops", 
    tags=["Shop Image (Protected)"]
)

@router.get("/my/shop-image", response_model=ShopImageRead)
def get_my_shop_cover_image(
    session: SessionDep, 
    current_user: CurrentUser
):

    if not current_user.shops:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User does not own a shop"
        )
    
    my_shop_id = current_user.shops.Shop_ID
    
    image = crud_shop_image.get_shop_cover_image(
        db=session, 
        shop_id=my_shop_id
    )
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Shop cover image not found"
        )
        
    return image

@router.put("/my/shop-image", response_model=ShopImageRead)
def upload_my_shop_cover_image(
    session: SessionDep, 
    current_user: CurrentUser,
    file: Annotated[UploadFile, File(description="อัปโหลดภาพปกร้านค้า (รูปเดียว)")]
):

    
    if not current_user.shops:
        raise HTTPException(status_code=404, detail="User does not own a shop")
    
    my_shop_id = current_user.shops.Shop_ID

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")

    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    img_src = f"/{file_path.replace(os.path.sep, '/')}" 
    
    try:
        new_image = crud_shop_image.set_shop_cover_image(
            session, my_shop_id, current_user.User_ID, img_src
        )
        return new_image
    except ValueError as ve: 
        os.remove(file_path) 
        raise HTTPException(status_code=400, detail=str(ve))
    except PermissionError as pe: 
        os.remove(file_path) 
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        os.remove(file_path) 
        raise HTTPException(status_code=500, detail=f"Failed to save image record: {str(e)}")