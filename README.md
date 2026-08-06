# 📚 BookConnect — Trang web bán sách (Demo)

Trang web bán sách **dạng tĩnh (HTML/CSS/JS)** bằng **tiếng Việt**, dữ liệu lưu trên `localStorage`.
Không cần server, chỉ cần **mở `index.html` trong trình duyệt** là chạy được.

## 🚀 Cách chạy
1. Mở thư mục `bookstore`.
2. Nhấn đúp vào `index.html` (hoặc bấm chuột phải → Open with → trình duyệt).

## ✨ Tính năng (hướng doanh nghiệp)

### Người dùng
- 🏠 **Trang chủ**: banner, danh mục, sách nổi bật, khuyến mãi
- 📖 **Danh mục sách**: tìm kiếm, lọc theo danh mục/khoảng giá/giảm giá, sắp xếp
- 🔍 **Xem chi tiết sách**: mô tả, giá, tồn kho, chọn số lượng
- 🛒 **Giỏ hàng**: thêm/sửa/xóa số lượng, tính tổng tự động
- 🧾 **Thanh toán**: COD, chuyển khoản, Ví MoMo
- 📦 **Lịch sử đơn hàng**: theo dõi trạng thái đơn
- 👤 **Tài khoản**:
  - **Cá nhân** và **Doanh nghiệp** (hóa đơn VAT, chiết khấu)
  - Cập nhật hồ sơ, đổi mật khẩu

### Quản trị viên (Admin)
- 🔐 Đăng nhập: `admin@bookconnect.vn` / `admin123`
- 📊 **Thống kê**: doanh thu, số đơn, số sách, khách hàng, top bán chạy
- 📚 **Quản lý sách**: thêm / sửa / xóa, tồn kho, giá, giảm giá
- 🧾 **Quản lý đơn hàng**: cập nhật trạng thái (mới → xử lý → giao → hoàn thành/hủy)
- 👥 **Danh sách khách hàng**

## 📂 Cấu trúc
```
bookstore/
├── index.html        # Giao diện chính
├── css/style.css     # Stylesheet
├── js/
│   ├── data.js       # Dữ liệu sách mẫu + helper định dạng giá
│   ├── store.js      # Lớp lưu trữ localStorage + nghiệp vụ
│   └── app.js        # Logic giao diện
└── img/              # (tùy chọn) ảnh sách
```

## ⚙️ Ghi chú
- Dữ liệu nằm trong `localStorage`. Muốn **reset dữ liệu**: mở DevTools (F12) → Console → `localStorage.clear()` → reload.
- Font dùng Google Fonts; nếu không có internet, trình duyệt tự dùng font hệ thống (vẫn ổn).