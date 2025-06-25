// File: script.js

let drinks = [
  { name: "Pepsi", price: 10000, image: "" },
  { name: "Coca Cola", price: 12000, image: "" },
  { name: "7Up", price: 9000, image: "" },
];

let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let cart = [];

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function saveCurrentUser() {
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!username || !password) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  if (users.find(u => u.username === username)) {
    alert("Tên đăng nhập đã tồn tại.");
    return;
  }

  users.push({ username, password, role, history: [] });
  saveUsers();
  alert("Đăng ký thành công!");
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    alert("Sai tên đăng nhập hoặc mật khẩu.");
    return;
  }

  currentUser = user;
  saveCurrentUser();
  document.getElementById("logoutBtn").classList.remove("hidden");
  document.querySelectorAll(".topbar input, .topbar select, .topbar button:not(#logoutBtn)").forEach(e => e.classList.add("hidden"));
  renderUI();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  location.reload();
}

function renderUI() {
  renderDrinks();

  if (!currentUser) return;

  if (currentUser.role === "admin") {
    document.getElementById("adminSection").classList.remove("hidden");
    renderUsers();
  } else {
    document.getElementById("cartSection").classList.remove("hidden");
    document.getElementById("historySection").classList.remove("hidden");
    renderCart();
    renderHistory();
  }
}

function renderDrinks() {
  const list = document.getElementById("drinkList");
  list.innerHTML = "";
  drinks.forEach((d, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${d.image}" alt="${d.name}">
      <h4>${d.name}</h4>
      <p>${d.price.toLocaleString()} đ</p>
      ${currentUser && currentUser.role === "customer" ? `<button onclick="addToCart(${index})">Thêm</button>` : ""}
    `;
    list.appendChild(card);
  });
}

function addToCart(index) {
  const drink = drinks[index];
  const found = cart.find(item => item.name === drink.name);
  if (found) found.qty++;
  else cart.push({ ...drink, qty: 1 });
  renderCart();
}

function renderCart() {
  const tableBody = document.querySelector("#cartTable tbody");
  tableBody.innerHTML = "";
  cart.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price.toLocaleString()} đ</td>
      <td>${item.qty}</td>
      <td>${(item.price * item.qty).toLocaleString()} đ</td>
      <td><button onclick="removeFromCart(${i})">X</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function checkout() {
  if (cart.length === 0) return alert("Giỏ hàng trống.");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const historyItem = {
    date: new Date().toLocaleString(),
    items: [...cart],
    total
  };
  const userIndex = users.findIndex(u => u.username === currentUser.username);
  users[userIndex].history.push(historyItem);
  saveUsers();
  cart = [];
  renderCart();
  renderHistory();
  alert("Thanh toán thành công!");
}

function renderHistory() {
  const ul = document.getElementById("historyList");
  ul.innerHTML = "";
  const user = users.find(u => u.username === currentUser.username);
  user.history.forEach(h => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${h.date}</strong>: ${h.items.map(i => `${i.name} x${i.qty}`).join(", ")} - <em>${h.total.toLocaleString()} đ</em>`;
    ul.appendChild(li);
  });
}

function addDrink() {
  const name = document.getElementById("newDrinkName").value.trim();
  const price = parseInt(document.getElementById("newDrinkPrice").value);
  const image = document.getElementById("newDrinkImage").value;

  if (!name || !price || !image) return alert("Nhập đủ thông tin.");

  drinks.push({ name, price, image });
  renderDrinks();
  alert("Thêm nước thành công!");
}

function renderUsers() {
  const ul = document.getElementById("userList");
  ul.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.role})`;
    ul.appendChild(li);
  });
}

window.onload = () => {
  if (currentUser) {
    document.getElementById("logoutBtn").classList.remove("hidden");
    document.querySelectorAll(".topbar input, .topbar select, .topbar button:not(#logoutBtn)").forEach(e => e.classList.add("hidden"));
  }
  renderUI();
};
