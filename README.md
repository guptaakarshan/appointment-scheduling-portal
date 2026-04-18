# Patient Appointment Scheduling Portal

A complete full-stack web application where:
- Patients can search doctors and book appointments
- Doctors can manage availability and appointment requests
- Admins can approve doctors and monitor the platform

Tech stack:
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js (MVC)
- Database: MongoDB + Mongoose
- Auth: JWT + role-based authorization

---

## 1) Project Structure

```text
data_engineering_project/
  backend/
    src/
      config/
        db.js
      controllers/
        adminController.js
        appointmentController.js
        authController.js
        doctorController.js
        notificationController.js
        patientController.js
      middlewares/
        authMiddleware.js
        errorMiddleware.js
      models/
        Appointment.js
        DoctorProfile.js
        Notification.js
        User.js
      routes/
        adminRoutes.js
        appointmentRoutes.js
        authRoutes.js
        doctorRoutes.js
        notificationRoutes.js
        patientRoutes.js
      scripts/
        seedAdmin.js
      services/
        emailService.js
        notificationService.js
      utils/
        asyncHandler.js
        generateToken.js
      server.js
    .env.example
    package.json

  frontend/
    src/
      api/
        client.js
      components/
        Navbar.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
      layouts/
        AppLayout.jsx
      pages/
        auth/
          LoginPage.jsx
          RegisterPage.jsx
        admin/
          AdminDashboard.jsx
        doctor/
          DoctorDashboard.jsx
        patient/
          PatientDashboard.jsx
        HomePage.jsx
      utils/
        date.js
      App.jsx
      index.css
      main.jsx
    .env.example
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js

  README.md
```

---

## 2) Database Design

### User Schema (`backend/src/models/User.js`)
- `name`: string
- `email`: unique string
- `password`: hashed with bcrypt
- `role`: `patient | doctor | admin`
- `isApproved`: used mainly for doctor approval workflow

### Doctor Profile Schema (`backend/src/models/DoctorProfile.js`)
- `doctor`: reference to User (doctor)
- `specialization`: string
- `bio`: string
- `experienceYears`: number
- `availability`: weekly slots
  - `dayOfWeek`: 0 to 6
  - `slots`: array of strings like `"09:00-09:30"`

### Appointment Schema (`backend/src/models/Appointment.js`)
- `patient`: reference to User
- `doctor`: reference to User
- `date`: appointment date (`YYYY-MM-DD` recommended)
- `timeSlot`: slot string
- `status`: `pending | confirmed | rejected | cancelled | completed`
- `bookedAt`, `updatedAtStatus`, timestamps

Double-booking prevention:
- Unique index on `{doctor, date, timeSlot}`
- Applied only to active statuses (`pending`, `confirmed`)

### Notification Schema (`backend/src/models/Notification.js`)
- `user`: reference to User
- `title`, `message`
- `isRead`
- `type`: booking/status/admin

---

## 3) Backend API (REST)

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register` - register patient/doctor
- `POST /auth/login` - login and receive JWT
- `GET /auth/me` - current user (protected)

### Patient
- `GET /patient/doctors?specialization=...` - search doctors
- `GET /patient/doctors/:doctorId` - doctor profile

### Appointments (Patient)
- `POST /appointments` - book appointment
- `GET /appointments/my` - patient history
- `PATCH /appointments/:appointmentId/cancel` - cancel
- `PATCH /appointments/:appointmentId/reschedule` - reschedule

### Doctor
- `PUT /doctor/availability` - set weekly slots
- `GET /doctor/appointments?date=...` - view appointments
- `PATCH /doctor/appointments/:appointmentId/status` - confirm/reject/complete
- `GET /doctor/schedule?date=YYYY-MM-DD` - daily schedule

### Admin
- `GET /admin/users` - all users
- `GET /admin/doctors` - all doctors
- `PATCH /admin/doctors/:doctorId/approval` - approve/reject doctor
- `GET /admin/appointments` - monitor appointments

### Notifications
- `GET /notifications` - list notifications
- `PATCH /notifications/:notificationId/read` - mark as read

---

## 4) Authentication and Authorization Flow

1. User logs in or registers.
2. Backend returns JWT.
3. Frontend stores token in `localStorage`.
4. Axios request interceptor sends `Authorization: Bearer <token>` automatically.
5. Backend `protect` middleware verifies token and attaches `req.user`.
6. Backend `authorize("role")` middleware restricts role-based routes.

---

## 5) Step-by-Step Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)

### Backend Setup
1. Open terminal:
   ```bash
   cd backend
   npm install
   ```
2. Create env file:
   ```bash
   copy .env.example .env
   ```
3. Update values in `.env`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - (optional) mail config for real email delivery
4. Optional: create admin account
   ```bash
   npm run seed:admin
   ```
5. Optional: load sample doctors
  ```bash
  npm run seed:doctors
  ```
6. Start backend:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open another terminal:
   ```bash
   cd frontend
   npm install
   ```
2. Create env file:
   ```bash
   copy .env.example .env
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```
4. Open browser at: `http://localhost:5173`

---

## 6) How Each Main Part Works (Student-Friendly)

### Backend MVC
- **Models** define database shape.
- **Controllers** contain business logic.
- **Routes** map URL endpoints to controller functions.
- **Middlewares** run before controllers for auth/validation/errors.
- **Services** hold reusable side effects (emails/notifications).

### Booking logic (very important)
In `appointmentController.js`:
- Check doctor exists and is approved
- Check selected slot is in doctor availability for that day
- Create appointment with `pending` status
- If same doctor/date/slot already active, MongoDB unique index throws duplicate key error (`11000`)
- Return conflict message (`409`) so UI can inform user

### Notifications
`notificationService.js` does two things:
- Creates in-app notification record in MongoDB
- Sends optional email (or logs mock output in local mode)

### Frontend architecture
- `AuthContext` stores logged-in user and token lifecycle
- `ProtectedRoute` blocks routes if user is not logged in or has wrong role
- Each dashboard calls backend APIs and updates local state
- Tailwind utility classes keep UI responsive and modern

---

## 7) Notes for College Students

- Start by understanding one flow first: `register -> login -> book appointment`.
- Use Postman to test backend endpoints before debugging frontend.
- Keep statuses consistent (`pending`, `confirmed`, etc.) between backend and frontend.
- When adding new feature, update:
  1. model (if DB shape changes)
  2. controller logic
  3. route
  4. frontend API call + UI

---

## 8) Future Improvements

- Add pagination and filters for large admin lists
- Add calendar UI for doctor availability
- Add WebSocket for live notifications
- Add unit/integration tests (Jest + Supertest + React Testing Library)
- Add Docker and CI/CD pipeline
