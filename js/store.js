/* ===== BookConnect - Lưu trữ (localStorage) & nghiệp vụ ===== */
const Store = (() => {
  const KEYS = { BOOKS:"bc_books", USERS:"bc_users", SESSION:"bc_session", CART:"bc_cart", ORDERS:"bc_orders" };
  const ADMIN_EMAIL = "admin@bookconnect.vn";

  const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch(e){ return fallback; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const init = () => {
    if(!localStorage.getItem(KEYS.BOOKS)) write(KEYS.BOOKS, SEED_BOOKS);
    if(!localStorage.getItem(KEYS.USERS)){
      write(KEYS.USERS, [{ id:1, name:"Quản trị viên", email:ADMIN_EMAIL, phone:"", address:"", password:"admin123", role:"admin", business:true }]);
    }
    if(!localStorage.getItem(KEYS.ORDERS)) write(KEYS.ORDERS, []);
  };

  /* ---------- BOOKS ---------- */
  const getBooks = () => read(KEYS.BOOKS, []);
  const saveBooks = b => write(KEYS.BOOKS, b);
  const findBook = id => getBooks().find(b => b.id === id);
  const nextBookId = () => getBooks().reduce((m,b)=>Math.max(m,b.id),0)+1;
  const addBook = data => { const b = { ...data, id: nextBookId(), createdAt: Date.now(), rating: data.rating||0, reviews: data.reviews||0 }; saveBooks([...getBooks(), b]); return b; };
  const updateBook = (id, data) => saveBooks(getBooks().map(b => b.id===id ? { ...b, ...data } : b));
  const deleteBook = id => saveBooks(getBooks().filter(b => b.id !== id));

  /* ---------- USERS / AUTH ---------- */
  const getUsers = () => read(KEYS.USERS, []);
  const saveUsers = u => write(KEYS.USERS, u);
  const getSession = () => read(KEYS.SESSION, null);
  const setSession = u => write(KEYS.SESSION, u ? { id:u.id, email:u.email, name:u.name, role:u.role, business:u.business } : null);
  const currentUser = () => { const s = getSession(); if(!s) return null; const u = getUsers().find(x=>x.id===s.id); return u || null; };

  const register = ({name,email,password,business}) => {
    const users = getUsers();
    if(users.some(u=>u.email===email)) return { ok:false, msg:"Email đã tồn tại." };
    const u = { id: Date.now(), name, email, phone:"", address:"", password, role:"user", business:!!business };
    users.push(u); saveUsers(users); setSession(u);
    return { ok:true, user:u };
  };
  const login = ({email,password}) => {
    const u = getUsers().find(x=>x.email===email && x.password===password);
    if(!u) return { ok:false, msg:"Email hoặc mật khẩu không đúng." };
    setSession(u); return { ok:true, user:u };
  };
  const logout = () => setSession(null);
  const updateProfile = data => {
    const users = getUsers(); const u = currentUser(); if(!u) return { ok:false, msg:"Chưa đăng nhập." };
    const idx = users.findIndex(x=>x.id===u.id); if(idx<0) return { ok:false,msg:"Không tìm thấy tài khoản." };
    if(data.password){ const dup = users.find(x=>x.email===data.email && x.id!==u.id); if(dup) return { ok:false,msg:"Email đã được dùng." }; }
    users[idx] = { ...users[idx], ...data, password: data.password || users[idx].password };
    saveUsers(users); setSession(users[idx]); return { ok:true, user:users[idx] };
  };

  /* ---------- CART ---------- */
  const getCart = () => read(KEYS.CART, []);
  const saveCart = c => write(KEYS.CART, c);
  const cartCount = () => getCart().reduce((s,i)=>s+i.qty,0);
  const cartTotal = () => getCart().reduce((s,i)=>{ const b=findBook(i.id); return s+(b?b.price*i.qty:0); },0);
  const addToCart = (id, qty=1) => {
    const c = getCart(); const it = c.find(x=>x.id===id);
    if(it) it.qty += qty; else c.push({ id, qty });
    saveCart(c);
  };
  const cartItemQty = id => { const it = getCart().find(x=>x.id===id); return it ? it.qty : 0; };
  const setCartQty = (id, qty) => { let c=getCart(); c=c.map(x=>x.id===id?{...x,qty:Math.max(1,qty)}:x).filter(x=>x.qty>0); saveCart(c); };
  const removeFromCart = id => saveCart(getCart().filter(x=>x.id!==id));
  const clearCart = () => saveCart([]);

  /* ---------- ORDERS ---------- */
  const getOrders = () => read(KEYS.ORDERS, []);
  const saveOrders = o => write(KEYS.ORDERS, o);
  const placeOrder = ({name,phone,address,payment}) => {
    const user = currentUser();
    const cart = getCart(); if(!cart.length) return { ok:false, msg:"Giỏ hàng trống." };
    const items = cart.map(i => { const b = findBook(i.id); return { id:b.id, title:b.title, author:b.author, qty:i.qty, price:b.price, img:b.img }; });
    const order = {
      id: "BC"+Date.now().toString().slice(-8),
      userId: user ? user.id : null,
      customer: name, phone, address, payment,
      items, total: cartTotal(),
      status: "new",
      createdAt: Date.now(),
    };
    cart.forEach(i => { const b = findBook(i.id); if(b) updateBook(b.id, { stock: Math.max(0, b.stock - i.qty) }); });
    saveOrders([order, ...getOrders()]);
    clearCart();
    return { ok:true, order };
  };
  const setOrderStatus = (id, status) => saveOrders(getOrders().map(o=>o.id===id?{...o,status}:o));

  return { init, KEYS, ADMIN_EMAIL,
    getBooks, saveBooks, findBook, nextBookId, addBook, updateBook, deleteBook,
    getUsers, saveUsers, getSession, setSession, currentUser, register, login, logout, updateProfile,
    getCart, saveCart, cartCount, cartTotal, addToCart, cartItemQty, setCartQty, removeFromCart, clearCart,
    getOrders, saveOrders, placeOrder, setOrderStatus };
})();
window.Store = Store;