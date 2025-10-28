from sqlmodel import create_engine,SQLModel,Session
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://username:password@localhost:3306/database_name"
)

engine = create_engine(DATABASE_URL,echo=True)

def create_db_and_table():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session