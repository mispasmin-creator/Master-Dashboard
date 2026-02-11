# 🚀 Quick Setup Guide - Auto-Login for All Systems

## What This Does

✅ Log in to Master Dashboard **ONCE**  
✅ Click any system in navigation bar  
✅ **Automatically logged in** - no password needed!

---

## 📝 Setup Instructions

### For Each External System (Store FMS, Production FMS, MIS, etc.)

#### Step 1: Find the Login Page HTML File

Look for files like:
- `index.html`
- `login.html`
- `signin.html`
- Or the main HTML file of your app

#### Step 2: Copy This Script

```html
<!-- AUTO-LOGIN SCRIPT - Add before </body> tag -->
<script>
(function() {
    console.log('🔐 Auto-Login Enabled');
    
    function autoLogin() {
        try {
            // Get credentials from Master Dashboard
            const creds = JSON.parse(localStorage.getItem('app_credentials') || '{}');
            
            if (!creds.username || !creds.password) {
                console.log('No credentials - user needs to login to Master Dashboard first');
                return;
            }
            
            console.log('✅ Found credentials, filling login form...');
            
            // Find login form fields
            const usernameField = document.querySelector(
                'input[name="username"], input[name="user"], input[name="email"], input[type="text"]'
            );
            
            const passwordField = document.querySelector(
                'input[name="password"], input[type="password"]'
            );
            
            if (usernameField && passwordField) {
                // Fill the form
                usernameField.value = creds.username;
                passwordField.value = creds.password;
                
                // Trigger events so form validation works
                usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                usernameField.dispatchEvent(new Event('change', { bubbles: true }));
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.dispatchEvent(new Event('change', { bubbles: true }));
                
                console.log('✅ Form filled with credentials');
                
                // Find and click submit button
                const submitBtn = document.querySelector(
                    'button[type="submit"], input[type="submit"], .login-btn, .submit-btn'
                );
                
                if (submitBtn) {
                    setTimeout(() => {
                        submitBtn.click();
                        console.log('✅ Auto-login submitted!');
                    }, 500);
                } else {
                    // Try to submit form directly
                    const form = usernameField.closest('form');
                    if (form) {
                        setTimeout(() => form.submit(), 500);
                    }
                }
            } else {
                console.log('Login form not found - might already be logged in');
            }
        } catch (e) {
            console.error('Auto-login error:', e);
        }
    }
    
    // Run auto-login when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(autoLogin, 1000));
    } else {
        setTimeout(autoLogin, 1000);
    }
})();
</script>
```

#### Step 3: Paste It Into Your HTML

Open your app's HTML file and paste the script **just before the closing `</body>` tag**.

Example:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your App</title>
</head>
<body>
    <!-- Your existing login form -->
    <form>
        <input name="username" type="text" />
        <input name="password" type="password" />
        <button type="submit">Login</button>
    </form>
    
    <!-- ✅ PASTE THE AUTO-LOGIN SCRIPT HERE -->
    <script>
    (function() {
        // ... the script from Step 2 ...
    })();
    </script>
</body>
</html>
```

#### Step 4: Save and Test

1. Save the HTML file
2. Log in to Master Dashboard
3. Click on the system in navigation bar
4. **Watch it auto-login!** 🎉

---

## 🧪 Testing

### Test 1: Check Credentials Are Stored

After logging into Master Dashboard:

1. Press **F12** to open browser console
2. Type: `localStorage.getItem('app_credentials')`
3. You should see your username and password

### Test 2: Check Auto-Login Works

1. Click on any system in navigation bar
2. Open browser console (F12)
3. Look for these messages:
   - `🔐 Auto-Login Enabled`
   - `✅ Found credentials, filling login form...`
   - `✅ Form filled with credentials`
   - `✅ Auto-login submitted!`

---

## 🔧 Troubleshooting

### Problem: "No credentials" message

**Cause:** You haven't logged into Master Dashboard yet  
**Fix:** Log in to Master Dashboard first

### Problem: "Login form not found"

**Cause:** The script can't find your login form fields  
**Fix:** Update the selectors in the script to match your form

Example: If your username field is `<input name="user_id">`, change the script:
```javascript
const usernameField = document.querySelector(
    'input[name="user_id"], input[name="username"], input[type="text"]'
);
```

### Problem: Form fills but doesn't submit

**Cause:** Submit button selector doesn't match  
**Fix:** Add your button's class/id to the script

Example: If your button is `<button class="btn-primary">`, change:
```javascript
const submitBtn = document.querySelector(
    'button.btn-primary, button[type="submit"], input[type="submit"]'
);
```

---

## ✅ What's Already Done

The Master Dashboard is **already configured**:

✅ Stores username when you log in  
✅ Stores password (encoded) when you log in  
✅ Stores credentials in `app_credentials`  
✅ Clears credentials when you log out

**You only need to add the script to your external apps!**

---

## 📋 Checklist

For each system in your navigation bar:

- [ ] Store FMS - Add auto-login script
- [ ] Production FMS - Add auto-login script
- [ ] MIS System - Add auto-login script
- [ ] Checklist Combined - Add auto-login script
- [ ] Any other systems - Add auto-login script

---

## 🎯 Expected Result

**Before:**
```
Login to Master Dashboard
  ↓
Click Store FMS
  ↓
See login page
  ↓
Type username
  ↓
Type password
  ↓
Click login
  ↓
Access Store FMS
```

**After:**
```
Login to Master Dashboard
  ↓
Click Store FMS
  ↓
AUTOMATICALLY LOGGED IN! ✨
  ↓
Access Store FMS immediately
```

---

## 🔒 Security

- ✅ Password is base64 encoded (not plain text)
- ✅ Stored in localStorage (same as your current system)
- ✅ Only accessible from same domain
- ✅ Cleared when you log out
- ✅ Works only after Master Dashboard login

---

## 💡 Tips

1. **Test one app first** - Add script to one system, test it, then add to others
2. **Check console** - Always check browser console for helpful messages
3. **Same domain** - Works best when all apps are on same domain
4. **HTTPS recommended** - Use HTTPS in production for security

---

## 🎉 That's It!

Just add this one script to each external app and you're done. Users will only need to log in once to the Master Dashboard!

**Time to implement:** ~2 minutes per app  
**Difficulty:** Copy and paste  
**Result:** Automatic login everywhere! 🚀
