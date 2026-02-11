/**
 * Iframe Auto-Login Utility
 * Automatically fills and submits login forms in iframes
 */

/**
 * Attempt to auto-fill and submit login form in iframe
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {Object} credentials - User credentials
 */
export const attemptAutoLogin = (iframe, credentials) => {
    if (!iframe || !credentials) {
        console.warn('⚠️ Missing iframe or credentials for auto-login');
        return;
    }

    const { username, password } = credentials;

    if (!username || !password) {
        console.warn('⚠️ Missing username or password');
        return;
    }

    // Wait for iframe to load
    iframe.addEventListener('load', function autoLoginHandler() {
        try {
            console.log('🔐 Attempting auto-login in iframe...');

            // Try to access iframe content
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            if (!iframeDoc) {
                console.warn('⚠️ Cannot access iframe document (CORS restriction)');
                return;
            }

            // Wait a bit for the page to fully render
            setTimeout(() => {
                try {
                    // Common login form selectors
                    const usernameSelectors = [
                        'input[name="username"]',
                        'input[name="user"]',
                        'input[name="email"]',
                        'input[name="login"]',
                        'input[type="text"]',
                        'input[id*="user" i]',
                        'input[id*="login" i]',
                        'input[placeholder*="user" i]',
                        'input[placeholder*="email" i]'
                    ];

                    const passwordSelectors = [
                        'input[name="password"]',
                        'input[name="pass"]',
                        'input[type="password"]',
                        'input[id*="pass" i]',
                        'input[placeholder*="pass" i]'
                    ];

                    const submitSelectors = [
                        'button[type="submit"]',
                        'input[type="submit"]',
                        'button:contains("Login")',
                        'button:contains("Sign In")',
                        'button:contains("Submit")',
                        '.login-btn',
                        '.submit-btn',
                        '#login-button',
                        '#submit-button'
                    ];

                    // Find username field
                    let usernameField = null;
                    for (const selector of usernameSelectors) {
                        usernameField = iframeDoc.querySelector(selector);
                        if (usernameField) break;
                    }

                    // Find password field
                    let passwordField = null;
                    for (const selector of passwordSelectors) {
                        passwordField = iframeDoc.querySelector(selector);
                        if (passwordField) break;
                    }

                    // Find submit button
                    let submitButton = null;
                    for (const selector of submitSelectors) {
                        submitButton = iframeDoc.querySelector(selector);
                        if (submitButton) break;
                    }

                    // If we found the fields, fill them
                    if (usernameField && passwordField) {
                        console.log('✅ Found login form fields');

                        // Fill username
                        usernameField.value = username;
                        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                        usernameField.dispatchEvent(new Event('change', { bubbles: true }));

                        // Fill password
                        passwordField.value = password;
                        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                        passwordField.dispatchEvent(new Event('change', { bubbles: true }));

                        console.log('✅ Credentials filled');

                        // Submit the form
                        if (submitButton) {
                            setTimeout(() => {
                                submitButton.click();
                                console.log('✅ Login form submitted');
                            }, 500);
                        } else {
                            // Try to find and submit the form directly
                            const form = usernameField.closest('form') || passwordField.closest('form');
                            if (form) {
                                setTimeout(() => {
                                    form.submit();
                                    console.log('✅ Login form submitted');
                                }, 500);
                            } else {
                                console.warn('⚠️ Could not find submit button or form');
                            }
                        }
                    } else {
                        console.log('ℹ️ No login form detected (might already be logged in)');
                    }
                } catch (innerError) {
                    console.warn('⚠️ Error during auto-fill:', innerError.message);
                }
            }, 1000); // Wait 1 second for page to render

        } catch (error) {
            console.warn('⚠️ Cannot auto-login in iframe:', error.message);
        }
    }, { once: true }); // Only run once
};

/**
 * Get stored credentials for auto-login
 * @returns {Object|null} Credentials object or null
 */
export const getStoredCredentials = () => {
    const username = localStorage.getItem('user-name');
    const password = localStorage.getItem('user-password'); // We'll need to store this

    if (!username) {
        console.warn('⚠️ No username found in storage');
        return null;
    }

    // If password not stored, try to get from SSO token
    if (!password) {
        const appCredentials = localStorage.getItem('app_credentials');
        if (appCredentials) {
            try {
                const creds = JSON.parse(appCredentials);
                return {
                    username: creds.username || username,
                    password: creds.password || ''
                };
            } catch (e) {
                console.warn('⚠️ Could not parse app credentials');
            }
        }

        // Return username only if no password available
        return { username, password: '' };
    }

    return { username, password };
};

/**
 * Setup auto-login for an iframe
 * @param {HTMLIFrameElement} iframe - The iframe element
 */
export const setupIframeAutoLogin = (iframe) => {
    const credentials = getStoredCredentials();

    if (!credentials || !credentials.username) {
        console.warn('⚠️ No credentials available for auto-login');
        return;
    }

    attemptAutoLogin(iframe, credentials);
};

/**
 * Monitor iframe and attempt auto-login when login page is detected
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {Object} credentials - User credentials
 */
export const monitorIframeForLogin = (iframe, credentials) => {
    if (!iframe) return;

    // Initial attempt
    attemptAutoLogin(iframe, credentials);

    // Monitor for navigation within iframe
    try {
        iframe.contentWindow.addEventListener('load', () => {
            attemptAutoLogin(iframe, credentials);
        });
    } catch (error) {
        console.warn('⚠️ Cannot monitor iframe navigation (CORS)');
    }
};

export default {
    attemptAutoLogin,
    getStoredCredentials,
    setupIframeAutoLogin,
    monitorIframeForLogin
};
