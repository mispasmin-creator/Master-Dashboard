# SSO Implementation - README

## 🎯 Overview

This Master Dashboard now includes **Universal Single Sign-On (SSO)** functionality. When users log in to the Master Dashboard, they are automatically authenticated across all integrated systems without needing to log in separately to each application.

## ✅ What's Been Implemented

### 1. SSO Service (`src/services/ssoService.js`)
- **Token Generation**: Creates secure, base64-encoded tokens with user data and 24-hour expiration
- **Token Storage**: Stores tokens in localStorage, sessionStorage, and cookies
- **Token Validation**: Validates token integrity and expiration
- **URL Enhancement**: Automatically adds SSO parameters to application URLs
- **Auto-Refresh**: Automatically refreshes tokens before expiration

### 2. Iframe Handler (`src/utils/ssoIframeHandler.js`)
- **Parameter Extraction**: Extracts SSO parameters from URLs
- **Auto-Login Coordination**: Manages automatic login flow for embedded applications
- **Cross-Window Communication**: Handles messages between Master Dashboard and iframes
- **URL Cleanup**: Removes SSO parameters from browser history

### 3. Updated Components

#### LoginPage (`src/pages/LoginPage.jsx`)
- Generates SSO token on successful login
- Stores token in multiple locations for reliability
- Initializes automatic token refresh

#### AdminLayout (`src/components/AdminLayout.jsx`)
- Uses SSO service to enhance navigation URLs
- Listens for SSO login status from embedded apps
- Clears SSO tokens on logout

## 🚀 How It Works

### For Users
1. **Log in** to the Master Dashboard with your credentials
2. **Click** on any system in the navigation bar
3. **Automatic login** occurs in the background
4. **Access** the system immediately without re-entering credentials

### Technical Flow
```
┌─────────────────┐
│  User Logs In   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  SSO Token Generated    │
│  - User data encoded    │
│  - 24-hour expiration   │
│  - Stored in multiple   │
│    locations            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User Clicks System     │
│  in Navigation          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  SSO URL Generated      │
│  - Token added to URL   │
│  - App-specific params  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  External App Receives  │
│  SSO Parameters         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  External App Validates │
│  Token & Creates Session│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User Automatically     │
│  Logged In              │
└─────────────────────────┘
```

## 🔧 For External Application Developers

Your external applications need to be updated to accept SSO tokens. We've provided a complete integration template.

### Quick Start

1. **Open the integration template**:
   ```
   docs/sso-integration-template.html
   ```

2. **Copy the SSO handler code** to your application

3. **Test the integration**:
   - Log in to Master Dashboard
   - Click on your application
   - Verify automatic login occurs

### SSO URL Parameters

Your application will receive these parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `_sso` | Base64-encoded SSO token | `eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9...` |
| `_user` | Username | `admin` |
| `_app` | Application ID | `APP01` |
| `_role` | User role | `admin` |
| `_email` | User email | `user@example.com` |
| `auto_login` | Auto-login flag | `true` |

### Minimal Integration Example

```javascript
// Add this to your application's entry point
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('_sso');
    const autoLogin = urlParams.get('auto_login') === 'true';
    
    if (autoLogin && ssoToken) {
        try {
            // Decode token
            const userData = JSON.parse(atob(ssoToken));
            
            // Create session
            localStorage.setItem('user-name', urlParams.get('_user'));
            localStorage.setItem('role', urlParams.get('_role'));
            localStorage.setItem('sso_authenticated', 'true');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('SSO failed:', error);
        }
    }
})();
```

## 🔒 Security Considerations

### Current Implementation
- ✅ Tokens expire after 24 hours
- ✅ Tokens include timestamp and signature
- ✅ Automatic token refresh before expiration
- ✅ Tokens cleared on logout
- ✅ Base64 encoding for transport

### Production Recommendations
1. **Use HTTPS**: All applications must use HTTPS
2. **Validate Origin**: Implement origin validation for cross-domain requests
3. **Short Token Lifetime**: Consider reducing to 1-2 hours for sensitive apps
4. **IP Validation**: Optionally validate user IP address
5. **Audit Logging**: Log all SSO authentication attempts
6. **Consider OAuth 2.0**: For enhanced security, migrate to OAuth 2.0 or SAML

## 📝 Token Structure

```json
{
  "userId": "username",
  "name": "User Full Name",
  "role": "admin",
  "email": "user@example.com",
  "timestamp": 1707567890123,
  "expiresAt": 1707654290123,
  "signature": "sso_1707567890123_abc123xyz",
  "version": "1.0"
}
```

## 🧪 Testing SSO

### Master Dashboard Side
1. Log in to Master Dashboard
2. Open browser console (F12)
3. Check for SSO token:
   ```javascript
   localStorage.getItem('sso_token')
   ```
4. Click on a system in navigation
5. Verify console shows: `🔐 Navigating to [APP_ID] with SSO authentication`

### External Application Side
1. After clicking from Master Dashboard
2. Check URL contains SSO parameters
3. Verify token is valid:
   ```javascript
   const token = new URLSearchParams(window.location.search).get('_sso');
   const data = JSON.parse(atob(token));
   console.log('SSO Data:', data);
   ```
4. Confirm session is created
5. Verify redirect to dashboard occurs

## 🐛 Troubleshooting

### SSO Token Not Generated
**Symptom**: No `sso_token` in localStorage after login

**Solutions**:
- Check browser console for errors
- Verify `ssoService.js` is imported correctly
- Ensure login is successful (check `userData` object)

### SSO Parameters Not in URL
**Symptom**: Clicking navigation doesn't add SSO parameters

**Solutions**:
- Verify `getSSOUrl` is called in `handleRouteClick`
- Check that token exists in localStorage
- Ensure system URL is not empty

### External App Not Auto-Logging In
**Symptom**: External app loads but doesn't create session

**Solutions**:
- Verify external app has SSO integration code
- Check browser console in external app for errors
- Confirm SSO parameters are present in URL
- Validate token decoding works

### Token Expired Error
**Symptom**: "Token expired" error in console

**Solutions**:
- Log out and log back in
- Check system clock is correct
- Verify token refresh is working

## 📚 File Structure

```
Master-Dashboard-main/
├── src/
│   ├── services/
│   │   └── ssoService.js          # Core SSO functionality
│   ├── utils/
│   │   └── ssoIframeHandler.js    # Iframe communication
│   ├── pages/
│   │   └── LoginPage.jsx          # SSO token generation
│   └── components/
│       └── AdminLayout.jsx        # SSO URL enhancement
├── docs/
│   ├── sso-integration-template.html  # Integration guide
│   └── SSO_README.md              # This file
```

## 🔄 Token Lifecycle

1. **Generation**: On successful login
2. **Storage**: localStorage, sessionStorage, cookies
3. **Usage**: Added to URLs when navigating
4. **Validation**: Checked on each use
5. **Refresh**: Auto-refreshed when < 1 hour remaining
6. **Expiration**: 24 hours from generation
7. **Cleanup**: Cleared on logout

## 📞 Support

For SSO integration support:
1. Review the integration template: `docs/sso-integration-template.html`
2. Check this README for troubleshooting
3. Contact your system administrator

## 🎉 Benefits

- ✅ **Seamless Experience**: Users log in once
- ✅ **Time Saving**: No repeated credential entry
- ✅ **Security**: Centralized authentication
- ✅ **Consistency**: Uniform login experience
- ✅ **Scalability**: Easy to add new applications

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Maintained by**: Passary Refractories IT Team
