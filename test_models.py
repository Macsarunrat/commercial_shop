import sys
from typing import Optional, List
from sqlmodel import SQLModel

# Test import ทีละ model
models_to_test = [
    ("models.brand", "Brand"),
    ("models.cart", "Cart"),
    ("models.catagory", "Catagory"),
    ("models.images", "Image"),
    ("models.order", "Order"),
    ("models.orderitems", "OrderItems"),
    ("models.paidtype", "PaidType"),
    ("models.products", "Products"),
    ("models.sell", "Sell"),
    ("models.shop", "Shop"),
    ("models.shopaddress", "ShopAddress"),
    ("models.shoporder", "ShopOrder"),
    ("models.user", "User"),
    ("models.useraddress", "UserAddress")
]

for module_name, class_name in models_to_test:
    try:
        module = __import__(module_name, fromlist=[class_name])
        getattr(module, class_name)  # Check class define
        print(f"{module_name} imported OK")
    except Exception as e:
        print(f"Error in {module_name}: {str(e)}")
        sys.exit(1)  # Stop ถ้า error เพื่อหา file แรกที่บัค
print("All models imported OK")