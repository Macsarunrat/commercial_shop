# from sqlmodel import SQLModel, Session, select



# def read_shop_product(db : Session, shop_id: int ) -> List[Sell]:
#     statement = select(Sell).where(Sell.Shop_ID == shop_id).join(Sell.product)
#     result = db.exec(statement).all()
#     return result