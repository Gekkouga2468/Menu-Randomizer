# 🎠 Menu Randomizer

A simple and interactive web app that helps you decide **what to eat** by organizing dishes into categories and randomly selecting from them.

---

## 🚀 Live Demo

👉 https://gekkouga2468.github.io/Menu-Randomizer/

---

## ✨ Features

* 🎠 **3D Carousel UI**
  Spin through categories with smooth drag interaction.

* ➕ **Create Categories**
  Add up to 10 custom categories (e.g., Breakfast, Lunch, Dinner).

* 🍽 **Add & Manage Dishes**
  Add, edit, or delete dishes inside each category.

* 🎲 **Smart Randomizer**
  Picks dishes from categories in a rotating cycle.

* ✅ **Accept / Decline Flow**

  * Accept → marks dish as used
  * Decline → skips and tries again next time

* 👆 **Manual Selection**
  Pick any dish directly from a category.

* ↩️ **Restore Used Dishes**
  Bring back previously used dishes into the pool.

* 🕐 **History Tracking**
  Stores the last 30 selected dishes (random + manual).

* ☰ **Reorder Categories**
  Drag-and-drop categories to control randomization order.

* 📱 **Responsive Design**
  Optimized for both desktop and mobile devices.

---

## 🛠 Tech Stack

* **React** (Hooks-based architecture)
* **Vite** (fast build tool)
* **CSS (modular structure)**
* **@dnd-kit** (drag-and-drop)
* **LocalStorage** (persistent data)

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/gekkouga2468/Menu-Randomizer.git
cd Menu-Randomizer
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

---

## 🏗 Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```
## 💡 How It Works

* Categories are stored as **cards**
* Each card contains a list of dishes
* Randomizer cycles through categories using a **custom order**
* Selected dishes are tracked to avoid repeats
* All data is persisted using **localStorage**

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙌 Acknowledgements

* React
* Vite
* dnd-kit

---

## 👤 Author
Built by @Gekkouga2468
