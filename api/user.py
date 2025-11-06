from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm  
from sqlmodel import Session
from typing import Annotated
from database import get_session
import crud.user as crud_user
from models.user import User, UserCreate, UserRead, Token  
from security import get_current_user 
from datetime import timedelta
from config import settings
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@router.post("/", response_model=UserRead)
def register_user(session: SessionDep, user_data: UserCreate):
    """
    API: สมัครสมาชิก (สร้าง User ใหม่)
    """
    try:
        user = crud_user.create_user(session, user_data)
        return user 
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.get("/{user_id}", response_model=UserRead)
# def read_user(session: SessionDep, user_id: int):
#     """
#     API: ดึงข้อมูล User (เผื่อไว้ทดสอบ)
#     """
#     user = crud_user.get_user(session, user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_session)
):
    user = crud_user.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crud_user.create_access_token(
        data={"sub": user.Username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class LogoutResponse(BaseModel):
    detail: str

@router.post("/logout", response_model=LogoutResponse)
def logout(
    current_user: Annotated[User, Depends(get_current_user)] 
):

    return {"detail": "Logged out successfully"}
