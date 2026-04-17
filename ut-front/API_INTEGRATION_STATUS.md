# Frontend API Integration Status

## ✅ Created

### New Files
- `src/services/api.ts` - Complete API client with all endpoints
- `src/context/AuthContext.tsx` - Authentication context & provider

### Modified Files
- `src/pages/LoginPage/LoginPage.tsx` - Updated to call `/api/auth/login`

---

## 🔴 NOT YET CONNECTED (Needs Implementation)

### Pages Requiring API Integration

#### 1. **SignUpPage** (`src/pages/SignUpPage/SignUpPage.tsx`)
- **Missing**: Call to `authAPI.register()` in AuthForm or SignUpPage
- **API Endpoint**: `POST /api/auth/register`
- **Required Data**: email, password, name, phone (optional)
- **Components**: Uses `AuthForm` shared component
- **Action**: Update AuthForm or SignUpPage to call `useAuth().register()`

#### 2. **VehiclesPage** (`src/pages/VehiclesPage/VehiclesPage.tsx`)
- **Missing**: 
  - Load vehicles from API on mount (currently uses MOCK_VEHICLES)
  - Create vehicle via `vehiclesAPI.create()`
  - Delete/Edit vehicles
- **API Endpoints**: 
  - `GET /api/vehicles` - list vehicles
  - `POST /api/vehicles` - add vehicle
- **Components**: VehicleForm needs to call API
- **Action**: Add `useEffect` to fetch vehicles, connect form submit to API

#### 3. **BookingWizard** (`src/pages/BookingWizard/BookingWizard.tsx`)
- **Missing**:
  - Load services from API (currently hardcoded dummy data)
  - Fetch user vehicles for selection
  - Create appointment via `appointmentsAPI.create()`
- **API Endpoints**:
  - `GET /api/services` - list services
  - `GET /api/vehicles` - list user vehicles
  - `POST /api/appointments` - book appointment
- **Components**: ServiceCard, VehicleSelector, DateTimePicker, BookingSummary
- **Action**: Load services & vehicles on mount, connect final submit to booking API

#### 4. **DashboardPage** (`src/pages/DashboardPage/DashboardPage.tsx`)
- **Missing**:
  - Load appointments from API (currently uses MOCK data)
  - Filter into upcoming/past
- **API Endpoints**: `GET /api/appointments`
- **Components**: AppointmentCard
- **Action**: Add `useEffect` to fetch appointments, populate AppointmentCard

#### 5. **AppointmentDetailsPage** (`src/pages/AppointmentDetailsPage/AppointmentDetailsPage.tsx`)
- **Missing**:
  - Load appointment details by ID
  - Load associated transactions
  - Update appointment status
- **API Endpoints**:
  - `GET /api/appointments/:id`
  - `GET /api/transactions/:appointmentId`
- **Action**: Fetch appointment & transactions on mount using route param

#### 6. **AccountSettingsPage** (`src/pages/AccountSettingsPage/AccountSettingsPage.tsx`)
- **Missing**:
  - Load user profile data
  - Update profile (name, email, phone)
  - Update password
- **API Endpoints**: Need to add to backend:
  - `GET /api/auth/profile` (or use stored context)
  - `PUT /api/auth/profile` 
  - `PUT /api/auth/password`
- **Components**: Profile form, Password form
- **Action**: Create user profile endpoints on backend, connect form submits

#### 7. **ServicesPage** (`src/pages/ServicesPage/ServicesPage.tsx`)
- **Missing**: Load services from API
- **API Endpoints**: `GET /api/services`
- **Components**: ServiceCard
- **Action**: Add `useEffect` to fetch services

#### 8. **ContactPage** (`src/pages/ContactPage/ContactPage.tsx`)
- **Missing**: Send contact message to backend
- **API Endpoints**: Need to add to backend:
  - `POST /api/contact` (new endpoint)
- **Components**: Contact form
- **Action**: Create contact endpoint on backend, connect form submit

#### 9. **PasswordResetPage** (`src/pages/PasswordResetPage/PasswordResetPage.tsx`)
- **Missing**: Implement password reset flow
- **API Endpoints**: Need to add to backend:
  - `POST /api/auth/reset-password-request`
  - `POST /api/auth/reset-password-confirm`
- **Action**: Create password reset endpoints on backend

---

## 📋 Backend Endpoints Still Needed

Add these to `ut-api`:

1. **User Profile**
   - `GET /api/users/profile` - get current user profile
   - `PUT /api/users/profile` - update profile (name, phone)
   - `PUT /api/users/password` - change password

2. **Vehicles (Extended)**
   - `DELETE /api/vehicles/:id` - delete vehicle
   - `PUT /api/vehicles/:id` - update vehicle

3. **Appointments (Extended)**
   - `GET /api/appointments/:id` - get appointment details
   - `PUT /api/appointments/:id` - update appointment status

4. **Contact**
   - `POST /api/contact` - submit contact form

5. **Password Reset**
   - `POST /api/auth/reset-password-request` - request reset
   - `POST /api/auth/reset-password-confirm` - confirm reset with token

6. **Services (Full)**
   - Already: `GET /api/services`, `POST /api/services`
   - Might add: `GET /api/services/:id`, etc.

---

## 🔐 Auth Guard Component (Missing)

Need to create:
- `src/components/layout/PrivateRoute/PrivateRoute.tsx` or similar
- Wrap protected routes (Dashboard, Vehicles, Appointments, etc.)
- Redirect to login if not authenticated

---

## 📦 Setup Steps

1. **Wrap app with AuthProvider** in `src/main.tsx`:
   ```tsx
   import { AuthProvider } from './context/AuthContext'
   
   ReactDOM.createRoot(...).render(
     <BrowserRouter>
       <AuthProvider>
         <App />
       </AuthProvider>
     </BrowserRouter>
   )
   ```

2. **Update other pages** to use `useAuth()` and call API methods

3. **Add missing backend endpoints** as listed above

4. **Create PrivateRoute component** to protect authenticated pages

---

## Summary

**Pages with API calls**: 1/9 (LoginPage)  
**Pages needing work**: 8/9  
**Backend endpoints needed**: 10+ additional  
**New components needed**: 1 (PrivateRoute)
