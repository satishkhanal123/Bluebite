/* ==========================================
   Bluebite Instant Seller
   Production supabase.js
   Supabase JS v2 | GitHub Pages Ready
========================================== */

/* ---------- Configuration ---------- */
/* Replace these with your own Supabase values */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

/* ---------- Client ---------- */

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* ==========================================
   CONNECTION TEST
========================================== */

async function testConnection() {
  try {
    const { error } = await supabaseClient
      .from("menu")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("Supabase connected, but table issue:", error.message);
      return false;
    }

    console.log("Supabase Connected");
    return true;

  } catch (err) {

    console.error("Supabase Connection Failed:", err);

    return false;

  }
}

/* ==========================================
   MENU
========================================== */

async function fetchMenuFromSupabase() {

  const { data, error } = await supabaseClient
    .from("menu")
    .select("*")
    .eq("available", true)
    .order("category")
    .order("id");

  if (error) {

    console.error("Menu Fetch Error:", error.message);

    return [];

  }

  return data;

}

/* ==========================================
   ORDERS
========================================== */

async function saveOrderToSupabase(orderData) {

  const { data, error } = await supabaseClient
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) {

    console.error("Order Save Error:", error.message);

    throw error;

  }

  return data;

}

/* ==========================================
   ORDER ID
========================================== */

function generateOrderID() {

  const random =
    Math.floor(1000 + Math.random() * 9000);

  return `MOH-${random}`;

}

/* ==========================================
   ORDER OBJECT
========================================== */

function createOrderObject(customer, cart) {

  const subtotal = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  return {

    order_id: generateOrderID(),

    customer_name: customer.name,

    landmark: customer.landmark,

    address: customer.address,

    mobile: customer.mobile,

    email: customer.email || null,

    notes: customer.notes || "",

    subtotal,

    delivery_charge: 100,

    total: subtotal + 100,

    items: cart,

    status: "Pending"

  };

}

/* ==========================================
   COMPLETE ORDER FLOW
========================================== */

async function submitOrder(customer, cart) {

  try {

    const order = createOrderObject(customer, cart);

    const savedOrder =
      await saveOrderToSupabase(order);

    const message =
      generateWhatsAppMessage(savedOrder);

    const url =
      `https://wa.me/918617519582?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

    return savedOrder;

  } catch (err) {

    alert("Unable to place order. Please try again.");

    console.error(err);

    return null;

  }

}

/* ==========================================
   WHATSAPP TEMPLATE
========================================== */

function generateWhatsAppMessage(order) {

  const itemsText = order.items
    .map(item => {

      const variant =
        item.variant ? ` (${item.variant})` : "";

      return `• 🍽️ ${item.name}${variant} × ${item.qty} – ₹${item.qty * item.price}`;

    })
    .join("\n");

  return `
🍽️ NEW FOOD ORDER
━━━━━━━━━━━━━━

🆔 Order ID: ${order.order_id}
🕒 Order Time: ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}

🧾 ITEMS ORDERED

${itemsText}

━━━━━━━━━━━━━━

💰 BILL SUMMARY

Subtotal: ₹${order.subtotal}
Delivery: ₹${order.delivery_charge}
━━━━━━━━━━━━━━
👉 TOTAL: ₹${order.total}

📍 DELIVERY DETAILS

👤 ${order.customer_name}
🏠 ${order.address}
🧭 ${order.landmark || "Not Provided"}

📞 Mobile: ${order.mobile}
📧 Email: ${order.email || "Not Provided"}

📝 NOTES

${order.notes || "None"}

🙏 Please confirm availability & delivery time.
`.trim();

}

/* ==========================================
   EXPORTS
========================================== */

window.supabaseClient = supabaseClient;

window.fetchMenuFromSupabase = fetchMenuFromSupabase;

window.submitOrder = submitOrder;

window.testConnection = testConnection;

window.generateOrderID = generateOrderID;

window.generateWhatsAppMessage = generateWhatsAppMessage;