# Supply Chain Traceability System - Setup Guide

## Database Options

This project supports three database configurations:

### 1. Lovable Cloud (Default - Recommended)
✅ **No setup required** - Works immediately  
✅ Built-in authentication  
✅ Automatic scaling  
✅ Row-level security

**When to use:** For quick deployment, development, and production use without managing infrastructure.

### 2. MongoDB (Self-Hosted)
📦 Great for flexible schema and document storage  
🔧 Requires local MongoDB or MongoDB Atlas  

**When to use:** When you need document-based storage or already have MongoDB infrastructure.

**Setup steps:**
1. Navigate to `server/` folder
2. Follow instructions in `server/README.md`
3. Update `.env.local`:
   ```
   VITE_DB_TYPE=mongodb
   VITE_API_ENDPOINT=http://localhost:3000/api
   ```

### 3. PostgreSQL (Self-Hosted)
🐘 Relational database with ACID compliance  
🔧 Requires local PostgreSQL or hosted service  

**When to use:** When you need traditional relational database features or already have PostgreSQL infrastructure.

**Setup steps:**
1. Navigate to `server/` folder
2. Follow instructions in `server/README.md`
3. Update `.env.local`:
   ```
   VITE_DB_TYPE=postgresql
   VITE_API_ENDPOINT=http://localhost:3000/api
   ```

## Development

### Using Lovable Cloud (Default)
```bash
npm install
npm run dev
```

### Using External Database
```bash
# Terminal 1: Start backend server
cd server
npm install
npm run dev

# Terminal 2: Start frontend
npm install
npm run dev
```

## Environment Variables

Create `.env.local` in the root directory:

```env
# Database Type (supabase | mongodb | postgresql)
VITE_DB_TYPE=supabase

# Only needed for external databases
VITE_API_ENDPOINT=http://localhost:3000/api

# MongoDB specific
VITE_MONGODB_URI=mongodb://localhost:27017
VITE_MONGODB_DATABASE=supply_chain

# PostgreSQL specific
VITE_PG_HOST=localhost
VITE_PG_PORT=5432
VITE_PG_DATABASE=supply_chain
VITE_PG_USER=postgres
VITE_PG_PASSWORD=your_password
```

## Production Deployment

### Frontend
- Deploy to Vercel, Netlify, or any static hosting
- Set environment variables in hosting platform

### Backend (for MongoDB/PostgreSQL)
- Deploy Node.js server to Heroku, Railway, DigitalOcean, etc.
- Update `VITE_API_ENDPOINT` to your deployed server URL

## Authentication

- **Lovable Cloud:** Built-in Supabase authentication
- **External Databases:** You'll need to implement your own authentication system

## Features

✅ Multi-role user system (Farmer, Manufacturer, Distributor, Retailer, Consumer)  
✅ Product management with traceability  
✅ Entry/Exit inventory tracking  
✅ QR code generation for batches  
✅ Supply chain visualization  
✅ Real-time updates (Lovable Cloud only)  

## Support

For issues or questions:
1. Check `server/README.md` for backend setup
2. Review database-specific documentation
3. Ensure environment variables are correctly set
