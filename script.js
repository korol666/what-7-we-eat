const RESTAURANT_KEY = "restaurants";
const HISTORY_KEY = "restaurantHistory";

function getRestaurants() {
  return JSON.parse(localStorage.getItem(RESTAURANT_KEY)) || [];
}

function saveRestaurants(restaurants) {
  localStorage.setItem(RESTAURANT_KEY, JSON.stringify(restaurants));
}

function mergeRestaurants(restaurants) {
  const existingRestaurants = getRestaurants();
  const mergedRestaurants = [
    ...new Set([...existingRestaurants, ...restaurants]),
  ];
  console.log(existingRestaurants);
  console.log(restaurants);
  localStorage.setItem(RESTAURANT_KEY, JSON.stringify(mergedRestaurants));
}

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addRestaurant() {
  const restaurantName = document.getElementById("restaurantName").value.trim();
  if (restaurantName) {
    const restaurants = getRestaurants();
    if (!restaurants.includes(restaurantName)) {
      restaurants.push(restaurantName);
      saveRestaurants(restaurants);
      displayRestaurants();
    }
    document.getElementById("restaurantName").value = "";
  }
}

function displayRestaurants() {
  const restaurants = getRestaurants();
  const restaurantContainer = document.getElementById("restaurants");
  restaurantContainer.innerHTML = "";
  restaurants.forEach((restaurant, index) => {
    const div = document.createElement("div");
    div.className =
      "restaurant-item list-group-item d-flex justify-content-between align-items-center";
    div.innerHTML = `${restaurant} 
            <button class="btn btn-danger btn-sm" onclick="deleteRestaurant(${index})">刪除</button>`;
    restaurantContainer.appendChild(div);
  });
}

function deleteRestaurant(index) {
  if (confirm("確定要刪除此餐廳嗎？")) {
    const restaurants = getRestaurants();
    restaurants.splice(index, 1);
    saveRestaurants(restaurants);
    displayRestaurants();
  }
}

function pickRestaurant() {
  const restaurants = getRestaurants();
  const history = getHistory();
  const recentRestaurants = history.slice(-14).map((entry) => entry.restaurant);
  const availableRestaurants = restaurants.filter(
    (r) => !recentRestaurants.includes(r)
  );
  if (availableRestaurants.length === 0) {
    alert("沒有足夠的餐廳可供選擇！");
    return;
  }
  const pickedRestaurant =
    availableRestaurants[
      Math.floor(Math.random() * availableRestaurants.length)
    ];
  const today = new Date().toISOString().split("T")[0];
  history.push({ date: today, restaurant: pickedRestaurant });
  if (history.length > 14) history.shift();
  saveHistory(history);
  displayHistory();
  alert(`今天吃的是：${pickedRestaurant}`);
}

function displayHistory() {
  const history = getHistory();
  const uniqueHistory = {};
  history.forEach((entry) => {
    uniqueHistory[entry.date] = entry.restaurant;
  });
  const historyContainer = document.getElementById("history");
  historyContainer.innerHTML = "";

  Object.keys(uniqueHistory).forEach((date) => {
    const restaurant = uniqueHistory[date];
    const div = document.createElement("div");
    div.className = "list-group-item edit-history";
    div.style = "display: flex; gap: 4px;";
    const dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"][
      new Date(date).getDay()
    ];
    div.innerHTML = `
            <span>${date} (星期${dayOfWeek})</span>
            <input type="text" value="${restaurant}" id="history-${date}" class="form-control" style="width: 0; flex-grow: 1;" />
            <button class="btn btn-primary btn-sm" onclick="saveHistoryEdit('${date}')">保存</button>`;
    historyContainer.appendChild(div);
  });
}

function saveHistoryEdit(date) {
  const history = getHistory();
  const editedRestaurant = document
    .getElementById(`history-${date}`)
    .value.trim();
  if (editedRestaurant) {
    const restaurants = getRestaurants();
    if (!restaurants.includes(editedRestaurant)) {
      restaurants.push(editedRestaurant);
      saveRestaurants(restaurants);
      displayRestaurants();
    }
    const entryIndex = history.findIndex((entry) => entry.date === date);
    if (entryIndex !== -1) {
      history[entryIndex].restaurant = editedRestaurant;
      saveHistory(history);
      displayHistory();
    }
  }
}

function exportData() {
  const restaurants = getRestaurants();
  const history = getHistory();
  const data = {
    restaurants: restaurants,
    history: history,
  };
  const dataStr = JSON.stringify(data);
  navigator.clipboard.writeText(dataStr).then(() => {
    alert("數據已導出到剪貼板！");
  });
}

function toggleImport() {
  const importData = document.getElementById("importData");
  const importButton = document.getElementById("importDataBtn");
  if (importButton.style.display === "none") {
    importData.style.display = "block";
    importButton.style.display = "block";
  } else {
    importData.style.display = "none";
    importButton.style.display = "none";
  }
}

function importData() {
  const dataStr = document.getElementById("importData").value.trim();
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if (Array.isArray(data.restaurants) && Array.isArray(data.history)) {
        saveRestaurants(data.restaurants);
        saveHistory(data.history);
        displayRestaurants();
        displayHistory();
        document.getElementById("importData").value = "";
        toggleImport();
      } else {
        alert("導入的數據格式不正確！");
      }
    } catch (e) {
      alert("導入的數據無法解析！");
    }
  }
}

displayRestaurants();
displayHistory();
