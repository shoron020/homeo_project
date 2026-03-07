# 🚀 HomeoPharm BD – Setup Guide

This guide will help you get the medical store application up and running on your local machine or server.

---

## 📋 Prerequisites

Before you start, make sure you have the following installed:
- **Node.js**: v18 or higher
- **npm**: v10 or higher

---

## 🛠️ Initial Setup

### 1. Install Dependencies
Open your terminal in the project root folder and run:
```bash
npm install
```

### 2. Environment Variables
Copy the `.env.example` file to a new file named `.env`:
```bash
cp .env.example .env
```
Open the `.env` file and make the following changes:
- `BETTER_AUTH_SECRET`: Generate a random 32-character string (you can use `openssl rand -hex 32`).
- `DATABASE_URL`: By default, it uses SQLite (`file:./db.sqlite`). You can leave this as is for local testing.

### 3. Database Initialization
Run these commands to set up the database schema and seed the initial data (categories, products, blog posts):
```bash
npx prisma db push
npx prisma db seed
```

---

## 👨‍💻 Development Mode

To start the development server with Hot Module Replacement (HMR) and Turbo:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🏗️ Production Mode

To run a production-ready server:

### 1. Build the Application
This generates the optimized production bundle:
```bash
npm run build
```

### 2. Start the Production Server
```bash
npm run start
```

---

## 🛡️ Admin Setup

To access the management console at `/admin`, you must have the `ADMIN` role.

### Option A: Via Prisma Studio (Recommended for Visual Learners)
1. Run `npm run db:studio`.
2. Open your browser to the URL shown in the terminal (usually `http://localhost:5555`).
3. Click on the **User** table.
4. Find your account (you must register/login through the app first).
5. Change the `role` field from `USER` to `ADMIN`.
6. Click **Save 1 Change** at the top.
