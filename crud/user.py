from sqlmodel import Session, select
from models.user import User, UserCreate, UserUpdate
from passlib.context import CryptContext
from typing import List, Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(session: Session, username: str) -> Optional[User]:
    return session.exec(select(User).where(User.Username == username)).first()

def create_user(session: Session, user_create: UserCreate) -> User:
    hashed_password = pwd_context.hash(user_create.Password)
    user_data = user_create.model_dump(exclude={"Password"}) 
    db_user = User(**user_data, Password=hashed_password)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_users(session: Session) -> List[User]:
    return session.exec(select(User)).all()

def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = session.get(User, user_id)
    if not db_user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    if "Password" in update_data:
        hashed_password = pwd_context.hash(update_data["Password"])
        update_data["Password"] = hashed_password
    for key, value in update_data.items():
        setattr(db_user, key, value)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def delete_user(session: Session, user_id: int) -> Optional[User]:
    db_user = session.get(User, user_id)
    if not db_user:
        return None
    session.delete(db_user)
    session.commit()
    return db_user
