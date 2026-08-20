/* ==========================================
   Bluebite Instant Seller
   Production script.js
========================================== */

const DELIVERY_CHARGE = 100;
const ITEMS_PER_PAGE = 6;
const WHATSAPP_NUMBER = "918617519582";

/* ---------- State ---------- */

let menu = [];
let filteredMenu = [];
let cart = [];
let currentPage = 1;
let currentCategory = "all";

/* ---------- DOM ---------- */

const menuGrid = document.getElementById("menuGrid");
const categories = document.getElementById("categories");
const pagination = document.getElementById("pagination");

const searchInput = document.getElementById("searchInput");

const cartBtn = document.getElementById("cartBtn");
const navCart = document.getElementById("navCart");

const cartDrawer = document.getElementById("cartDrawer");
const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const grandTotal = document.getElementById("grandTotal");

const nextBtn = document.getElementById("nextBtn");

const checkout = document.getElementById("checkout");
const previewSection = document.getElementById("previewSection");
const messagePreview = document.getElementById("messagePreview");

const waBtn = document.getElementById("waBtn");
const copyBtn = document.getElementById("copyBtn");

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", async () => {

  loadCart();

  await loadMenu();

  renderCategories();

  applyFilters();

  attachThemeSwitch();

});

/* ==========================================
   MENU
========================================== */

async function loadMenu(){

  try{

    const res = await fetch("menu.json");

    menu = await res.json();

    filteredMenu = [...menu];

  }catch{

    menu = [];

    filteredMenu = [];

  }

}

function renderCategories(){

  const names = [
    "Mo:Mo",
    "Noodles",
    "Chowmein",
    "Snacks",
    "Beverages"
  ];

  const values = [
    "momo",
    "noodles",
    "chowmein",
    "snacks",
    "beverages"
  ];

  categories.innerHTML =
  `
  <div class="glass-card cat active" data-category="all">
    <span>All</span>
  </div>
  ` +

  names.map((n,i)=>
  `
  <div class="glass-card cat" data-category="${values[i]}">
    <span>${n}</span>
  </div>
  `
  ).join("");

  document.querySelectorAll(".cat").forEach(card=>{

    card.addEventListener("click",()=>{

      document.querySelectorAll(".cat")
      .forEach(c=>c.classList.remove("active"));

      card.classList.add("active");

      currentCategory = card.dataset.category;

      currentPage = 1;

      applyFilters();

    });

  });

}

function applyFilters(){

  const q = searchInput.value.toLowerCase();

  filteredMenu = menu.filter(item=>{

    const matchesSearch =
      item.name.toLowerCase().includes(q);

    const matchesCategory =
      currentCategory==="all" ||
      item.category===currentCategory;

    return matchesSearch && matchesCategory;

  });

  renderMenu();

}

searchInput.addEventListener("input",()=>{

  currentPage = 1;

  applyFilters();

});

/* ==========================================
   MENU GRID
========================================== */

function renderMenu(){

  const start = (currentPage-1)*ITEMS_PER_PAGE;

  const pageItems =
    filteredMenu.slice(start,start+ITEMS_PER_PAGE);

  menuGrid.innerHTML = pageItems.map(item=>{

    const options =
      item.category==="momo"
      ?
      `
      <div class="momo-options">
        <button class="selected">Steamed</button>
        <button>Kothey</button>
        <button>Jhol</button>
      </div>
      `
      :
      "";

    return `
    <div class="glass-card food-card">

      <img
      src="assets/food/${item.image || "placeholder.jpg"}"
      class="food-image"
      alt="${item.name}">

      <h3 class="food-title">
      ${item.name}
      </h3>

      <div class="food-price">
      ₹${item.price}
      </div>

      ${options}

      <div class="qty-row">

        <div class="qty">

          <button
          onclick="changeTempQty(${item.id},-1)">
          −
          </button>

          <span id="temp-${item.id}">
          1
          </span>

          <button
          onclick="changeTempQty(${item.id},1)">
          +
          </button>

        </div>

        <button
        class="add-btn"
        onclick="addToCart(${item.id})">

        +

        </button>

      </div>

    </div>
    `;

  }).join("");

  attachMomoButtons();

  renderPagination();

}

const tempQty = {};

function changeTempQty(id,d){

  tempQty[id] = Math.max(1,(tempQty[id]||1)+d);

  document.getElementById(`temp-${id}`).textContent =
    tempQty[id];

}

function attachMomoButtons(){

  document.querySelectorAll(".momo-options")
  .forEach(group=>{

    group.querySelectorAll("button")
    .forEach(btn=>{

      btn.onclick=()=>{

        group.querySelectorAll("button")
        .forEach(b=>b.classList.remove("selected"));

        btn.classList.add("selected");

      };

    });

  });

}

/* ==========================================
   PAGINATION
========================================== */

function renderPagination(){

  const pages =
    Math.ceil(filteredMenu.length/ITEMS_PER_PAGE);

  pagination.innerHTML="";

  for(let i=1;i<=pages;i++){

    const btn=document.createElement("button");

    btn.textContent=i;

    if(i===currentPage)
      btn.classList.add("active");

    btn.onclick=()=>{

      currentPage=i;

      renderMenu();

    };

    pagination.appendChild(btn);

  }

}

/* ==========================================
   CART
========================================== */

