from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.user as crud_user
from models.user import UserCreate, UserRead # <-- Import Schemas

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.post("/", response_model=UserRead)
def register_user(session: SessionDep, user_data: UserCreate):
    """
    API: สมัครสมาชิก (สร้าง User ใหม่)
    """
    try:
        user = crud_user.create_user(session, user_data)
        # ตอบกลับเป็น UserRead (ที่ไม่มีรหัสผ่าน)
        return user 
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserRead)
def read_user(session: SessionDep, user_id: int):
    """
    API: ดึงข้อมูล User (เผื่อไว้ทดสอบ)
    """
    user = crud_user.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user