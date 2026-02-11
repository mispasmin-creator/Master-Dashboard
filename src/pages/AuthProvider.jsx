// authService.js
export const generateSSOToken = (userData) => {
  const token = btoa(JSON.stringify({
    userId: userData.username,
    name: userData.name,
    role: userData.role,
    timestamp: Date.now(),
    expiresIn: 24 * 60 * 60 * 1000 // 24 hours
  }));
  return token;
};

export const storeSSOToken = (token) => {
  // Store in multiple places for cross-domain access
  localStorage.setItem('sso_token', token);
  sessionStorage.setItem('sso_token', token);
  
  // Set cookie for cross-domain access
  document.cookie = `sso_token=${token}; path=/; max-age=86400; SameSite=None; Secure`;
};

export const validateSSOToken = (token) => {
  try {
    const data = JSON.parse(atob(token));
    if (Date.now() - data.timestamp < data.expiresIn) {
      return { valid: true, userData: data };
    }
    return { valid: false };
  } catch (error) {
    return { valid: false };
  }
};