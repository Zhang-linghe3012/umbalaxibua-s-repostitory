/* ===== BookConnect - Logic chính (viết lại, sạch) ===== */
(function(){
  const S = window.Store;
  S.init();
  const $ = id => document.getElementById(id);
  const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let rq = "";

  const STATUS_META = { new:"Mới đặt", processing:"Đang xử lý", shipped:"Đang giao", completed:"Hoàn thành", cancelled:"Đã hủy" };
  const cover = b => { const c = (b.img && b.img.startsWith("http")) ? b.img : (b.img || "📚"); return c.startsWith("http") ? `<img src="${esc(c)}" alt="">` : esc(c); };
  const discountOf = b => (b.oldPrice && b.oldPrice > b.price) ? Math.round((1 - b.price/b.oldPrice)*100) : 0;

  /* ===== Toast ===== */
  function toast(msg, isErr){
    const t = $("toast"); t.textContent = msg; t.className = "toast" + (isErr ? " error" : ""); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ===== Navigation ===== */
  function showView(v){
    ["home","products","detail","about","contact","orders","profile","admin"].forEach(x=>{
      const el = $(("view-"+x)); if(el) el.hidden = (x !== v);
    });
    window.scrollTo({top:0});
    if(v==="home") renderHome();
    else if(v==="products") renderProducts();
    else if(v==="orders") renderOrders();
    else if(v==="profile") renderProfile();
    else if(v==="admin") renderAdmin();
    renderUserBox();
  }

  /* ===== Product card ===== */
  function productCard(b){
    const off = discountOf(b);
    return `<div class="product-card" data-detail="${b.id}">
      ${off ? `<span class="discount-tag">-${off}%</span>` : ""}
      <div class="book-cover" style="font-size:64px">${cover(b)}</div>
      <div class="product-body">
        <div class="product-title">${esc(b.title)}</div>
        <div class="product-author">${esc(b.author)}</div>
        <div class="product-rating">★★★★★ ${b.rating||0} · ${b.reviews||0} đánh giá</div>
        <div class="product-price">
          <span class="price">${fmt(b.price)}</span>
          ${off?`<span class="old-price">${fmt(b.oldPrice)}</span>`:""}
        </div>
        <div class="product-actions"><button class="btn btn-accent btn-sm" data-cart="${b.id}">🛒 Thêm vào giỏ</button></div>
      </div>
    </div>`;
  }
  function bindProduct(root){
    root.querySelectorAll("[data-detail]").forEach(c=>c.onclick=()=>openDetail(Number(c.dataset.detail)));
    root.querySelectorAll("[data-cart]").forEach(btn=>btn.onclick=e=>{
      e.stopPropagation();
      const b = S.findBook(Number(btn.dataset.cart));
      if(b.stock<=0){ toast("Sách đã hết hàng", true); return; }
      S.addToCart(b.id); renderCartCount(); toast("Đã thêm: "+b.title);
    });
  }

  /* ===== Home ===== */
  function renderHome(){
    const books = S.getBooks();
    $("categoryStrip").innerHTML = `<span class="cat-pill active" data-cat="all">Tất cả</span>` +
      [...new Set(books.map(b=>b.category))].map(c=>`<span class="cat-pill" data-cat="${esc(c)}">${esc(c)}</span>`).join("");
    $("categoryStrip").querySelectorAll(".cat-pill").forEach(p=>p.onclick=()=>{
      $("categoryStrip").querySelectorAll(".cat-pill").forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      const c = p.dataset.cat;
      const list = books.filter(b=>c==="all" || b.category===c).slice(0,8);
      $("featuredGrid").innerHTML = list.map(bookCard).join("");
      bindProduct($("featuredGrid"));
    });
    $("featuredGrid").innerHTML = books.slice(0,8).map(bookCard).join("");
    bindProduct($("featuredGrid"));
    $("saleGrid").innerHTML = books.filter(b=>discountOf(b)>0).map(bookCard).join("");
    bindProduct($("saleGrid"));
  }

  /* ===== Products ===== */
  function renderProducts(){
    const list = S.getBooks().filter(b =>
      ($("filterCategory").value==="all" || b.category===$("filterCategory").value) &&
      (!$("onlySale").checked || discountOf(b)>0) &&
      (rq==="" || b.title.toLowerCase().includes(rq) || b.author.toLowerCase().includes(rq) || b.category.toLowerCase().includes(rq))
    );
    const price = $("filterPrice").value;
    if(price!=="all"){ const [lo,hi]=price.split("-").map(Number); const f=list.filter(b=>b.price>=lo&&b.price<=hi); list.length=0; list.push(...f); }
    const sort = $("sortBy").value;
    if(sort==="price-asc") list.sort((a,b)=>a.price-b.price);
    else if(sort==="price-desc") list.sort((a,b)=>b.price-a.price);
    else if(sort==="rating") list.sort((a,b)=>(b.rating||0)-(a.rating||0));
    else if(sort==="newest") list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    $("resultCount").textContent = list.length + " sản phẩm";
    $("productGrid").innerHTML = list.map(bookCard).join("");
    $("productEmpty").hidden = list.length>0;
    bindProduct($("productGrid"));
  }

  /* ===== Detail ===== */
  let detailQty = 1;
  function openDetail(id){
    const b = S.findBook(id); if(!b) return;
    detailQty = 1;
    const vd = $("view-detail");
    vd.innerHTML = `
      <div class="detail-wrap">
        <div class="detail-cover">${cover(b)}</div>
        <div class="detail-meta">
          <h1>${esc(b.title)}</h1>
          <div class="author">${esc(b.author)}</div>
          <div class="rating">★★★★★ ${b.rating} · ${b.reviews} đánh giá</div>
          <div class="detail-prices"><span class="price">${fmt(b.price)}</span>${discountOf(b)?`<span class="old-price">${fmt(b.oldPrice)}</span>`:""}</div>
          <div class="detail-row">Danh mục: <b>${esc(b.category)}</b></div>
          <div class="detail-row">Tình trạng: <b style="color:${b.stock>0?'#27ae60':'#e74c3c'}">${b.stock>0?'Còn hàng ('+b.stock+' quyển)':'Hết hàng'}</b></div>
          <div class="qty-wrap">
            <span>Số lượng:</span>
            <button data-d="-">−</button><input type="number" value="1" min="1" id="dQty"><button data-d="+">+</button>
          </div>
          <div class="detail-actions">
            <button class="btn btn-accent" id="dCart">🛒 Thêm vào giỏ</button>
            <button class="btn btn-primary" id="dBuy">Mua ngay</button>
          </div>
        </div>
      </div>
      <div class="detail-desc"><h3>Giới thiệu sách</h3><p>${esc(b.desc||"Chưa có mô tả.")}</p></div>`;
    vd.querySelectorAll("[data-d]").forEach(btn=>btn.onclick=()=>{
      detailQty = Math.max(1, detailQty + (btn.dataset.d==="+"?1:-1)); $("dQty").value = detailQty;
    });
    $("dQty").addEventListener("input",()=>{ detailQty = Math.max(1, parseInt($("dQty").value,10)||1); });
    $("dCart").onclick = () => {
      if(b.stock<=0){ toast("Hết hàng", true); return; }
      S.addToCart(b.id, detailQty); renderCartCount(); toast("Đã thêm vào giỏ");
    };
    $("dBuy").onclick = () => {
      if(b.stock<=0){ toast("Hết hàng", true); return; }
      S.addToCart(b.id, detailQty); renderCartCount(); openCart();
    };
    showView("detail");
  }

  /* ===== Gio hang ===== */
  function renderCartCount(){ $("cartCount").textContent = S.cartCount(); }
  function openCart(){ renderCartModal(); $("modalCart").hidden = false; }
  function renderCartModal(){
    const items = S.getCart();
    $("cartItems").innerHTML = items.length ? items.map(it=>{
      const b = S.findBook(it.id); if(!b) return "";
      return `<div class="cart-item">
        <div class="ico" style="font-size:26px">${cover(b)}</div>
        <div class="meta"><b>${esc(b.title)}</b><small>${fmt(b.price)} / cuốn</small></div>
        <div class="qty">
          <button data-cq="${b.id}:${-1}">−</button><input value="${it.qty}" data-cqin="${b.id}"><button data-cq="${b.id}:${1}">+</button>
        </div>
        <span class="price">${fmt(b.price*it.qty)}</span>
        <button class="rm" data-crm="${b.id}">✕</button>
      </div>`;
    }).join("") : `<div class="empty-state"><p>🛒 Giỏ hàng của bạn đang trống.</p></div>`;
    $("cartTotal").textContent = fmt(S.cartTotal());
    $("cartItems").querySelectorAll("[data-cq]").forEach(btn=>btn.onclick=()=>{
      const [id,d]=btn.dataset.cq.split("-"); S.setCartQty(Number(id), S.cartItemQty(id)+Number(d)); renderCartModal(); renderCartCount();
    });
    $("cartItems").querySelectorAll("[data-crm]").forEach(btn=>btn.onclick=()=>{ S.removeFromCart(Number(btn.dataset.crm)); renderCartModal(); renderCartCount(); });
    $("cartItems").querySelectorAll("[data-cqin]").forEach(inp=>inp.onchange=()=>{ S.setCartQty(Number(inp.dataset.cqin), parseInt(inp.value,10)||1); renderCartModal(); renderCartCount(); });
  }

  /* ===== Checkout ===== */
  function openCheckout(){
    if(!S.cartCount()){ toast("Giỏ hàng trống", true); return; }
    const u = S.currentUser();
    $("cName").value = u?u.name:""; $("cPhone").value = u?u.phone:""; $("cAddress").value = u?u.address:"";
    $("checkoutSummary").innerHTML = `<div class="rowd"><span>${S.cartCount()} sản phẩm</span><span>${fmt(S.cartTotal())}</span></div>
      <div class="rowd"><span>Phí giao hàng</span><span>Miễn phí</span></div>
      <div class="rowd total"><span>Tổng cộng</span><span>${fmt(S.cartTotal())}</span></div>`;
    $("modalCheckout").hidden = false;
  }

  /* ===== Orders ===== */
  function renderOrders(){
    const u = S.currentUser();
    $("ordersUserNote").textContent = u ? "Chào "+u.name : "Vui lòng đăng nhập để xem đơn hàng.";
    let orders = S.getOrders();
    if(!u || u.role!=="admin") orders = u ? orders.filter(o=>o.userId===u.id) : [];
    $("ordersEmpty").hidden = orders.length>0;
    $("ordersList").innerHTML = orders.map(o=>`
      <div class="order-card">
        <div class="order-head"><span>#${o.id}</span><span class="order-status status-${o.status}">${STATUS_META[o.status]||o.status}</span></div>
        ${o.items.map(i=>`<div class="order-item"><span class="ico">📖</span><div class="meta"><b>${esc(i.title)}</b><span>x${i.qty} · ${fmt(i.price)}</span></div><span class="price">${fmt(i.qty*i.price)}</span></div>`).join("")}
        <div class="order-foot"><span>Tổng cộng:</span><span class="order-total-txt">${fmt(o.total)}</span></div>
      </div>`).join("");
  }

  /* ===== Profile ===== */
  function renderProfile(){
    const u = S.currentUser();
    if(!u){ toast("Chưa đăng nhập", true); showView("home"); return; }
    $("pName").value = u.name||""; $("pPhone").value = u.phone||""; $("pAddress").value = u.address||""; $("pPassword").value="";
  }

  /* ===== Admin ===== */
  function renderAdmin(){
    const u = S.currentUser();
    if(!u || u.role!=="admin"){ toast("Bạn không có quyền quản trị", true); showView("home"); return; }
    const orders = S.getOrders();
    $("stOrders").textContent = orders.length;
    $("stRevenue").textContent = fmt(orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0));
    $("stBooks").textContent = S.getBooks().length;
    $("stUsers").textContent = S.getUsers().filter(u=>u.role!=="admin").length;
    const counts = {}; orders.forEach(o=>o.items.forEach(i=>counts[i.title]=(counts[i.title]||0)+i.qty));
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
    $("topBooks").innerHTML = top.length ? top.map(([t,n])=>`<li><span>${esc(t)}</span><b>x${n}</b></li>`).join("") : "<li>Chưa có dữ liệu</li>";
    renderAdminBooks(); renderAdminOrders(); renderAdminUsers();
    $("bCategory").innerHTML = categoryOptions("");
  }
  function categoryOptions(sel){
    return [...new Set(S.getBooks().map(b=>b.category))].map(c=>`<option value="${esc(c)}" ${c===sel?"selected":""}>${esc(c)}</option>`).join("");
  }
  function renderAdminBooks(){
    $("adminBookRows").innerHTML = S.getBooks().map(b=>`
      <tr><td>${esc(b.title)}<br><small style="color:#888">${esc(b.author)}</small></td><td>${esc(b.category)}</td><td>${fmt(b.price)}</td><td>${discountOf(b)}%</td><td>${b.stock}</td>
      <td class="actions"><button class="link-btn" data-eb="${b.id}">Sửa</button><button class="link-btn danger" data-db="${b.id}">Xóa</button></td></tr>`).join("");
    $("adminBookRows").querySelectorAll("[data-eb]").forEach(btn=>btn.onclick=()=>openBookModal(S.findBook(Number(btn.dataset.eb))));
    $("adminBookRows").querySelectorAll("[data-db]").forEach(btn=>btn.onclick=()=>{ S.deleteBook(Number(btn.dataset.db)); toast("Đã xóa sách"); renderAdmin(); });
  }
  function renderAdminOrders(){
    $("adminOrderRows").innerHTML = S.getOrders().map(o=>`
      <tr><td>#${o.id}</td><td>${esc(o.customer)}<br><small style="color:#888">${esc(o.phone)}</small></td>
      <td>${o.items.map(i=>`${esc(i.title)} x${i.qty}`).join(", ")}</td><td>${fmt(o.total)}</td>
      <td><select data-os="${o.id}">${Object.entries(STATUS_META).map(([k,v])=>`<option value="${k}" ${k===o.status?"selected":""}>${v}</option>`).join("")}</select></td></tr>`).join("");
    $("adminOrderRows").querySelectorAll("[data-os]").forEach(sel=>sel.onchange=()=>{ S.setOrderStatus(sel.dataset.os, sel.value); toast("Đã cập nhật"); renderAdmin(); });
  }
  function renderAdminUsers(){
    $("adminUserRows").innerHTML = S.getUsers().filter(u=>u.role!=="admin").map(u=>
      `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone||"—")}</td><td>${u.business?"🏢 Doanh nghiệp":"Cá nhân"}</td></tr>`).join("");
  }
  function openBookModal(b){
    $("bookModalTitle").textContent = b?"Sửa sách":"Thêm sách";
    $("bId").value = b?b.id:"";
    $("bTitle").value = b?b.title:"";
    $("bAuthor").value = b?b.author:"";
    $("bCategory").innerHTML = categoryOptions(b?b.category:"");
    $("bPrice").value = b?b.price:"";
    $("bOldPrice").value = b?b.oldPrice:"";
    $("bStock").value = b?b.stock:10;
    $("bImage").value = b?b.img:"";
    $("bDesc").value = b?b.desc:"";
    $("modalBook").hidden = false;
  }

  /* ===== Auth ===== */
  function openAuth(tab){
    $("modalAuth").hidden = false;
    document.querySelectorAll("[data-atab]").forEach(b=>b.classList.toggle("active", b.dataset.atab===tab));
    $("loginForm").hidden = tab!=="login"; $("registerForm").hidden = tab!=="register";
  }
  function closeModal(id){ $(id).hidden = true; }

  function renderUserBox(){
    const box = $("userBox");
    const u = S.currentUser();
    if(!u){
      box.innerHTML = `<button class="btn btn-primary btn-sm" data-gauth>Đăng nhập</button>`;
      box.querySelector("[data-gauth]").onclick = ()=>openAuth("login");
      return;
    }
    box.innerHTML = `<span class="user-chip ${u.role==="admin"?"biz":""}">${esc(u.name)}</span>
      ${u.role==="admin" ? `<button class="btn btn-outline btn-sm" data-gadmin>Quản trị</button>` : ""}
      <button class="link-btn" data-logout>Đăng xuất</button>`;
    const adm = box.querySelector("[data-gadmin]"); if(adm) adm.onclick=()=>showView("admin");
    const lg = box.querySelector("[data-logout]"); if(lg) lg.onclick=async ()=>{ await S.logout(); toast("Đã đăng xuất"); renderUserBox(); showView("home"); };
  }

  /* ===== Bind UI ===== */
  function bindUI(){
    // search
    $("btnSearch").onclick = ()=> $("searchBar").hidden = !$("searchBar").hidden;
    function doSearch(){ rq = $("searchInput").value.trim().toLowerCase(); showView("products"); }
    $("btnSearchGo").onclick = doSearch;
    $("searchInput").addEventListener("keydown", e=>{ if(e.key==="Enter") doSearch(); });

    // filters
    ["filterCategory","filterPrice","sortBy"].forEach(id=>$(id).addEventListener("change", renderProducts));
    $("onlySale").addEventListener("change", renderProducts);
    $("btnResetFilter").onclick = ()=>{ $("filterCategory").value="all"; $("filterPrice").value="all"; $("sortBy").value="default"; $("onlySale").checked=false; renderProducts(); };

    // cart / checkout
    $("btnCart").onclick = openCart;
    $("btnCheckout").onclick = openCheckout;

    // admin tabs
    const adminTabs = document.querySelectorAll(".admin-tabs .tab-btn");
    if(adminTabs.length){
      adminTabs.forEach(btn=>btn.onclick=()=>{
        adminTabs.forEach(x=>x.classList.remove("active")); btn.classList.add("active");
        ["stats","books","orders","users"].forEach(t=>$("admin-"+t).hidden = t!==btn.dataset.tab);
      });
    }
    $("btnAddBook").onclick = ()=>openBookModal(null);

    // auth tabs
    document.querySelectorAll("[data-atab]").forEach(btn=>btn.onclick=()=>{
      document.querySelectorAll("[data-atab]").forEach(x=>x.classList.toggle("active", x===btn));
      $("loginForm").hidden = btn.dataset.atab!=="login";
      $("registerForm").hidden = btn.dataset.atab!=="register";
    });

    // login form
    $("loginForm").addEventListener("submit", async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const r = await S.login({ email: f.get("email"), password: f.get("password") });
      if(!r.ok){ e.target.querySelector(".form-note").textContent = r.msg; return; }
      closeModal("modalAuth"); toast("Đăng nhập thành công, chào "+r.user.name+"!"); renderUserBox();
      if(r.user.role==="admin") showView("admin"); else showView("home");
    });
    // register form
    $("registerForm").addEventListener("submit", async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const note = e.target.querySelector(".form-note");
      if(f.get("password")!==f.get("confirm")){ note.textContent="Mật khẩu không khớp."; return; }
      const r = await S.register({ name:f.get("name"), email:f.get("email"), password:f.get("password"), business:!!f.get("business") });
      if(!r.ok){ note.textContent = r.msg; return; }
      closeModal("modalAuth"); toast("Đăng ký thành công. Chào "+r.user.name+"!"); renderUserBox(); showView("home");
    });
    // profile form
    $("profileForm").addEventListener("submit", async e => {
      e.preventDefault();
      const u = S.currentUser(); if(!u){ toast("Chưa đăng nhập", true); return; }
      const r = await S.updateProfile({ name: $("pName").value, phone: $("pPhone").value, address: $("pAddress").value, password: $("pPassword").value || null });
      if(r.ok){ toast("Đã lưu hồ sơ"); renderUserBox(); } else toast(r.msg, true);
    });
    // checkout form
    $("checkoutForm").addEventListener("submit", e=>{
      e.preventDefault();
      const r = S.placeOrder({ name:$("cName").value, phone:$("cPhone").value, address:$("cAddress").value, payment:$("cPayment").value });
      if(r.ok){ closeModal("modalCheckout"); renderCartCount(); toast("Đặt hàng thành công! Mã #"+r.order.id); showView("orders"); }
      else toast(r.msg, true);
    });
    // book form
    $("bookForm").addEventListener("submit", e=>{
      e.preventDefault();
      const id = $("bId").value;
      const data = { title:$("bTitle").value, author:$("bAuthor").value, category:$("bCategory").value, price:Number($("bPrice").value), oldPrice:Number($("bOldPrice").value||0), stock:Number($("bStock").value||0), img:$("bImage").value, desc:$("bDesc").value };
      if(!data.title || !data.author || data.price<=0){ toast("Điền đầy đủ thông tin", true); return; }
      data.rating = data.rating || 4.5; data.reviews = data.reviews || 0;
      if(id) S.updateBook(Number(id), data); else S.addBook(data);
      closeModal("modalBook"); toast("Đã lưu sách"); renderAdmin();
    });
    // contact
    $("contactForm").addEventListener("submit", e=>{ e.preventDefault(); $("contactNote").textContent="Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm."; e.target.reset(); });

    // modals close
    document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
    ["modalAuth","modalCart","modalCheckout","modalBook"].forEach(id=>$(id).addEventListener("click", e=>{ if(e.target===e.currentTarget) closeModal(id); }));

    renderCartCount();
  }

  bindUI();
  S.restoreSession().then(() => showView("home"));
})();