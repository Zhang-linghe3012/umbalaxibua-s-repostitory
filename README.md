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

## 🔐 Đăng ký / Đăng nhập bằng Supabase (không xác nhận email)

Trang hỗ trợ **Supabase Auth** cho đăng ký/đăng nhập. Nếu chưa cấu hình, hệ thống tự dùng đăng nhập dự phòng (localStorage).

### 1. Cấu hình
Mở `js/supabase-config.js` và điền giá trị thật của dự án:
```js
window.SUPABASE_URL    = "https://ABC...supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJI...";   // anon key (public)
window.ADMIN_EMAILS    = ["admin@bookconnect.vn"]; // email nào là admin
```
Lấy URL và anon key tại: **Supabase Dashboard → Project Settings → API**.

### 2. Tắt xác nhận email (không verify email)
Để đăng ký xong là **đăng nhập ngay** (không cần bấm link xác nhận):
- Supabase Dashboard → **Authentication → Sign In / Providers → Email**
- Bật **"Enable signup"** (Email provider) — nếu tắt sẽ báo lỗi `email_provider_disabled: Email signups are disabled`.
- Tắt **"Enable email confirmations"** → **Save**.

Hoặc đồng mức dự án: **Authentication → Settings → Disable Email Confirmations**.

> ⚠️ Quan trọng: **Email provider phải BẬT** thì đăng ký bằng email mới chạy được. Bạn chỉ tắt phần "email confirmations"; nếu đang gặp lỗi `email_provider_disabled`, hãy bật lại "Enable signup"/bật Email trong **Sign In / Providers**.

### 3. Tạo tài khoản Admin trên Supabase
Admin chỉ là tài khoản có email nằm trong `ADMIN_EMAILS`. Cách tạo:
- Đăng ký qua trang với email trong danh sách (đã tắt email confirmations → đăng nhập ngay), **hoặc**
- Chạy trong **SQL Editor** của Supabase (tạo user không cần email thật):
```sql
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        'admin@bookconnect.vn',
        crypt('admin123', gen_salt('bf')),
        now(), now(), now(), '', '', '', '');
```
Sau đó đăng nhập bằng `admin@bookconnect.vn` / `admin123`.

> Nếu chỉ muốn dùng admin mặc định (localStorage) ban đầu, để nguyên placeholder trong `supabase-config.js` thì hệ thống dùng lại tài khoản local `admin@bookconnect.vn` / `admin123`.

## 🌐 Nguồn Supabase JS
Client được nạp từ CDN trong `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
Các file liên quan: `js/supabase-config.js` (cấu hình), `js/supabase-auth.js` (đăng ký/đăng nhập), và phần Auth trong `js/store.js`.