from sqlmodel import Session, select
from models.user import User, UserCreate
from passlib.context import CryptContext # <-- Import สำหรับ hash

# Setup password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def create_user(db: Session, user_create: UserCreate) -> User:
    """
    สร้าง User ใหม่ พร้อม hash รหัสผ่าน
    """
    # 1. ตรวจสอบว่า Username/Email ซ้ำหรือไม่
    statement_user = select(User).where(User.Username == user_create.Username)
    statement_email = select(User).where(User.Email == user_create.Email)
    
    if db.exec(statement_user).first() or db.exec(statement_email).first():
        raise ValueError("Username or Email already registered")

    # 2. Hash รหัสผ่าน
    hashed_password = get_hashed_password(user_create.Password)
    
    # 3. สร้าง User object ใหม่
    # (เราไม่สามารถ .model_validate(user_create) ตรงๆ ได้ เพราะ field 'Password' ไม่ตรงกัน)
    user_data = user_create.model_dump(exclude={"Password"})
    new_user = User(**user_data, Password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)