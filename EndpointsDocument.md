# 📌 Dine N Dash – API Endpoints Documentation

This document contains the full breakdown of API endpoints used in the Dine N Dash web application for restaurants and users.

---

## 🔐 Authentication

| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/auth/register` | Register new user               |
| POST   | `/api/auth/login`    | Login existing user             |
| POST   | `/api/auth/reset`    | Send password reset code        |
| POST   | `/api/auth/reset/verify` | Verify reset and update password |

---

## 👤 Users

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| GET    | `/api/users/profile` | Get logged-in user profile         |
| PUT    | `/api/users/profile` | Update profile information         |
| PUT    | `/api/users/password`| Change password                    |
| DELETE | `/api/users/delete`  | Delete user account                |
| GET    | `/api/users/history` | View order history                 |

---

## 🍽️ Menu

| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/api/menu/:restaurantId`  | Get full menu for a restaurant       |
| GET    | `/api/menu/item/:id`       | Get specific menu item details       |
| POST   | `/api/menu`                | Create new menu item (admin only)    |
| PUT    | `/api/menu/:id`            | Edit menu item (admin only)          |
| DELETE | `/api/menu/:id`            | Delete menu item (admin only)        |

---

## 📦 Orders

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/orders`         | Create a new order                 |
| GET    | `/api/orders/:sessionId` | Get all orders in a table session |
| PUT    | `/api/orders/:id`     | Modify an existing order           |
| DELETE | `/api/orders/:id`     | Cancel an order                    |

---

## 💳 Payments

| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | `/api/payments/paymob`     | Initiate payment using Paymob        |
| POST   | `/api/payments/confirm`    | Webhook to confirm Paymob payment    |
| POST   | `/api/payments/cash`       | Confirm cash payment by waiter       |
| GET    | `/api/payments/:orderId`   | View payment status for an order     |

---

## 🧾 Receipt / Bill Splitting

| Method | Endpoint                         | Description                              |
|--------|----------------------------------|------------------------------------------|
| GET    | `/api/receipt/:sessionId`        | View receipt for a table session         |
| POST   | `/api/receipt/split-by-order`    | Split bill based on each person’s order  |
| POST   | `/api/receipt/split-even`        | Request to split the bill evenly         |
| POST   | `/api/receipt/split-approve`     | Staff approves even split request        |

---

## 🪑 Tables & Sessions

| Method | Endpoint                        | Description                           |
|--------|----------------------------------|---------------------------------------|
| GET    | `/api/table/qr/:tableId`        | Generate or get QR code for table     |
| POST   | `/api/session/start`            | Start a new table session             |
| POST   | `/api/session/end`              | End table session after payment       |

---

## 🛠️ Admin & Dashboard

| Method | Endpoint                        | Description                           |
|--------|----------------------------------|---------------------------------------|
| GET    | `/api/admin/users`              | View all registered users             |
| GET    | `/api/admin/orders`             | View all orders                       |
| GET    | `/api/admin/analytics`          | View analytics dashboard              |
| PUT    | `/api/admin/user/:id/status`    | Hold, block or restore user accounts  |
| PUT    | `/api/admin/menu/:id`           | Edit menu on behalf of restaurant     |
| POST   | `/api/admin/feedback`           | Respond to user complaints            |

---

## 💬 Feedback

| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| POST   | `/api/feedback`        | Submit user feedback            |
| GET    | `/api/feedback/all`    | Admin views all feedback        |

---

## 🔄 Utilities

| Method | Endpoint                | Description                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/api/utils/ping`       | Health check for server              |
| GET    | `/api/utils/version`    | Return current API version           |

---
> 📌 All authenticated endpoints require a valid JWT token in the `Authorization` header.