function addToCart(id){

  const item = menu.find(i=>i.id===id);

  const qty = tempQty[id]||1;

  let variant="";

  const card =
    document.getElementById(`temp-${id}`)
    ?.closest(".food-card");

  if(item.category==="momo"){

    variant =
    card.querySelector(".selected").textContent;

  }

  const existing =
    cart.find(c=>c.id===id&&c.variant===variant);

  if(existing){

    existing.qty+=qty;

  }else{

    cart.push({
      ...item,
      qty,
      variant
    });

  }

  tempQty[id]=1;

  document.getElementById(`temp-${id}`).textContent=1;

  saveCart();

  updateCart();

}

function updateCart(){

  cartItems.innerHTML="";

  let subtotal=0;

  cart.forEach((item,index)=>{

    subtotal+=item.qty*item.price;

    const row=document.createElement("div");

    row.className="cart-item";

    row.innerHTML=`
      <div>
        ${index+1}.
      </div>

      <div>
        ${item.name}
        ${item.variant?`(${item.variant})`:""}
        × ${item.qty}
      </div>

      <div>
        ₹${item.qty*item.price}
        <button onclick="removeItem(${index})">
        ❌
        </button>
      </div>
    `;

    cartItems.appendChild(row);

  });

  cartCount.textContent=
    cart.reduce((a,b)=>a+b.qty,0);

  cartTotal.textContent=subtotal;

  grandTotal.textContent=
    `₹${subtotal+DELIVERY_CHARGE}`;

  nextBtn.disabled=cart.length===0;

}

window.removeItem=function(i){

  cart.splice(i,1);

  saveCart();

  updateCart();

};

/* ---------- Cart Drawer ---------- */

cartBtn.onclick=openCart;
navCart.onclick=openCart;
closeCart.onclick=closeCartDrawer;

function openCart(){

  cartDrawer.classList.remove("hidden");

}

function closeCartDrawer(){

  cartDrawer.classList.add("hidden");

}

/* ==========================================
   CHECKOUT
========================================== */

nextBtn.onclick=()=>{

  closeCartDrawer();

  checkout.classList.remove("hidden");

  previewSection.classList.remove("hidden");

  generatePreview();

};

["name","landmark","address","mobile","email","notes"]
.forEach(id=>{

  document.getElementById(id)
  .addEventListener("input",generatePreview);

});

/* ==========================================
   WHATSAPP
========================================== */

function generatePreview(){

  const subtotal =
    cart.reduce((a,b)=>a+b.qty*b.price,0);

  const total =
    subtotal+DELIVERY_CHARGE;

  const msg=`
🍽️ NEW FOOD ORDER
━━━━━━━━━━━━━━

👤 Name: ${name.value||""}
📍 Landmark: ${landmark.value||""}
🏠 Address: ${address.value||""}
📞 Mobile: ${mobile.value||""}
📧 Email: ${email.value||"Not Provided"}

━━━━━━━━━━━━━━

${cart.map(i=>`• ${i.name} ${i.variant?`(${i.variant})`:""} × ${i.qty} - ₹${i.qty*i.price}`).join("\n")}

━━━━━━━━━━━━━━

Delivery: ₹100

💰 TOTAL: ₹${total}

📝 Notes:
${notes.value||"None"}
`;

  messagePreview.textContent=msg.trim();

}

waBtn.onclick=()=>{

  if(!validateForm())
    return;

  const url=
  `https://wa.me/${WHATSAPP_NUMBER}?text=`+
  encodeURIComponent(messagePreview.textContent);

  window.open(url,"_blank");

};

copyBtn.onclick=()=>{

  navigator.clipboard.writeText(messagePreview.textContent);

  alert("Order copied.");

};

/* ==========================================
   VALIDATION
========================================== */

function validateForm(){

  if(name.value.trim()===""){

    alert("Enter Name.");

    return false;

  }

  if(address.value.trim()===""){

    alert("Enter Address.");

    return false;

  }

  if(!/^[6-9]\d{9}$/.test(mobile.value)){

    alert("Enter valid Indian Mobile.");

    return false;

  }

  if(email.value &&
    !/^\S+@\S+\.\S+$/.test(email.value)){

    alert("Invalid Email.");

    return false;

  }

  return true;

}

/* ==========================================
   LOCAL STORAGE
========================================== */

function saveCart(){

  localStorage.setItem(
    "bluebite_cart",
    JSON.stringify(cart)
  );

}

function loadCart(){

  const data=
    localStorage.getItem("bluebite_cart");

  if(data){

    cart=JSON.parse(data);

    updateCart();

  }

}

/* ==========================================
   THEME SWITCHER
========================================== */

function attachThemeSwitch(){

  const dots=document.querySelectorAll(".dot");

  dots.forEach(dot=>{

    dot.onclick=()=>{

      dots.forEach(d=>d.classList.remove("active"));

      dot.classList.add("active");

      if(dot.classList.contains("red")){

        document.documentElement.style.setProperty("--gold","#F59E0B");
        document.documentElement.style.setProperty("--bg","#1A0B0B");

      }

      if(dot.classList.contains("green")){

        document.documentElement.style.setProperty("--gold","#C6A15B");
        document.documentElement.style.setProperty("--bg","#101510");

      }

      if(dot.classList.contains("gold")){

        document.documentElement.style.setProperty("--gold","#F5B82E");
        document.documentElement.style.setProperty("--bg","#050505");

      }

    };

  });

}