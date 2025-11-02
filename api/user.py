from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from models.user import UserRead, UserCreate, UserUpdate
from crud import user
from database import get_session

router = APIRouter()

@router.post("/users/", response_model=UserRead, tags=["Users"])
def api_create_user(user_create: UserCreate, session: Session = Depends(get_session)):
    db_user = user.get_user_by_username(session, username=user_create.Username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return user.create_user(session=session, user_create=user_create)

@router.get("/users/", response_model=List[UserRead], tags=["Users"])
def api_read_users(session: Session = Depends(get_session)):
    return user.get_users(session=session)

@router.put("/users/{user_id}", response_model=UserRead, tags=["Users"])
def api_update_user(user_id: int, user_update: UserUpdate, session: Session = Depends(get_session)):
    db_user = user.update_user(session=session, user_id=user_id, user_update=user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/users/{user_id}", response_model=UserRead, tags=["Users"])
def api_delete_user(user_id: int, session: Session = Depends(get_session)):
    db_user = user.delete_user(session=session, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
