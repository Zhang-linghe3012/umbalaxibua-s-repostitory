/* ===== BookConnect - Dữ liệu mẫu & helper ===== */
const CATEGORIES = [
  "Kinh doanh",
  "Quản trị",
  "Khởi nghiệp",
  "Phát triển bản thân",
  "Marketing & Sales",
  "Tài chính",
  "Công nghệ",
  "Văn học",
];

const SEED_BOOKS = [
  {id:1,title:"Dậy Sớm Để Thành Công",author:"Jeff Sanders",category:"Phát triển bản thân",price:159000,oldPrice:169000,stock:120,rating:4.8,reviews:1250,img:"🌅",desc:"Bí quyết làm chủ buổi sáng và năng suất làm việc cho mọi doanh nhân.",createdAt:Date.now()-10e8},
  {id:2,title:"Tư Duy Ngược Dòng",author:"Đỗ Cao Cường",category:"Phát triển bản thân",price:189000,oldPrice:0,stock:95,rating:4.9,reviews:2031,img:"🔄",desc:"Giải pháp tư duy để thoát khỏi lối mòn kinh doanh."},
  {id:3,title:"Khởi Nghiệp Tinh Gọn",author:"Eric Ries",category:"Khởi nghiệp",price:215000,oldPrice:250000,stock:60,rating:4.7,reviews:950,img:"🚀",desc:"Phương pháp tinh gọn để xây dựng sản phẩm và doanh nghiệp hiệu quả.",createdAt:Date.now()-2e8},
  {id:4,title:"24 Bài Học Về Quản Lý",author:"Andy Grove",category:"Quản trị",price:265000,oldPrice:0,stock:40,rating:4.8,reviews:420,img:"📈",desc:"Tư duy quản trị chiến lược từ Intel.",createdAt:Date.now()-3e8},
  {id:5,title:"Nhà Đầu Tư Thông Minh",author:"Benjamin Graham",category:"Tài chính",price:235000,oldPrice:289000,stock:75,rating:4.9,reviews:610,img:"📊",desc:"Kinh điển về đầu tư giá trị.",createdAt:Date.now()-4e8},
  {id:6,title:"Đắc Nhân Tâm - Bản Doanh Nghiệp",author:"Dale Carnegie",category:"Kinh doanh",price:129000,oldPrice:158000,stock:150,rating:4.8,reviews:1982,img:"🤝",desc:"Nghệ thuật giao tiếp tạo dựng quan hệ kinh doanh.",createdAt:Date.now()-5e8},
  {id:7,title:"Hành Trình Về Phương Đông",author:"Baird T. Spalding",category:"Văn học",price:145000,oldPrice:0,stock:200,rating:4.9,reviews:1230,img:"🧭",desc:"Tri thức văn hóa phương Đông.",createdAt:Date.now()-6e8},
  {id:8,title:"Sáng Tạo Không Giới Hạn",author:"Pholetary",category:"Công nghệ",price:215000,oldPrice:265000,stock:55,rating:4.6,reviews:234,img:"💡",desc:"Ứng dụng công nghệ cho doanh nghiệp hiện đại.",createdAt:Date.now()-7e8},
  {id:9,title:"SALES: Kiến Tạo Khách Hàng",author:"Brian Tracy",category:"Marketing & Sales",price:175000,oldPrice:0,stock:88,rating:4.7,reviews:702,img:"📣",desc:"Nghệ thuật bán hàng đỉnh cao.",createdAt:Date.now()-8e8},
  {id:10,title:"Học Viện Tài Chính",author:"Robert Kiyosaki",category:"Tài chính",price:199000,oldPrice:240000,stock:110,rating:4.7,reviews:844,img:"💰",desc:"Tư duy tài chính cá nhân & doanh nghiệp.",createdAt:Date.now()-9e8},
  {id:11,title:"Quản Trị Chuỗi Cung Ứng",author:"Sunil Chopra",category:"Quản trị",price:345000,oldPrice:0,stock:30,rating:4.5,reviews:158,img:"🚚",desc:"Giáo trình quản trị chuỗi cung ứng.",createdAt:Date.now()-1e9},
  {id:12,title:"Marketing Tiến Đốt",author:"Ariana",category:"Marketing & Sales",price:245000,oldPrice:0,stock:44,rating:4.8,reviews:560,img:"🔥",desc:"Chiến lược tiếp thị đốt tăng trưởng.",createdAt:Date.now()-1.1e9},
];

const BOOK_EMOJI = ["📕","📙","📘","📗","📓","📔","📖","📚","📕","📘","📗","📙"];

/* ===== Helper: định dạng giá ===== */
window.fmt = function(n){
  if(n==null) return "0đ";
  return Number(n).toLocaleString("vi-VN")+"đ";
};

/* ===== Helper: tính phần trăm giảm ===== */
window.discountOf = b => Math.round((1 - b.price/b.oldPrice)*100);

/* ===== Helper: lấy cover (hình cần fetch? Không, dùng emoji) ===== */
window.coverOf = b => (b.img && b.img.startsWith && b.img.startsWith("h")) ? b.img : (b.img || "📚");