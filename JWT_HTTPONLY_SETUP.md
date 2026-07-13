# Angular Auth Integration with JWT + Refresh Tokens + HttpOnly Cookies

Your backend is configured with:
- ✅ JWT Access & Refresh Tokens
- ✅ HttpOnly Secure Cookies
- ✅ CORS Enabled
- ✅ Running on `https://localhost:7120`

## Updated Angular Setup

### 1. Backend URL
The API is now configured to use: **https://localhost:7120/api/auth**

### 2. Expected Backend Endpoints

#### Login
```
POST https://localhost:7120/api/auth/login

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "optional_if_not_using_httponly",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Register
```
POST https://localhost:7120/api/auth/register

Request:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: Same as login
```

#### Refresh Token (NEW)
```
POST https://localhost:7120/api/auth/refresh

Request: (empty body)
Cookies: (httpOnly refresh token sent automatically)

Response:
{
  "token": "new_jwt_token",
  "refreshToken": "optional_new_refresh_token"
}
```

#### Logout (NEW)
```
POST https://localhost:7120/api/auth/logout

Response: 200 OK
(Clears httpOnly refresh token cookie on backend)
```

### 3. How It Works

1. **Login** → AccessToken stored in localStorage, RefreshToken in HttpOnly cookie
2. **HTTP Request** → 
   - Bearer token added to Authorization header
   - HttpOnly cookie auto-included (browser handles it)
   - `withCredentials: true` enables cookie sending
3. **401 Response** → Auto-refresh access token using refresh endpoint
4. **Retry Request** → With new token automatically
5. **Logout** → Clears localStorage & backend clears HttpOnly cookie

### 4. Key Updates Made

#### AuthService
- ✅ API URL updated to `https://localhost:7120`
- ✅ `withCredentials: true` added to all auth requests
- ✅ `refreshAccessToken()` method for token refresh
- ✅ `handleTokenRefresh()` with request queuing to prevent race conditions
- ✅ Logout calls backend to clear HttpOnly cookies

#### AuthInterceptor
- ✅ Automatically adds Bearer token to requests
- ✅ Includes credentials (enables HttpOnly cookie sending)
- ✅ Catches 401 errors
- ✅ Auto-refreshes token and retries failed requests
- ✅ Prevents refresh loops

### 5. Security Features

✅ **Access Token** - Short-lived, in localStorage
✅ **Refresh Token** - Long-lived, in HttpOnly cookie (JS cannot access)
✅ **CORS Configured** - Only trusted origins allowed
✅ **Bearer Authentication** - Industry standard
✅ **Automatic Retry** - Seamless UX on token expiry
✅ **Request Deduplication** - Prevents multiple simultaneous refresh requests

### 6. CORS Requirements

Ensure your .NET backend includes:

```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:4200", 
                "https://localhost:4200"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // IMPORTANT: Enables cookie support
    });
});

// In pipeline
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
```

### 7. Running the Application

```bash
# Start Angular frontend
npm start
# Navigate to: http://localhost:4200

# .NET backend should be running on: https://localhost:7120
```

### 8. Testing the Flow

1. **Register/Login** → Token stored + redirected
2. **Make authenticated request** → Token auto-added
3. **Token expires** → Automatically refreshed
4. **New request with new token** → Request retried automatically
5. **Logout** → Token cleared, browser redirected to login

### 9. Handling Errors

The interceptor will:
- ✅ Auto-refresh on 401
- ✅ Display error if refresh fails
- ✅ Redirect to login on auth failure
- ✅ Queue requests during refresh to prevent race conditions

### 10. HttpOnly Cookies Best Practices

- The refresh token in HttpOnly cookie is:
  - ✅ Not accessible via JavaScript (XSS safe)
  - ✅ Automatically sent with requests (browser handles)
  - ✅ Secure flag enabled (HTTPS only)
  - ✅ SameSite flag set (CSRF protection)
  - ✅ Cleared on logout

## Example .NET Controller Updates

### Refresh Endpoint
```csharp
[HttpPost("refresh")]
[AllowAnonymous]
public async Task<IActionResult> Refresh()
{
    // Get refresh token from HttpOnly cookie
    var refreshToken = Request.Cookies["refreshToken"];
    
    if (string.IsNullOrEmpty(refreshToken))
        return Unauthorized();

    var user = await _userService.ValidateRefreshTokenAsync(refreshToken);
    
    if (user == null)
        return Unauthorized();

    var newAccessToken = GenerateJwtToken(user);
    var newRefreshToken = GenerateRefreshToken();

    // Store new refresh token in HttpOnly cookie
    Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7)
    });

    return Ok(new { token = newAccessToken });
}

[HttpPost("logout")]
[Authorize]
public IActionResult Logout()
{
    // Clear the HttpOnly cookie
    Response.Cookies.Delete("refreshToken");
    return Ok();
}
```

### Login Endpoint Update
```csharp
[HttpPost("login")]
[AllowAnonymous]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userService.AuthenticateAsync(request.Email, request.Password);
    
    if (user == null)
        return Unauthorized(new { message = "Invalid credentials" });

    var token = GenerateJwtToken(user);
    var refreshToken = GenerateRefreshToken();

    // Store refresh token in HttpOnly cookie
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7)
    });

    return Ok(new AuthResponse
    {
        Token = token,
        User = new UserDto { ... }
    });
}
```

## ✅ Ready to Go!

Your Angular app is now fully integrated with your .NET backend's:
- JWT access tokens
- Refresh token rotation
- HttpOnly secure cookies
- CORS policies
- Automatic token refresh on expiry
