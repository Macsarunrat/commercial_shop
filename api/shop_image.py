from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from models.shop_image import ShopImageRead # 👈 (Response Model จากตารางใหม่)
from typing import Annotated
from sqlmodel import Session
from database import get_session
import crud.shop_image as crud_shop_image # 👈 (CRUD ใหม่)
import os
import uuid

# 1. Import "ยาม"
from security import get_current_user
from models.user import User

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)] # 2. สร้าง Alias

# 3. ⭐️ ใช้ Folder เดียวกันตามที่คุณต้องการ ⭐️
UPLOAD_FOLDER = "static/images/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter(
    prefix="/shops", # 4. ใช้ prefix ของ shop
    tags=["Shop Image (Protected)"]
)

# 5. สร้าง Endpoint ใหม่ (ใช้ PUT เพราะเป็นการ "แทนที่" รูปเดียว)
@router.put("/my/cover-image", response_model=ShopImageRead)
def upload_my_shop_cover_image(
    session: SessionDep, 
    current_user: CurrentUser, # 👈 6. เอา User จาก Token
    file: Annotated[UploadFile, File(description="อัปโหลดภาพปกร้านค้า (รูปเดียว)")]
):
    """
    API: (เจ้าของร้าน) อัปโหลด/เปลี่ยน ภาพปกร้านค้า (ของฉัน)
    (ระบบจะหา Shop_ID จาก Token)
    """
    
    # 7. ⭐️ Authorization: ตรวจสอบว่า User มีร้านค้าหรือไม่
    if not current_user.shops:
        raise HTTPException(status_code=404, detail="User does not own a shop")
    
    my_shop_id = current_user.shops.Shop_ID

    # 8. ตรวจสอบไฟล์ (เหมือนโค้ดเดิมของคุณ)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")

    # 9. ⭐️ ตรรกะบันทึกไฟล์ (เหมือนโค้ดเดิมของคุณ) ⭐️
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # (เปลี่ยน os.path.sep (เช่น \) ให้เป็น / สำหรับ URL)
    img_src = f"/{file_path.replace(os.path.sep, '/')}" 
    
    # 10. บันทึก C:\Users\Sarunrat\Desktop\Shopee project\commercial_shop\static\images\83e08f51950e413083d8e58f28c292e4.jpgลง DB (เรียก CRUD ใหม่)
    try:
        new_image = crud_shop_image.set_shop_cover_image(
            session, my_shop_id, current_user.User_ID, img_src
        )
        return new_image
    except ValueError as ve: # Shop not found
        os.remove(file_path) # (ลบไฟล์ที่อัปโหลดทิ้ง ถ้า DB พลาด)
        raise HTTPException(status_code=400, detail=str(ve))
    except PermissionError as pe: # ไม่ใช่เจ้าของ
        os.remove(file_path) 
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        os.remove(file_path) 
        raise HTTPException(status_code=500, detail=f"Failed to save image record: {str(e)}")