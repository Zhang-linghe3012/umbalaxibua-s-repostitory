/* ===== BookConnect - Supabase Auth (đăng ký/đăng nhập, KHÔNG verify email) ===== */
(function(){
  const missing = !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
                  String(window.SUPABASE_URL).includes("YOUR-PROJECT") ||
                  String(window.SUPABASE_ANON_KEY).includes("YOUR-SUPABASE-ANON-KEY");

  if(missing || !window.supabase){
    window.SupabaseAuth = { ready:false, reason:"Chưa cấu hình SUPABASE_URL / SUPABASE_ANON_KEY. Đang dùng đăng nhập dự phòng (localStorage)." };
    return;
  }

  const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  const mapUser = u => u ? {
    id: u.id,
    email: u.email,
    name: (u.user_metadata && u.user_metadata.full_name) || u.email,
    phone: (u.user_metadata && u.user_metadata.phone) || "",
    address: (u.user_metadata && u.user_metadata.address) || "",
    business: !!(u.user_metadata && u.user_metadata.business),
    role: ((window.ADMIN_EMAILS || []).some(m => m.toLowerCase() === u.email.toLowerCase())) ? "admin" : "user"
  } : null;

  window.SupabaseAuth = {
    ready: true,
    supabase,

    /* Không verify email: hệ thống sẽ tự đăng nhập ngay
       (bạn phải TẮT "Enable email confirmations" trong Supabase Dashboard) */
    async register({ name, email, password, business }){
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name || email, phone:"", address:"", business: !!business } }
      });
      if(error) return { ok:false, msg: error.message };
      if(!data.session){
        return { ok:false, msg:"Đăng ký thành công nhưng chưa có phiên. Hãy tắt xác nhận email trong Supabase Dashboard: Authentication → Sign In / Providers → Email → bật OFF 'Enable email confirmations'." };
      }
      return { ok:true, user: mapUser(data.user), needsConfirm:false };
    },

    async login({ email, password }){
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if(error) return { ok:false, msg: error.message };
      return { ok:true, user: mapUser(data.user) };
    },

    async logout(){
      await supabase.auth.signOut();
    },

    async getSession(){
      const { data } = await supabase.auth.getSession();
      return mapUser(data.session && data.session.user);
    },

    async updateProfile({ name, phone, address, password }){
      const upd = {};
      const meta = {};
      if(name != null) meta.full_name = name || "";
      if(phone != null) meta.phone = phone || "";
      if(address != null) meta.address = address || "";
      if(Object.keys(meta).length) upd.data = meta;
      if(password) upd.password = password;
      if(!Object.keys(upd).length) return { ok:true };
      const { error } = await supabase.auth.updateUser(upd);
      if(error) return { ok:false, msg: error.message };
      const u = await this.getSession();
      return { ok:true, user: u };
    }
  };
})();