# 🏥 Medical Information System (MIS)

<div align="center">

![Medical Info System](https://img.shields.io/badge/MIS-Medical%20Information%20System-blue?style=for-the-badge&logo=hospital)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)

**A comprehensive healthcare management system for the Peradeniya Medical Center**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Active-success)]()

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Project Structure](#️-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📚 API Documentation](#-api-documentation)
- [🔐 Security Features](#-security-features)
- [👥 User Roles](#-user-roles)
- [🗄️ Database Schema](#️-database-schema)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features

### 🎯 Core Functionality
- 👤 **User Management** - Multi-role authentication system
- 👨‍⚕️ **Doctor Dashboard** - Comprehensive patient management
- 🏥 **Patient Records** - Complete medical history tracking
- 💊 **Prescription Management** - Digital prescription system
- 🧪 **Lab Management** - Lab requests, results, and file uploads
- 💰 **Invoice System** - Automated billing and invoice generation
- 📅 **Appointment System** - Scheduling and reminder services
- 🔔 **Notifications** - Real-time notifications and announcements
- 🎫 **Support Tickets** - Help desk and support management
- 📊 **Medical Forms** - Digital form management with file uploads

### 🔒 Security Features
- 🛡️ **JWT Authentication** - Secure token-based authentication
- 🔐 **Google OAuth** - Single sign-on integration
- 🔒 **Password Encryption** - Encrypted password storage
- 👮 **Role-Based Access** - Granular permission system
- 📝 **Audit Logging** - Complete activity tracking

### 📱 User Experience
- 💻 **Responsive Design** - Mobile-friendly interface
- 🎨 **Material Design** - Modern UI with Material-UI
- 📈 **Data Visualization** - Charts and analytics with Recharts
- 🕐 **Real-time Updates** - Live data synchronization

---

## 🛠️ Technology Stack

### 🔧 Backend
| Technology | Version | Description |
|------------|---------|-------------|
| ☕ **Java** | 17 | Programming language |
| 🌱 **Spring Boot** | 3.5.3 | Application framework |
| 🔐 **Spring Security** | Latest | Authentication & authorization |
| 🗄️ **MySQL** | Latest | Primary database |
| 🔌 **Spring Data JPA** | Latest | ORM and data access |
| 🔑 **JWT** | 0.11.5 | Token-based authentication |
| 🔒 **Lombok** | Latest | Code generation |
| 🧪 **JUnit** | Latest | Testing framework |

### ⚛️ Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| ⚛️ **React** | 19.1.0 | UI framework |
| 🎨 **Material-UI** | 7.1.1 | UI component library |
| 🔄 **React Router** | 7.6.2 | Client-side routing |
| 📊 **Recharts** | 3.1.2 | Data visualization |
| 🔗 **Axios** | 1.11.0 | HTTP client |
| 🔑 **Google OAuth** | 0.12.2 | Authentication provider |
| 📅 **Date Pickers** | 8.10.2 | Date handling |

---

## 🏗️ Project Structure

```
Medical-Information-System/
├── 📁 Backend/                    # Spring Boot Application
│   ├── 📄 pom.xml                # Maven configuration
│   └── 📁 src/main/java/com/mis/
│       ├── 📄 BackendApplication.java
│       ├── 📁 controller/        # REST controllers
│       ├── 📁 service/          # Business logic
│       ├── 📁 model/            # Entity models
│       ├── 📁 repository/       # Data access layer
│       ├── 📁 dto/              # Data transfer objects
│       ├── 📁 mapper/           # Object mapping
│       ├── 📁 security/         # Security configuration
│       └── 📁 configuration/    # App configurations
└── 📁 FrontEnd/                  # React Application
    ├── 📄 package.json          # NPM dependencies
    ├── 📁 public/              # Static assets
    └── 📁 src/
        ├── 📄 index.js          # Application entry point
        └── 📁 components/       # React components
```

---

## ⚡ Quick Start

### 🚀 Prerequisites
- ☕ **Java 17+** and **Maven**
- 📦 **Node.js 16+** and **npm**
- 🗄️ **MySQL 8.0+**
- 🔧 **VS Code** (recommended)

### 📥 Clone Repository
```bash
git clone <repository-url>
cd Medical-Information-System
```

### 🗄️ Database Setup
1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE mis_db;
   ```

2. **Configure Database Connection:**
   ```properties
   # Backend/src/main/resources/application.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/mis_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 🔧 Backend Setup
```bash
cd Backend
mvn clean install
mvn spring-boot:run
```
🚀 **Backend runs on:** `http://localhost:8080`

### ⚛️ Frontend Setup
```bash
cd FrontEnd
npm install
npm start
```
🌐 **Frontend runs on:** `http://localhost:3000`

---

## 🔧 Configuration

### 🔐 Environment Variables

#### Backend (.env)
```properties
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mis_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 🔒 Security Configuration
- **JWT Token Expiration:** 24 hours
- **Password Encryption:** BCrypt
- **Google OAuth 2.0** integration
- **CORS** configuration for frontend access

---

## 📚 API Documentation

### 🔐 Authentication Endpoints
```
POST /api/auth/login         # User login
POST /api/auth/register      # User registration
POST /api/auth/logout        # User logout
GET  /api/auth/profile       # Get user profile
```

### 👥 User Management
```
GET    /api/users            # Get all users
GET    /api/users/{id}       # Get user by ID
PUT    /api/users/{id}       # Update user
DELETE /api/users/{id}       # Delete user
```

### 👨‍⚕️ Doctor Management
```
GET    /api/doctors          # Get all doctors
GET    /api/doctors/{id}     # Get doctor details
POST   /api/doctors          # Create doctor
PUT    /api/doctors/{id}     # Update doctor
```

### 🏥 Patient Management
```
GET    /api/patients         # Get all patients
GET    /api/patients/{id}    # Get patient details
POST   /api/patients         # Create patient
PUT    /api/patients/{id}    # Update patient
```

### 💊 Prescription Management
```
GET    /api/prescriptions    # Get all prescriptions
POST   /api/prescriptions    # Create prescription
GET    /api/prescriptions/{id} # Get prescription details
```

### 🧪 Lab Management
```
GET    /api/lab-requests     # Get lab requests
POST   /api/lab-requests     # Create lab request
GET    /api/lab-requests/{id} # Get lab request details
```

---

## 🔐 Security Features

### 🛡️ Authentication & Authorization
- **JWT-based** stateless authentication
- **Google OAuth 2.0** integration
- **Role-based access control** (RBAC)
- **Password encryption** with BCrypt
- **Session management** and timeout

### 🔒 Data Protection
- **Input validation** and sanitization
- **SQL injection** prevention
- **XSS protection**
- **CSRF tokens** for forms
- **HTTPS enforcement** in production

### 📝 Audit & Monitoring
- **Complete audit logging** for all actions
- **User activity tracking**
- **Failed login attempt monitoring**
- **System health monitoring** with Spring Boot Actuator

---

## 👥 User Roles

### 🔑 Role Hierarchy
1. **👑 Admin** - Full system access
2. **👨‍⚕️ Doctor** - Patient care management
3. **💊 Pharmacist** - Medicine and prescription management
4. **🧪 Lab Technician** - Laboratory management
5. **👨‍🏫 Staff** - Faculty and administrative staff
6. **🎓 Student** - University students

### 👤 User Types & Functionalities

#### 👑 Admin
**Primary Responsibilities:**
- **User Management**
  - View all users with filtering by status, role, and search term
  - Approve pending user registrations
  - Disable and reactivate user accounts
  - Edit user profiles and change passwords
  - Reset user passwords with temporary password generation
- **System Administration**
  - Access complete audit logs with date range filtering
  - Manage system-wide announcements and notifications
  - Oversee support ticket management
  - Respond to support tickets and close resolved issues
- **Data Management**
  - View system reports and analytics
  - Manage system configuration settings
  - Access prescription data migration tools

#### 👨‍⚕️ Doctor
**Primary Responsibilities:**
- **Patient Care**
  - View complete patient medical records and history
  - Access patient medical forms and documents
  - View patient vital signs and examination results
- **Prescription Management**
  - Create new prescriptions with digital signatures and seals
  - Add prescription items with medication details
  - Set administration routes and timing schedules
  - Sign prescriptions digitally with doctor seal
- **Medical Records**
  - Create and update diagnosis records
  - Document medical forms and patient information
  - Access eye and dental examination records
- **Appointments**
  - Manage patient appointment schedules
  - Set availability and working hours
  - View appointment history and status

#### 💊 Pharmacist
**Primary Responsibilities:**
- **Medicine Management**
  - Add new medicines to the system inventory
  - Update medicine details and information
  - Delete medicines from the inventory system
  - Search and view available medicines
- **Prescription Processing**
  - View pending prescription queue
  - Dispense prescribed medications
  - Mark prescriptions as completed
  - Process manual medication dispensing
- **Inventory Control**
  - Monitor medicine stock levels
  - Track prescription fulfillment
  - Generate pharmacy reports and statistics
- **Quality Assurance**
  - Verify prescription authenticity
  - Ensure proper medication dispensing
  - Maintain dispensing records

#### 🧪 Lab Technician
**Primary Responsibilities:**
- **Lab Request Management**
  - View all laboratory test requests
  - Filter requests by status (pending, in-progress, completed)
  - Update request status and progress
  - Access requests by specific patient
- **Result Processing**
  - Upload laboratory test result files (PDF format)
  - Download and view existing result files
  - Manage lab result documentation
  - Ensure proper file formatting and storage
- **Quality Control**
  - Verify test result accuracy
  - Maintain lab result records
  - Track test completion times
  - Manage lab equipment and supplies

#### 👨‍🏫 Staff
**Primary Responsibilities:**
- **Personal Medical Records**
  - View own completed prescriptions
  - Access personal medical history
  - View examination results and lab reports
- **Profile Management**
  - Update personal information and contact details
  - Manage faculty and department information
  - View and edit date of birth and gender
- **Appointments**
  - Schedule and manage appointments
  - View appointment history
  - Receive appointment notifications
- **Support Services**
  - Create and track support tickets
  - Receive system announcements
  - Access help desk services

#### 🎓 Student
**Primary Responsibilities:**
- **Personal Medical Records**
  - View own completed prescriptions
  - Access personal medical history and records
  - View examination results and lab reports
- **Profile Management**
  - Update personal information and contact details
  - Manage hostel and room information
  - Update registration number and faculty details
  - View and edit date of birth and gender
- **Academic Integration**
  - Automatic registration number extraction from email
  - Faculty identification from university email
  - Hostel accommodation tracking
- **Appointments**
  - Schedule and manage medical appointments
  - View appointment history and status
  - Receive appointment reminders
- **Support Services**
  - Create and track support tickets
  - Receive health-related announcements
  - Access student health resources

### 🔐 Role-Based Access Control
Each role has specific permissions enforced through:
- **JWT Token Authentication** with role-based claims
- **Spring Security** `@PreAuthorize` annotations
- **Resource-level access control** for sensitive data
- **Audit logging** for all role-specific actions
- **Data encryption** for sensitive medical information

---

## 🗄️ Database Schema

### 📊 Core Tables
- **👤 Users** - Authentication and profile data
- **👨‍⚕️ Doctors** - Medical professional information
- **🏥 Patients** - Patient records and medical history
- **📅 Appointments** - Scheduling and management
- **💊 Prescriptions** - Medication tracking
- **🧪 Lab Requests** - Laboratory test requests
- **💰 Invoices** - Billing and payment tracking
- **🔔 Notifications** - System notifications
- **🎫 Support Tickets** - Help desk management

### 🔗 Relationships
- **One-to-Many:** Doctor → Prescriptions
- **Many-to-Many:** Patients ↔ Doctors
- **One-to-One:** Users ↔ Profiles
- **Parent-Child:** Appointments → Notifications

---

## 🧪 Testing

### 🔧 Backend Testing
```bash
cd Backend
mvn test                    # Run all tests
mvn test -Dtest=UserServiceTest  # Run specific test
```

### ⚛️ Frontend Testing
```bash
cd FrontEnd
npm test                    # Run React tests
npm run test:coverage      # Run with coverage
```

---

## 🚀 Deployment

### 🐳 Docker Deployment
```dockerfile
# Backend Dockerfile
FROM openjdk:17-jre-slim
COPY target/Backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]

# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

### ☁️ Production Deployment
- **Backend:** Deploy to AWS EC2, Heroku, or Google Cloud
- **Frontend:** Deploy to Vercel, Netlify, or AWS S3
- **Database:** MySQL on AWS RDS or Google Cloud SQL
- **Security:** SSL certificates, environment variable management

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 **Fork the repository**
2. 🌱 **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. ✏️ **Commit changes:** `git commit -m 'Add amazing feature'`
4. 🚀 **Push to branch:** `git push origin feature/amazing-feature`
5. 📝 **Open a Pull Request**

### 📋 Development Guidelines
- Follow **clean code** principles
- Write **comprehensive tests**
- Update **documentation** for new features
- Use **meaningful commit messages**
- Follow **code style guidelines**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Peradeniya Medical Center

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Support & Contact

- 📧 **Email:** support@mis-project.com
- 🌐 **Website:** [https://mis-project.com](https://mis-project.com)
- 📖 **Documentation:** [docs.mis-project.com](https://docs.mis-project.com)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/your-repo/issues)

---

<div align="center">

**Built with ❤️ for better healthcare management**

[⬆️ Back to Top](#-medical-information-system-mis)

</div>
