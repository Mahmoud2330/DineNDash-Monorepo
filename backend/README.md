# 🍽️ Dine N Dash – Restaurant Ordering System

Dine N Dash is a web-based ordering system designed for restaurants to simplify table-side ordering, bill splitting, and payment processing through QR codes.

---

## 🚀 Features

- Scan QR code to view menu
- Digital ordering by customers
- Real-time receipt updates
- Split bill by item or evenly (with approval)
- Online payments via Paymob (for Egypt)
- Cash payment with staff confirmation
- Admin dashboard for managing users, menus, and analytics
- Fully responsive and mobile-first design

---

## ⚙️ Tech Stack

| Layer        | Tech                                       |
|--------------|--------------------------------------------|
| Frontend     | React.js + Tailwind CSS                    |
| Backend      | Node.js + Express.js                       |
| Database     | PostgreSQL (via Neon.tech)                 |
| ORM          | Prisma                                     |
| Realtime     | Socket.io (optional for live updates)      |
| Auth         | JWT + bcrypt + Supabase (or Firebase)      |
| Payments     | Paymob (for Egyptian market)               |
| Deployment   | Vercel (frontend), Render (backend)        |

---

## 📁 Project Structure

```
DineNDash-Backend/
├── prisma/                 # Prisma schema & migration
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── app.js              # Main Express app
│   ├── config/             # DB, Paymob, and environment configs
│   ├── controllers/        # Route logic (menu, orders, payments)
│   ├── routes/             # Express route handlers
│   ├── middlewares/        # JWT auth, error handling
│   ├── services/           # Business logic (Paymob, sessions)
│   ├── sockets/            # Socket.io setup (optional)
│   └── utils/              # Helpers (QR generation, bill splitting, etc.)
├── .env                    # Environment variables
├── package.json
├── README.md
└── EndpointsDocument.md
```

---

## 🔐 Environment Variables (.env)

```
DATABASE_URL=your_neon_postgres_url
PAYMOB_API_KEY=your_paymob_api_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

---

## 📦 Install & Run

1. **Clone the project**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file using the template above.

4. **Run the backend server**
   ```bash
   npm run dev
   ```

---

## 📚 Documentation

- [EndpointsDocument.md](./EndpointsDocument.md) – full list of REST API endpoints
- Prisma schema defined in: `prisma/schema.prisma`
- Paymob integration logic: `src/services/paymentService.js`

---

## 👨‍💻 Maintainers

Built and maintained by **Dine N Dash** team.  
For questions or collaboration: **mahmoud.ibrahim2330@gmail.com**
For questions or collaboration: **Hamzah.mansour@gmail.com**

---
