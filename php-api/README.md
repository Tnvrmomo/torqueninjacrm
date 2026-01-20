# NinjaCRM PHP API

This is the PHP backend API for NinjaCRM, replacing Supabase with MySQL.

## Setup

1. Import `ninjacrm.sql` into your MySQL database
2. Copy `.env` and update the database credentials
3. Upload the PHP files to your web server
4. Update the frontend `.env` to point to your API URL

## Endpoints

### Authentication
- `POST /auth/signin` - Sign in with email/password
- `POST /auth/signup` - Sign up new user
- `GET /auth/user` - Get current user info

### Tables
- `GET /api/{table}` - Select records
- `POST /api/{table}` - Insert record
- `PUT /api/{table}?id={id}` - Update record
- `DELETE /api/{table}?id={id}` - Delete record

Query parameters:
- `eq={column},{value}` - Filter by equality
- `order={column}` - Order by column
- `single=1` - Return single record

## Security

- Uses JWT tokens for authentication
- Passwords are hashed with bcrypt
- Company-based data isolation