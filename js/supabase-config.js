/* ===== BookConnect - Cấu hình Supabase =====
 * Điền URL và ANON KEY (public) của dự án Supabase của bạn.
 * Lấy tại: Supabase Dashboard -> Project Settings -> API.
 */
window.SUPABASE_URL = "https://tydsaicdjzhbnxcxstym.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZHNhaWNkanpoYm54Y3hzdHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5ODIyMTQsImV4cCI6MjEwMTU1ODIxNH0.3T8TqxL46SlTBvPaC1Kxte01icpKIjMFcgefY02gHqE";

/* Danh sách email tài khoản admin.
   Khi đăng nhập bằng một email trong danh sách này, hệ thống coi là ADMIN.
   Lưu ý: account admin cũng phải tồn tại trên Supabase (đăng ký) trước. */
window.ADMIN_EMAILS = ["admin@bookconnect.vn"];