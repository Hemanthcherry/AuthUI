# Authentication UI - Integration Guide

This Angular application provides Login and Register components integrated with a .NET Core backend.

## Project Structure

```
src/app/
├── components/
│   ├── login/
│   │   ├── login.ts         (Login component)
│   │   ├── login.html       (Login template)
│   │   └── login.css        (Login styles)
│   └── register/
│       ├── register.ts      (Register component)
│       ├── register.html    (Register template)
│       └── register.css     (Register styles)
├── services/
│   └── auth.service.ts      (Authentication service for API calls)
├── interceptors/
│   └── auth.interceptor.ts  (HTTP interceptor for adding Bearer token)
├── guards/
│   └── auth.guard.ts        (Route guard for protected pages)
├── app.routes.ts            (Application routing)
├── app.config.ts            (Application configuration)
└── app.ts                   (Root component)
```

## Features

✅ **Login Component**
- Email and password validation
- Error handling and loading states
- Responsive design with gradient background
- Links to registration page

✅ **Register Component**
- Form validation for email, password, first/last names
- Password confirmation matching
- Success message after registration
- Links to login page

✅ **Authentication Service**
- Handles login and register API calls
- Token storage in localStorage
- Current user observable for reactive updates
- Methods to check authentication status

✅ **HTTP Interceptor**
- Automatically adds Bearer token to authenticated requests
- Ensures all protected API calls include the token

✅ **Auth Guard**
- Protects routes from unauthorized access
- Redirects to login if not authenticated

## .NET Core Backend Integration

### API Endpoints Required

The service expects the following endpoints on your .NET backend (default: `https://localhost:7001/api/auth`):

#### 1. **Login Endpoint**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "optional_refresh_token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### 2. **Register Endpoint**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "optional_refresh_token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Error Handling

For error responses, the service expects:

```json
{
  "message": "Invalid credentials"
}
```

All HTTP errors are caught and displayed in the UI.

## Configuration

### Update API URL

Edit [src/app/services/auth.service.ts](src/app/services/auth.service.ts) to match your backend URL:

```typescript
private apiUrl = 'https://localhost:7001/api/auth'; // Change this to your backend URL
```

### CORS Configuration

Ensure your .NET Core backend is configured to allow requests from your Angular frontend:

```csharp
services.AddCors(options => {
    options.AddPolicy("AllowAngular", builder => {
        builder
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

app.UseCors("AllowAngular");
```

## Usage

### Running the Application

```bash
npm start
```

Navigate to `http://localhost:4200/login` or `http://localhost:4200/register`

### Example: Using the Auth Service in a Component

```typescript
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true
})
export class DashboardComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
    // Navigate to login
  }
}
```

### Protecting Routes

```typescript
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
];
```

## Token Storage

The service stores authentication data in localStorage:
- `auth_token`: JWT token for API authentication
- `current_user`: User profile information

This allows the user to remain authenticated across browser sessions.

## Next Steps

1. ✅ Create your .NET Core backend endpoints matching the API contracts above
2. ✅ Update the API URL in the auth service
3. ✅ Configure CORS in your backend
4. ✅ Add a Dashboard component and protect it with authGuard
5. ✅ Implement refresh token logic if needed
6. ✅ Add password reset functionality
7. ✅ Add email verification

## Dependencies

The project uses the following Angular packages (already in package.json):
- `@angular/common` - Common utilities
- `@angular/forms` - Form handling and validation
- `@angular/router` - Routing
- `@angular/platform-browser` - HTTP client

No additional packages need to be installed.

## Styling

The components use a modern gradient design with:
- Purple gradient background (`#667eea` to `#764ba2`)
- Clean white forms with shadows
- Responsive design for mobile and desktop
- Smooth transitions and hover effects

You can customize colors in the respective `.css` files.

## Troubleshooting

### CORS Errors
- Ensure your .NET backend has CORS configured
- Check that the Angular app URL matches the allowed origins

### Token Not Being Sent
- Verify the HTTP interceptor is registered in `app.config.ts`
- Check that the token is stored in localStorage after login

### Form Validation Not Working
- Ensure `ReactiveFormsModule` is imported in the components
- Check that formControlNames match the form group definition

### Redirect Loop
- Verify routes are properly configured
- Check that dashboard route exists and is accessible
