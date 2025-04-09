# 🍽️ Dine N Dash – Fullstack Monorepo

This monorepo contains both the **frontend (React)** and **backend (Node.js/Express)** for the Dine N Dash restaurant ordering platform.

---

## 📁 Folder Structure

```
DineNDash-Monorepo/
├── backend/               # Express.js backend
│   ├── prisma/            # Prisma schema and migrations
│   ├── src/               # Main app, routes, controllers
│   ├── .env               # Backend environment config
│   └── package.json       # Backend dependencies and scripts
│
├── frontend/              # React + Vite + Tailwind frontend
│   ├── public/            # Static HTML
│   ├── src/               # Main app files
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json       # Frontend dependencies and scripts
│
├── package.json           # Root-level scripts (monorepo)
├── EndpointsDocument.md   # API endpoints documentation
├── README.md              # You're reading it!
```

---

## ⚙️ Technologies Used

| Layer      | Stack                                              |
|------------|----------------------------------------------------|
| Frontend   | React, Vite, Tailwind CSS                          |
| Backend    | Node.js, Express.js                                |
| Database   | PostgreSQL (via Neon.tech)                         |
| ORM        | Prisma                                              |
| Auth       | JWT + bcrypt                                        |
| Realtime   | Socket.IO                                           |
| Payments   | Paymob (local Egyptian market support)             |
| Dev Tools  | Nodemon, Concurrently                              |
| Deployment | Vercel (Frontend), Render / Railway (Backend)      |

---

## 🚀 How to Run the App

### 📦 Install All Dependencies
```bash
cd DineNDash-Monorepo

# Install root tools (concurrently)
npm install

# Install backend and frontend
cd backend && npm install
cd ../frontend && npm install
```

### ▶️ Start Both Servers
From the root:
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🔐 Environment Variables

Create a `.env` file in `backend/`:

```env
DATABASE_URL=your_neon_db_url
JWT_SECRET=your_jwt_secret
PAYMOB_API_KEY=your_paymob_key
FRONTEND_URL=http://localhost:5173
```

---

## 📖 Useful Commands

```bash
# Start backend only
npm run dev --prefix backend

# Start frontend only
npm run dev --prefix frontend

# Build frontend for production
npm run build --prefix frontend
```

---

## 📌 Tips

- Do **not upload `node_modules`** to GitHub or ZIP files.
- Keep `.env` and secrets **outside version control**.
- Update `EndpointsDocument.md` as you create new APIs.

---

## 👨‍💻 Maintained by



---
