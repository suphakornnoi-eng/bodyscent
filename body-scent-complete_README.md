# BODY SCENT — Complete Premium Frontend

เว็บไซต์ **BODY SCENT** แบบครบชุด 7 ไฟล์ พร้อมนำขึ้น **GitHub** และ **Vercel**:
- `index.html` — หน้าแรกแนวพรีเมียมมินิมอล พร้อม Hero และการ์ด 4 Mood (`Fresh`, `Sweet`, `Confident`, `Romance`)
- `product.html` — หน้าแสดงสินค้าและกรองตาม mood (`#filter-bar`, `#product-list`)
- `order.html` — หน้ากรอกคำสั่งซื้อ (`#orderForm`) เติมค่า `item` และ `price` จาก URL อัตโนมัติ และบันทึกลง `localStorage` (`bodyScentOrders`)
- `thankyou.html` — หน้ายืนยันหลังสั่งซื้อสำเร็จ
- `admin.html` — หน้าตารางคำสั่งซื้อ (`#ordersTable tbody`) เรียงจากล่าสุดขึ้นก่อน
- `style.css` — สไตล์พรีเมียมเรียบหรูโทนครีมและเส้นขอบบาง
- `script.js` — สคริปต์กลางที่ใช้ร่วมกันทุกหน้า
- `products.json` — ข้อมูลตัวอย่างสินค้า 6 รายการครบทั้ง 4 Mood

## หมายเหตุสำคัญเกี่ยวกับ `localStorage`
ข้อมูลคำสั่งซื้อในเวอร์ชันนี้เก็บไว้ใน `localStorage` ของเบราว์เซอร์เครื่องที่ใช้งานอยู่เท่านั้น ไม่ใช่ฐานข้อมูลกลางที่แชร์ข้ามเครื่องของลูกค้าทุกคน
