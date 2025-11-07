export const calculateShippingCost = (totalPrice) => {
  // ถ้ายอดรวมมากกว่า 1000 บาท ส่งฟรี
  if (totalPrice > 999) {
    return 0;
  }

  // ถ้ายอดรวมต่ำกว่า 100 บาท คิดค่าส่ง 50 บาท
  if (totalPrice < 100) {
    return 50;
  }

  // คำนวณค่าจัดส่งในช่วง 100 - 250 บาทตามราคาสินค้า
  const shippingCost = Math.floor(
    ((totalPrice - 100) / (999 - 100)) * (250 - 100) + 100
  );

  return shippingCost;
};
