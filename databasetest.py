# import os
# from sqlmodel import create_engine, Session, SQLModel

# DB_USER = "testuser"
# DB_PASSWORD = "testpassword"
# DB_HOST = "127.0.0.1" 
# DB_PORT = "3306"      
# DB_NAME = "test_db" 

# mysql_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# engine = create_engine(mysql_url, echo=True)

# def create_db_and_tables():
#     # import models ทั้งหมดเพื่อให้ SQLModel รู้จัก
#     import models.category 
#     import models.products
#     import models.images
#     import models.brand 
#     import models.order
#     import models.paidtype
#     import models.orderitems
#     SQLModel.metadata.create_all(engine)

# def get_session():
#     with Session(engine) as session:
#         yield session