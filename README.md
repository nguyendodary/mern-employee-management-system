# Employee Management System (EMS)

A full-stack Employee Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🎯 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin & Employee)
- Protected routes on both frontend and backend

### Admin Dashboard
- **Employee Management**: CRUD operations for employees
- **Attendance Records**: View and filter attendance records
- **Leave Management**: Approve/reject leave requests
- **Payroll Management**: Generate and manage payslips
- **Dashboard Analytics**: View statistics and trends

### Employee Dashboard
- **Check-in/Check-out**: Mark daily attendance
- **Leave Application**: Apply for different types of leave
- **Attendance History**: View personal attendance records
- **Payslips**: View and download salary slips
- **Profile Management**: Update personal information

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Node-cron** - Background jobs

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📂 Project Structure

```
ems/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── admin/    # Admin-specific components
│   │   │   ├── employee/ # Employee-specific components
│   │   │   └── common/   # Shared components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # Admin pages
│   │   │   ├── employee/ # Employee pages
│   │   │   └── auth/     # Auth pages
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Node.js Backend
│   ├── config/           # Database config
│   ├── controllers/      # Route controllers
│   ├── jobs/             # Background jobs
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── seed/             # Database seeding
│   ├── utils/            # Utility functions
│   ├── .env.example      # Environment template
│   ├── index.js          # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ems
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   
   Copy the example env file and configure:
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ems
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=7d
   
   # Email (optional - for notifications)
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=your_mailtrap_user
   MAIL_PASS=your_mailtrap_pass
   
   CLIENT_URL=http://localhost:5173
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```
   
   This creates:
   - Admin: `admin@ems.com` / `admin123`
   - Employees: `alice@ems.com` / `emp123`

### Running the Application

1. **Start Backend**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Employees (Admin only)
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get all attendance (Admin)
- `POST /api/attendance/checkin` - Check in (Employee)
- `POST /api/attendance/checkout` - Check out (Employee)
- `GET /api/attendance/me` - My attendance (Employee)
- `GET /api/attendance/today` - Today's status (Employee)

### Leaves
- `GET /api/leaves` - Get all leaves (Admin)
- `GET /api/leaves/me` - My leaves (Employee)
- `POST /api/leaves` - Apply for leave (Employee)
- `PUT /api/leaves/:id/review` - Review leave (Admin)

### Payroll
- `GET /api/payroll` - Get all payrolls (Admin)
- `GET /api/payroll/me` - My payslips (Employee)
- `POST /api/payroll/generate` - Generate payroll (Admin)
- `PUT /api/payroll/:id/pay` - Mark as paid (Admin)

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats

## 👤 User Roles

### Admin
- Full access to all features
- Manage employees, attendance, leaves, and payroll
- View analytics and reports

### Employee
- View and update personal profile
- Mark attendance (check-in/check-out)
- Apply for leave
- View payslips
- View attendance history

## ⚙️ Background Jobs

The system includes scheduled background jobs:

1. **Daily Attendance Reminder** (9:00 AM weekdays)
   - Sends email reminders to employees who haven't checked in

2. **Monthly Payroll Reminder** (25th of each month)
   - Reminds admin to generate payroll

## 🧪 Testing Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ems.com | admin123 |
| Employee | alice@ems.com | emp123 |
| Employee | bob@ems.com | emp123 |
| Employee | carol@ems.com | emp123 |

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Protected API endpoints
- Input validation
- Error handling

## 📧 Email Configuration

The system uses Nodemailer for email notifications. For development:

1. Use [Mailtrap](https://mailtrap.io) for testing
2. Update `.env` with Mailtrap credentials
3. Emails are logged to console if email fails

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data

# Or use MongoDB Atlas and update MONGO_URI
```

### Port Already in Use
```bash
# Find and kill process using port 5000
npx kill-port 5000

# Or change PORT in .env
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐳 Docker Deployment

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start with Docker

1. **Clone and navigate to project**
   ```bash
   cd ems
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Seed the database (first time only)**
   ```bash
   docker-compose exec server npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - MongoDB: localhost:27017

### Docker Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Restart specific service
docker-compose restart server
```

### Docker Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.yml build
   ```

2. **Push to registry** (optional)
   ```bash
   docker tag ems-server your-registry/ems-server:latest
   docker push your-registry/ems-server:latest
   ```

3. **Deploy to server**
   ```bash
   # On production server
   docker-compose pull
   docker-compose up -d
   ```

## 🎨 Customization

### Tailwind CSS
Edit `client/tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Breakpoints

### Environment Variables
Create `.env` files for different environments:
- `.env.development`
- `.env.production`

## 📄 License

This project is licensed under the MIT License.
