/**
 * SSO Service - Centralized Single Sign-On Management
 * Handles token generation, validation, storage, and URL enhancement
 */

const SSO_CONFIG = {
    TOKEN_KEY: 'sso_token',
    CREDENTIALS_KEY: 'app_credentials',
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    COOKIE_NAME: 'passary_sso_token',
    COOKIE_MAX_AGE: 86400, // 24 hours in seconds
};

/**
 * Generate a secure SSO token with user data
 * @param {Object} userData - User information from login
 * @returns {string} Base64 encoded SSO token
 */
export const generateSSOToken = (userData) => {
    const tokenData = {
        userId: userData.username || userData.user_name,
        name: userData.name || userData.user_name,
        role: userData.role || 'user',
        email: userData.email_id || userData.email || '',
        timestamp: Date.now(),
        expiresAt: Date.now() + SSO_CONFIG.TOKEN_EXPIRY,
        signature: `sso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '1.0'
    };

    try {
        const token = btoa(JSON.stringify(tokenData));
        console.log('✅ SSO Token generated successfully');
        return token;
    } catch (error) {
        console.error('❌ Error generating SSO token:', error);
        return null;
    }
};

/**
 * Store SSO token in multiple locations for maximum compatibility
 * @param {string} token - The SSO token to store
 * @param {Object} userData - User data object
 */
export const storeSSOToken = (token, userData) => {
    try {
        // Store in localStorage
        localStorage.setItem(SSO_CONFIG.TOKEN_KEY, token);

        // Store in sessionStorage
        sessionStorage.setItem(SSO_CONFIG.TOKEN_KEY, token);

        // Try to set cookie (may fail in some browsers)
        try {
            document.cookie = `${SSO_CONFIG.COOKIE_NAME}=${token}; path=/; max-age=${SSO_CONFIG.COOKIE_MAX_AGE}; SameSite=Lax`;
        } catch (cookieError) {
            console.warn('⚠️ Could not set SSO cookie (HTTPS required for cross-domain):', cookieError);
        }

        // ========== ENHANCED: Store credentials for auto-fill ==========
        // Get the encoded password if available
        const encodedPassword = localStorage.getItem('user-password');
        const password = encodedPassword ? atob(encodedPassword) : '';

        // Store in app_credentials format for external apps
        const appCredentials = {
            username: userData.username || userData.user_name,
            password: password, // Include actual password for auto-fill
            name: userData.name || userData.user_name,
            role: userData.role,
            email: userData.email_id || userData.email,
            timestamp: Date.now(),
            token: token
        };

        localStorage.setItem(SSO_CONFIG.CREDENTIALS_KEY, JSON.stringify(appCredentials));
        // ========== END ENHANCED CREDENTIALS ==========

        console.log('✅ SSO token stored successfully in all locations');
    } catch (error) {
        console.error('❌ Error storing SSO token:', error);
    }
};

/**
 * Validate SSO token integrity and expiration
 * @param {string} token - Token to validate
 * @returns {Object} Validation result with userData if valid
 */
export const validateSSOToken = (token) => {
    if (!token) {
        return { valid: false, error: 'No token provided' };
    }

    try {
        const tokenData = JSON.parse(atob(token));

        // Check expiration
        if (Date.now() > tokenData.expiresAt) {
            return { valid: false, error: 'Token expired' };
        }

        // Check required fields
        if (!tokenData.userId || !tokenData.timestamp) {
            return { valid: false, error: 'Invalid token structure' };
        }

        return {
            valid: true,
            userData: tokenData,
            expiresIn: tokenData.expiresAt - Date.now()
        };
    } catch (error) {
        return { valid: false, error: 'Token parsing failed' };
    }
};

/**
 * Get current SSO token from storage
 * @returns {string|null} Current SSO token or null
 */
export const getCurrentSSOToken = () => {
    // Try localStorage first
    let token = localStorage.getItem(SSO_CONFIG.TOKEN_KEY);

    // Fallback to sessionStorage
    if (!token) {
        token = sessionStorage.getItem(SSO_CONFIG.TOKEN_KEY);
    }

    // Validate token before returning
    if (token) {
        const validation = validateSSOToken(token);
        if (validation.valid) {
            return token;
        } else {
            console.warn('⚠️ Stored token is invalid:', validation.error);
            clearSSOToken();
            return null;
        }
    }

    return null;
};

/**
 * Clear all SSO tokens and credentials
 */
export const clearSSOToken = () => {
    localStorage.removeItem(SSO_CONFIG.TOKEN_KEY);
    sessionStorage.removeItem(SSO_CONFIG.TOKEN_KEY);
    localStorage.removeItem(SSO_CONFIG.CREDENTIALS_KEY);

    // Clear cookie
    document.cookie = `${SSO_CONFIG.COOKIE_NAME}=; path=/; max-age=0`;

    console.log('✅ SSO tokens cleared');
};

/**
 * Enhance URL with SSO parameters for automatic login
 * @param {string} baseUrl - Original application URL
 * @param {string} appId - Application identifier
 * @returns {string} Enhanced URL with SSO parameters
 */
export const getSSOUrl = (baseUrl, appId) => {
    if (!baseUrl) return baseUrl;

    const token = getCurrentSSOToken();
    const username = localStorage.getItem('user-name');

    if (!token || !username) {
        console.warn('⚠️ No valid SSO token or username found');
        return baseUrl;
    }

    // Parse token to get user data
    const validation = validateSSOToken(token);
    if (!validation.valid) {
        return baseUrl;
    }

    const userData = validation.userData;

    // Create SSO parameters
    const params = new URLSearchParams({
        _sso: token,
        _user: username,
        _app: appId || 'unknown',
        _ts: Date.now(),
        _src: 'passary_master_portal',
        _v: '1.0',
        _role: userData.role || 'user',
        _email: userData.email || '',
        auto_login: 'true'
    });

    // Add app-specific parameters
    if (appId) {
        if (appId.includes('FMS')) {
            params.append('_type', 'fms_sso');
            params.append('_action', 'auto_login');
            params.append('redirect', 'dashboard');
            params.append('mode', 'sso');
        } else if (appId.includes('MIS')) {
            params.append('_type', 'mis_sso');
            params.append('_redirect', 'dashboard');
            params.append('auth_type', 'token');
            params.append('auto_redirect', 'true');
        } else if (appId.includes('CHECKLIST')) {
            params.append('_type', 'checklist_sso');
            params.append('auto_auth', 'true');
        }
    }

    // Determine separator
    const separator = baseUrl.includes('?') ? '&' : '?';

    const enhancedUrl = `${baseUrl}${separator}${params.toString()}`;
    console.log(`✅ Enhanced URL for ${appId}:`, enhancedUrl);

    return enhancedUrl;
};

/**
 * Refresh SSO token (extend expiration)
 * @returns {string|null} New token or null if refresh failed
 */
export const refreshSSOToken = () => {
    const currentToken = getCurrentSSOToken();
    if (!currentToken) {
        console.warn('⚠️ No token to refresh');
        return null;
    }

    const validation = validateSSOToken(currentToken);
    if (!validation.valid) {
        console.warn('⚠️ Cannot refresh invalid token');
        return null;
    }

    // Create new token with extended expiration
    const userData = validation.userData;
    const newToken = generateSSOToken(userData);

    if (newToken) {
        storeSSOToken(newToken, userData);
        console.log('✅ SSO token refreshed successfully');
    }

    return newToken;
};

/**
 * Check if token needs refresh (within 1 hour of expiration)
 * @returns {boolean} True if token should be refreshed
 */
export const shouldRefreshToken = () => {
    const token = getCurrentSSOToken();
    if (!token) return false;

    const validation = validateSSOToken(token);
    if (!validation.valid) return false;

    // Refresh if less than 1 hour remaining
    const oneHour = 60 * 60 * 1000;
    return validation.expiresIn < oneHour;
};

/**
 * Initialize SSO token refresh interval
 * @param {number} intervalMs - Check interval in milliseconds (default: 5 minutes)
 * @returns {number} Interval ID
 */
export const initTokenRefresh = (intervalMs = 5 * 60 * 1000) => {
    const intervalId = setInterval(() => {
        if (shouldRefreshToken()) {
            console.log('🔄 Auto-refreshing SSO token...');
            refreshSSOToken();
        }
    }, intervalMs);

    console.log('✅ SSO token auto-refresh initialized');
    return intervalId;
};

export default {
    generateSSOToken,
    storeSSOToken,
    validateSSOToken,
    getCurrentSSOToken,
    clearSSOToken,
    getSSOUrl,
    refreshSSOToken,
    shouldRefreshToken,
    initTokenRefresh,
    SSO_CONFIG
};
