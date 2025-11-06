from sqlmodel import Session, select
from models.user import User, UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def create_user(db: Session, user_create: UserCreate) -> User:

    statement_user = select(User).where(User.Username == user_create.Username)
    statement_email = select(User).where(User.Email == user_create.Email)
    
    if db.exec(statement_user).first() or db.exec(statement_email).first():
        raise ValueError("Username or Email already registered")

    hashed_password = get_hashed_password(user_create.Password)
    
    user_data = user_create.model_dump(exclude={"Password"})
    new_user = User(**user_data, Password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


from sqlmodel import Session, select
from models.user import User, UserCreate
from passlib.context import CryptContext
from jose import JWTError, jwt  
from datetime import datetime, timedelta, timezone
from config import settings 

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.Username == username)
    return db.exec(statement).first()

def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.Password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt