from sqlmodel import Session, select
from models.shop_address import Shop_Address, ShopAddressForm
from models.shop import Shop

def create_shop_address(db: Session, shop_id: int, address_data: ShopAddressForm) -> Shop_Address:
    """
    เพิ่มที่อยู่ให้กับร้านค้าที่มีอยู่
    """
    # 1. ตรวจสอบว่า Shop (ร้านแม่) มีอยู่จริง
    shop = db.get(Shop, shop_id)
    if not shop:
        raise ValueError(f"Shop with ID {shop_id} not found")

    # 2. ตรวจสอบว่าร้านนี้มีที่อยู่แล้วหรือยัง (เพราะเป็น 1-to-1)
    # (เราใช้ shop.address ที่เรา relationship ไว้)
    if shop.address:
        raise ValueError(f"Shop {shop_id} already has an address.")
        
    # 3. สร้าง Address object
    new_address = Shop_Address(
        **address_data.model_dump(),
        Shop_ID=shop_id # <-- เอา ID มาจาก URL path
    )
    
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address