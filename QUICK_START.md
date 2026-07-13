# Quick Start Guide

## ✅ What's Been Created

Your Authentication UI project now includes:

### Components
- **Login Component** (`src/app/components/login/`)
  - Email/password form with validation
  - Error handling and loading states
  - Link to registration page

- **Register Component** (`src/app/components/register/`)
  - Form for email, password, first/last name
  - Password confirmation matching
  - Link to login page

### Services & Interceptors
- **AuthService** - Handles all API communication with backend
- **AuthInterceptor** - Automatically adds Bearer token to requests
- **AuthGuard** - Protects routes from unauthorized access

### Configuration
- Routes configured for `/login` and `/register`
- HTTP Client and interceptor configured in app.config.ts
- Default root route redirects to `/login`

## 🚀 Next Steps

### 1. Update Backend URL (if needed)
Edit `src/app/services/auth.service.ts`:
```typescript
private apiUrl = 'https://localhost:7001/api/auth'; // Change this line
```

### 2. Set Up Your .NET Core Backend

The backend needs two endpoints:

**POST /api/auth/login**
```json
Request: { "email": "user@example.com", "password": "pass123" }
Response: { "token": "jwt...", "user": { ... } }
```

**POST /api/auth/register**
```json
Request: { "email": "user@example.com", "password": "pass123", "firstName": "John", "lastName": "Doe" }
Response: { "token": "jwt...", "user": { ... } }
```

See `DOTNET_BACKEND_EXAMPLE.cs` for a complete sample controller.

### 3. Enable CORS in Backend
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
```

### 4. Start the Application
```bash
npm start
```
Navigate to `http://localhost:4200`

### 5. (Optional) Create Protected Routes
```typescript
// In app.routes.ts
import { authGuard } from './guards/auth.guard';

{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
```

## 📁 File Structure

```
src/app/
├── components/
│   ├── login/
│   │   ├── login.ts
│   │   ├── login.html
│   │   └── login.css
│   └── register/
│       ├── register.ts
│       ├── register.html
│       └── register.css
├── services/
│   └── auth.service.ts
├── interceptors/
│   └── auth.interceptor.ts
├── guards/
│   └── auth.guard.ts
├── app.routes.ts
├── app.config.ts
└── app.ts
```

## 🔐 How It Works

1. **User enters credentials** → Login component
2. **Form submits** → AuthService makes HTTP request
3. **Backend validates** → Returns JWT token
4. **Token stored** → localStorage
5. **Token sent** → AuthInterceptor adds to all requests
6. **Protected routes** → AuthGuard checks token

## 📝 Features

- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Token management
- ✅ Auto-redirect on login
- ✅ Responsive design
- ✅ Modern UI with gradients

## 🐛 Troubleshooting

**CORS Error?**
→ Check backend CORS configuration

**Token not sent?**
→ Verify HTTP interceptor is registered in app.config.ts

**Can't reach backend?**
→ Check API URL and ensure backend is running

**Validation not working?**
→ Ensure ReactiveFormsModule is imported

## 📚 Documentation

- See `AUTHENTICATION_SETUP.md` for detailed setup
- See `DOTNET_BACKEND_EXAMPLE.cs` for backend reference
- Components are fully commented for customization

## 🎨 Customization

All components use standalone architecture and can be easily modified:
- Styles are in separate `.css` files
- Templates are in `.html` files
- Component logic is in `.ts` files

Enjoy your authentication system! 🎉
