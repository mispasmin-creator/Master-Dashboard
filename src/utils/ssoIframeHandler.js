/**
 * SSO Iframe Handler - Manages iframe-based auto-login
 * This utility helps coordinate auto-login between Master Dashboard and embedded applications
 */

import { validateSSOToken, getCurrentSSOToken } from '../services/ssoService';

/**
 * Extract SSO parameters from current URL
 * @returns {Object|null} SSO parameters or null if not found
 */
export const extractSSOParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const ssoToken = urlParams.get('_sso');
    const username = urlParams.get('_user');
    const appId = urlParams.get('_app');
    const source = urlParams.get('_src');

    if (!ssoToken || !username) {
        return null;
    }

    return {
        token: ssoToken,
        username: username,
        appId: appId || 'unknown',
        source: source || 'unknown',
        role: urlParams.get('_role') || 'user',
        email: urlParams.get('_email') || '',
        timestamp: urlParams.get('_ts') || Date.now(),
        autoLogin: urlParams.get('auto_login') === 'true'
    };
};

/**
 * Validate SSO parameters from URL
 * @returns {Object} Validation result
 */
export const validateSSOParams = () => {
    const params = extractSSOParams();

    if (!params) {
        return { valid: false, error: 'No SSO parameters found' };
    }

    // Validate token
    const tokenValidation = validateSSOToken(params.token);

    if (!tokenValidation.valid) {
        return { valid: false, error: tokenValidation.error };
    }

    // Check if username matches token
    if (tokenValidation.userData.userId !== params.username) {
        return { valid: false, error: 'Username mismatch' };
    }

    return {
        valid: true,
        params: params,
        userData: tokenValidation.userData
    };
};

/**
 * Notify parent window of SSO login status
 * @param {boolean} success - Whether auto-login succeeded
 * @param {Object} data - Additional data to send
 */
export const notifyParentWindow = (success, data = {}) => {
    if (window.parent === window) {
        // Not in an iframe
        return;
    }

    const message = {
        type: 'SSO_LOGIN_STATUS',
        success: success,
        timestamp: Date.now(),
        ...data
    };

    try {
        window.parent.postMessage(message, '*'); // In production, specify exact origin
        console.log('✅ Notified parent window:', message);
    } catch (error) {
        console.error('❌ Error notifying parent window:', error);
    }
};

/**
 * Listen for SSO messages from iframe
 * @param {Function} callback - Callback function to handle messages
 * @returns {Function} Cleanup function to remove listener
 */
export const listenForSSOMessages = (callback) => {
    const messageHandler = (event) => {
        // In production, validate event.origin
        if (event.data && event.data.type === 'SSO_LOGIN_STATUS') {
            console.log('📨 Received SSO message from iframe:', event.data);
            callback(event.data);
        }
    };

    window.addEventListener('message', messageHandler);

    // Return cleanup function
    return () => {
        window.removeEventListener('message', messageHandler);
    };
};

/**
 * Perform auto-login in embedded application
 * This function should be called by the embedded application on load
 * @param {Function} loginFunction - Function to perform actual login
 * @returns {Promise<boolean>} Success status
 */
export const performAutoLogin = async (loginFunction) => {
    console.log('🔐 Attempting SSO auto-login...');

    const validation = validateSSOParams();

    if (!validation.valid) {
        console.warn('⚠️ SSO validation failed:', validation.error);
        notifyParentWindow(false, { error: validation.error });
        return false;
    }

    try {
        // Call the provided login function with user data
        const result = await loginFunction(validation.userData, validation.params);

        if (result && result.success !== false) {
            console.log('✅ SSO auto-login successful');
            notifyParentWindow(true, {
                username: validation.params.username,
                appId: validation.params.appId
            });
            return true;
        } else {
            console.error('❌ Login function returned failure');
            notifyParentWindow(false, { error: 'Login function failed' });
            return false;
        }
    } catch (error) {
        console.error('❌ Auto-login error:', error);
        notifyParentWindow(false, { error: error.message });
        return false;
    }
};

/**
 * Store SSO credentials in embedded app's storage
 * @param {Object} userData - User data from SSO token
 */
export const storeSSOCredentials = (userData) => {
    try {
        localStorage.setItem('sso_authenticated', 'true');
        localStorage.setItem('user-name', userData.userId);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('email_id', userData.email);
        localStorage.setItem('sso_timestamp', Date.now().toString());

        console.log('✅ SSO credentials stored in embedded app');
    } catch (error) {
        console.error('❌ Error storing SSO credentials:', error);
    }
};

/**
 * Check if current page was loaded via SSO
 * @returns {boolean} True if SSO parameters present
 */
export const isSSOLogin = () => {
    const params = extractSSOParams();
    return params !== null && params.autoLogin === true;
};

/**
 * Clean SSO parameters from URL (for cleaner browser history)
 */
export const cleanSSOParamsFromUrl = () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Remove SSO parameters
    const ssoParams = ['_sso', '_user', '_app', '_ts', '_src', '_v', '_role', '_email', 'auto_login', '_type', '_action', 'redirect', 'mode', 'auth_type', 'auto_redirect', '_redirect', 'auto_auth'];

    let hasChanges = false;
    ssoParams.forEach(param => {
        if (params.has(param)) {
            params.delete(param);
            hasChanges = true;
        }
    });

    if (hasChanges) {
        // Update URL without reloading
        const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
        window.history.replaceState({}, '', newUrl);
        console.log('✅ Cleaned SSO parameters from URL');
    }
};

export default {
    extractSSOParams,
    validateSSOParams,
    notifyParentWindow,
    listenForSSOMessages,
    performAutoLogin,
    storeSSOCredentials,
    isSSOLogin,
    cleanSSOParamsFromUrl
};
