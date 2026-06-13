# Namma Ride Project Setup & Installation Guide

This repository contains the complete codebase for **Namma Ride**, consisting of a Django backend and three React frontends.

---

## 📂 Project Architecture
- **`backend/`**: Django REST Framework backend service.
- **`admin-app/`**: React-based admin control center for fleet, surge pricing, settings, and support.
- **`rider-app/`**: React-based mobile-web app for drivers/riders.
- **`chennai rapido/`**: React-based mobile-web passenger app.

---

## 🛠️ System Prerequisites
Before starting, ensure you have the following installed on your system:
1. **Python** (version 3.10 or higher)
2. **Node.js** (version 18 or higher) & **npm**
3. **MySQL Server** (running locally on port 3306)
4. **Redis Server** (running locally on port 6379, optional but recommended for search caches)

---

## 🚀 Step-by-Step Installation

### 1. Database Setup
1. Open MySQL Command Line or your favorite SQL client (e.g., DBeaver, MySQL Workbench).
2. Create the project database:
   ```sql
   CREATE DATABASE nammaride;
   ```
3. Verify that the database configuration in `backend/backend_project/settings.py` matches your MySQL credentials (default user: `root`, default password: `root`).

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   # On Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Django migrations to build the tables:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. (Optional) Seed initial data:
   ```bash
   python seed_data.py
   ```
6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   The backend will run at `http://localhost:8000/`.

---

### 3. Frontends Setup (Admin App, Rider App, Chennai Rapido)
Each frontend folder has a React application. Repeat these steps for all three directories (`admin-app`, `rider-app`, and `chennai rapido`):

1. Navigate to the app directory (e.g., `admin-app`):
   ```bash
   cd ../admin-app
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the application in development mode:
   ```bash
   npm run dev
   ```

*Note: Dev servers will run on different local ports (e.g. `http://localhost:5173`). Configure environment variables if hosting URLs change.*

---

## 🛠️ Development & Features
- **Surge Pricing Dashboard**: Fully database-backed CRUD. Configure multipliers, rain mode, emergency lockdowns, and scheduled surge blocks from the admin app.
- **Rider Incentive / Bonus Wallets**: Managed via the driver list view in the admin app, using manual adjustments (credit/debit).
