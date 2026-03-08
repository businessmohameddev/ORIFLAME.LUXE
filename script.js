// إدارة قاعدة البيانات المحلية
let products = JSON.parse(localStorage.getItem('Oriflame_Luxe_V1')) || [
    { id: 1, name: "عطر جيورداني جولد إسنزا سوبريم", price: 599, img: "gold.jpg" },
    { id: 2, name: "مجموعة روتين نوفاج+ ريستور", price: 1691, img: "nofaj.jpg" },
    { id: 3, name: "أحمر الشفاه اللامع دي وان ألتيميت", price: 199, img: "diwan.jpg" }
];

let cart = [];
const MASTER_PASS = "1234";

// تشغيل المتجر
function renderStore() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
        <div class="card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/250'">
            <h3>${p.name}</h3>
            <p class="price">${p.price} درهم</p>
            <button class="btn-add" onclick="addToCart(${p.id})">أضف للسلة 🛍️</button>
        </div>
    `).join('');
    updateDashboard();
    localStorage.setItem('Oriflame_Luxe_V1', JSON.stringify(products));
}

// وظائف السلة
function addToCart(id) {
    const item = cart.find(i => i.id === id);
    if (item) item.qty++;
    else cart.push({ ...products.find(p => p.id === id), qty: 1 });
    updateUI();
    openCart();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    }
    updateUI();
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.reduce((s, i) => s + i.qty, 0);
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.length === 0 ? '<p style="text-align:center; padding:40px; color:#999;">حقيبتك تنتظر منتجات الجمال...</p>' : cart.map(i => `
        <div class="cart-item">
            <img src="${i.img}">
            <div style="flex:1"><b>${i.name}</b><br><span style="color:var(--pink-dark)">${i.price * i.qty} درهم</span></div>
            <div class="qty-ctrl">
                <button class="qty-btn" onclick="changeQty(${i.id}, -1)">-</button>
                <span style="font-weight:900">${i.qty}</span>
                <button class="qty-btn" onclick="changeQty(${i.id}, 1)">+</button>
            </div>
            <div class="remove-item" onclick="removeFromCart(${i.id})">🗑️</div>
        </div>
    `).join('');
    document.getElementById('cart-total').innerText = cart.reduce((s, i) => s + (i.price * i.qty), 0);
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); updateUI(); }
function openCart() { document.getElementById('cart-modal').style.display = 'flex'; }
function closeCart() { document.getElementById('cart-modal').style.display = 'none'; }

// الإدارة PRO
function openAdmin() {
    if (prompt("كلمة سر المدير:") === MASTER_PASS) document.getElementById('admin-panel').style.display = 'block';
}
function closeAdmin() { document.getElementById('admin-panel').style.display = 'none'; window.location.hash = ""; }

function updateDashboard() {
    document.getElementById('stat-count').innerText = products.length;
    document.getElementById('stat-value').innerText = products.reduce((s, p) => s + p.price, 0) + " درهم";
    const tbody = document.getElementById('admin-list');
    tbody.innerHTML = products.map(p => `
        <tr><td><b>${p.name}</b></td><td>${p.price} درهم</td>
        <td><button onclick="editProduct(${p.id})" style="color:cyan; background:none; border:none; cursor:pointer;">تعديل</button> | 
        <button onclick="deleteProduct(${p.id})" style="color:red; background:none; border:none; cursor:pointer;">حذف</button></td></tr>
    `).join('');
}

function saveProduct() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('p-name').value;
    const price = parseInt(document.getElementById('p-price').value);
    const img = document.getElementById('p-img').value;
    if (!name || !price) return alert("البيانات ناقصة");
    if (id) products[products.findIndex(p => p.id == id)] = { id: parseInt(id), name, price, img };
    else products.push({ id: Date.now(), name, price, img });
    document.getElementById('edit-id').value = "";
    renderStore();
}

function deleteProduct(id) { if (confirm("حذف المنتج نهائياً؟")) { products = products.filter(p => p.id !== id); renderStore(); } }
function editProduct(id) { const p = products.find(x => x.id === id); document.getElementById('edit-id').value = p.id; document.getElementById('p-name').value = p.name; document.getElementById('p-price').value = p.price; document.getElementById('p-img').value = p.img; }

// إرسال الطلبية النهائية
function checkout() {
    if (cart.length === 0) return;
    const phone = "+212641727135"; // رقم الواتساب
    const list = cart.map(i => `🛍️ ${i.name} (الثمن: ${i.price} درهم) [الكمية: ${i.qty}]`).join('\n');
    const total = document.getElementById('cart-total').innerText;
    const msg = `طلب جديد من المتجر الفاخر ✨\n--------------\n${list}\n--------------\n💰 المجموع النهائي: ${total} درهم\n\nالمرجو ملء المعلومات لإتمام الطلب:\n👤 الاسم الكامل: \n📞 رقم الهاتف: \n📍 العنوان الكامل: \n\nشكراً لثقتكم في أوريفلام! ❤️`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
}

// السكرول السلس
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
});

window.onhashchange = () => { if (location.hash === '#admin') openAdmin(); }
document.onkeydown = (e) => { if (e.ctrlKey && e.shiftKey && e.key === 'A') openAdmin(); }
window.onload = renderStore;
