// ============================================
// GOOGLE SHEETS API FUNCTIONS
// ============================================

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec";

// Helper function to fetch data from Google Sheets
const fetchFromGoogleSheets = async (sheetName) => {
  try {
    console.log(`Fetching data from ${sheetName} sheet...`);
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${APPS_SCRIPT_URL}?sheetName=${sheetName}&t=${timestamp}`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`Failed to fetch ${sheetName}: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Response from ${sheetName}:`, data);
    
    if (data.success && Array.isArray(data.data)) {
      const rows = data.data;
      if (rows.length === 0) {
        console.log(`No data found in ${sheetName} sheet`);
        return [];
      }
      
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Convert rows to objects
      const formattedData = dataRows.map((row, rowIndex) => {
        const obj = { _rowIndex: rowIndex + 2 }; // +2 for header row + 1-based index
        headers.forEach((header, colIndex) => {
          if (header && header.trim() !== '') {
            const value = row[colIndex];
            obj[header.trim()] = value !== undefined && value !== null 
              ? value.toString().trim() 
              : '';
          }
        });
        return obj;
      });
      
      console.log(`Formatted ${sheetName} data:`, formattedData);
      return formattedData;
    } else {
      console.error(`Invalid data format for ${sheetName}:`, data);
      return [];
    }
    
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
};

// Function to write data to Google Sheets
const writeToGoogleSheets = async (sheetName, data, rowIndex = null) => {
  try {
    console.log(`Writing to ${sheetName} sheet:`, data);
    
    const payload = {
      action: rowIndex ? 'update' : 'append',
      sheetName: sheetName,
      data: data,
      rowIndex: rowIndex
    };
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Write operation result:', result);
    
    if (result.success) {
      return { success: true, data: result };
    } else {
      throw new Error(result.error || 'Failed to write to sheet');
    }
    
  } catch (error) {
    console.error('Error writing to sheet:', error);
    throw error;
  }
};

// Fetch all apps from APP sheet
export const fetchAllApps = async () => {
  try {
    const apps = await fetchFromGoogleSheets("APP");
    console.log("Total apps found:", apps.length);
    
    // Transform the data to ensure consistent structure
    const transformedApps = apps.map(app => {
      // Handle different possible column names
      const appId = app.app_id || app['App ID'] || app.id || '';
      const appName = app.app_name || app['App Name'] || app.name || '';
      const appUrl = app.app_url || app['App URL'] || app.url || '';
      
      return {
        id: appId,
        name: appName,
        url: appUrl,
        label: appName || appId
      };
    }).filter(app => app.id && app.name); // Filter out invalid entries
    
    console.log("Transformed apps:", transformedApps);
    return transformedApps;
    
  } catch (error) {
    console.error("Error fetching apps:", error);
    return [];
  }
};

// Fetch all users from USER sheet
export const fetchAllUsers = async () => {
  try {
    const users = await fetchFromGoogleSheets("USER");
    console.log("Total users found:", users.length);
    
    const transformedUsers = users.map(user => {
      // Calculate accessible apps count
      let accessibleApps = 0;
      const accessibleSystems = [];
      
      for (let i = 1; i <= 16; i++) {
        const appKey = `APP${i.toString().padStart(2, '0')}`;
        if (user[appKey] && user[appKey].toString().toLowerCase() === 'yes') {
          accessibleApps++;
          accessibleSystems.push(appKey);
        }
      }
      
      // Handle different possible column names
      const userData = {
        _rowIndex: user._rowIndex,
        id: user.id || user.username || user['Username'] || '',
        employee_code: user['Employee Code'] || user.employee_code || user['EmployeeCode'] || '',
        name: user['Name'] || user.name || user['Full Name'] || '',
        username: user['Username'] || user.username || user['UserName'] || '',
        password: user['Password'] || user.password || '',
        role: user['Role'] || user.role || user['User Role'] || 'user',
        department: user['Department'] || user.department || '',
        status: user['Status'] || user.status || user['Account Status'] || 'active',
        accessibleApps: accessibleApps,
        accessibleSystems: accessibleSystems,
        
        // Include all APP columns
        APP01: user.APP01 || '',
        APP02: user.APP02 || '',
        APP03: user.APP03 || '',
        APP04: user.APP04 || '',
        APP05: user.APP05 || '',
        APP06: user.APP06 || '',
        APP07: user.APP07 || '',
        APP08: user.APP08 || '',
        APP09: user.APP09 || '',
        APP10: user.APP10 || '',
        APP11: user.APP11 || '',
        APP12: user.APP12 || '',
        APP13: user.APP13 || '',
        APP14: user.APP14 || '',
        APP15: user.APP15 || '',
        APP16: user.APP16 || ''
      };
      
      return userData;
    });
    
    console.log("Transformed users:", transformedUsers);
    return transformedUsers;
    
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Create new user
// Create new user - FIXED VERSION
// FIXED createUser function for USER sheet
export const createUser = async (userData) => {
  try {
    // Use the correct Google Apps Script URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec";
    
    console.log("Creating user in USER sheet:", userData);
    
    // Prepare row data for USER sheet (matching your headers exactly)
    const rowData = [
      userData.employee_code || '',     // Column A: Employee Code
      userData.name || '',              // Column B: name
      userData.username || '',          // Column C: username
      userData.password || '',          // Column D: password
      userData.role || '',              // Column E: role
      userData.department || '',        // Column F: department
      // APP01 to APP17 - all default to 'no' (Columns G-W)
      'no', 'no', 'no', 'no', 'no',    // APP01-APP05
      'no', 'no', 'no', 'no', 'no',    // APP06-APP10
      'no', 'no', 'no', 'no', 'no',    // APP11-APP15
      'no', 'no'                       // APP16-APP17
    ];
    
    console.log("Row data for USER sheet:", rowData);
    
    // Create FormData
    const formData = new FormData();
    formData.append('sheetName', 'USER');        // FIXED: Use USER sheet
    formData.append('action', 'insert');
    formData.append('rowData', JSON.stringify(rowData));
    
    // Send request
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    console.log("Response status:", response.status);
    
    // Try to get response text
    const responseText = await response.text();
    console.log("Raw response:", responseText);
    
    // Google Apps Script sometimes wraps JSON in callback
    let cleanResponse = responseText;
    if (responseText.includes('(') && responseText.includes(')')) {
      cleanResponse = responseText.replace(/^.*?\(|\).*$/g, '');
    }
    
    console.log("Cleaned response:", cleanResponse);
    
    try {
      const result = JSON.parse(cleanResponse);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (parseError) {
      console.log("Could not parse JSON, checking status");
      if (response.ok) {
        return { success: true, message: "User created successfully" };
      }
      throw new Error(`HTTP ${response.status}: User creation failed`);
    }
    
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Create user failed: ${error.message}`);
  }
};

// Update user
// Also update the updateUser function
// Update user - FIXED VERSION
// FIXED updateUser function for USER sheet
export const updateUser = async (username, userData) => {
  try {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec";
    
    console.log("Updating user in USER sheet:", username, userData);
    
    // First, we need to find the row number for this user
    const fetchUrl = `${SCRIPT_URL}?sheetName=USER&action=fetch&t=${Date.now()}`;
    const fetchResponse = await fetch(fetchUrl);
    const fetchText = await fetchResponse.text();
    
    let usersData;
    try {
      // Clean the response
      let cleanText = fetchText;
      if (fetchText.includes('(') && fetchText.includes(')')) {
        cleanText = fetchText.replace(/^.*?\(|\).*$/g, '');
      }
      usersData = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse users data:", e);
      throw new Error("Cannot fetch users list");
    }
    
    if (!usersData.success || !usersData.data) {
      throw new Error("Failed to fetch users data");
    }
    
    // Find the user row (username is in column C, index 2)
    const users = usersData.data;
    let rowIndex = -1;
    
    for (let i = 0; i < users.length; i++) {
      if (users[i][2] && users[i][2].toString().trim() === username.trim()) {
        rowIndex = i + 1; // +1 because Google Sheets rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`User ${username} not found in USER sheet`);
    }
    
    console.log(`Found user at row ${rowIndex}`);
    
    // Prepare updates
    const updates = {};
    
    // Map data to column indices (0-based for JSON, but we'll use 1-based for Google Sheets)
    // A=1: Employee Code, B=2: name, C=3: username, D=4: password, E=5: role, F=6: department
    if (userData.name !== undefined) updates[2] = userData.name;
    if (userData.password !== undefined) updates[4] = userData.password;
    if (userData.role !== undefined) updates[5] = userData.role;
    if (userData.department !== undefined) updates[6] = userData.department;
    
    // Handle APP access updates (columns 7-23 for APP01-APP17)
    if (userData.system_access) {
      try {
        const apps = typeof userData.system_access === 'string' 
          ? JSON.parse(userData.system_access) 
          : userData.system_access;
        
        apps.forEach((appId, index) => {
          const colIndex = 7 + index; // Column G=7 is APP01
          if (colIndex <= 23) { // Up to column W=23 for APP17
            updates[colIndex] = appId ? 'yes' : 'no';
          }
        });
      } catch (e) {
        console.error("Error parsing system_access:", e);
      }
    }
    
    // If no updates, return
    if (Object.keys(updates).length === 0) {
      return { success: true, message: "No updates needed" };
    }
    
    console.log("Updates to apply:", updates);
    
    // Send update request
    const formData = new FormData();
    formData.append('sheetName', 'USER');
    formData.append('action', 'updateCells');
    formData.append('rowIndex', rowIndex.toString());
    formData.append('cellUpdates', JSON.stringify(updates));
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const responseText = await response.text();
    console.log("Update response:", responseText);
    
    // Clean response
    let cleanResponse = responseText;
    if (responseText.includes('(') && responseText.includes(')')) {
      cleanResponse = responseText.replace(/^.*?\(|\).*$/g, '');
    }
    
    try {
      const result = JSON.parse(cleanResponse);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (parseError) {
      if (response.ok) {
        return { success: true, message: "User updated successfully" };
      }
      throw new Error(`HTTP ${response.status}: Update failed`);
    }
    
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(`Update user failed: ${error.message}`);
  }
};
// Delete user
export const deleteUser = async (userId) => {
  try {
    console.log("Deleting user:", userId);
    
    // First, get all users to find the row index
    const users = await fetchAllUsers();
    const user = users.find(u => u.username === userId || u.id === userId);
    
    if (!user || !user._rowIndex) {
      throw new Error("User not found or row index missing");
    }
    
    // For deletion, we'll clear the row data
    const deleteData = {
      "Employee Code": "",
      "Name": "",
      "Username": "",
      "Password": "",
      "Role": "",
      "Department": "",
      "Status": "inactive"
    };
    
    // Clear all APP columns
    for (let i = 1; i <= 16; i++) {
      const appKey = `APP${i.toString().padStart(2, '0')}`;
      deleteData[appKey] = "";
    }
    
    const result = await writeToGoogleSheets("USER", deleteData, user._rowIndex);
    
    if (result.success) {
      return { success: true };
    } else {
      throw new Error("Failed to delete user from Google Sheets");
    }
    
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};
// Add to loginApi.js after your existing functions

// Function to create auto-login URLs
export const createAutoLoginUrl = (baseUrl, username, password, appId) => {
  if (!baseUrl || !username) return baseUrl;
  
  // Different apps may have different login parameter names
  // We'll create URLs for common patterns
  
  const urlObj = new URL(baseUrl);
  const params = new URLSearchParams(urlObj.search);
  
  // Add auto-login parameters
  params.set('auto_login', 'true');
  params.set('master_user', encodeURIComponent(username));
  params.set('master_pass', encodeURIComponent(password));
  params.set('app_id', appId);
  params.set('timestamp', Date.now());
  params.set('source', 'passary_master_portal');
  
  // Update URL with new parameters
  urlObj.search = params.toString();
  
  return urlObj.toString();
};

// Function to get system-specific login credentials
export const getSystemCredentials = (systemId) => {
  const username = localStorage.getItem("login_username");
  const password = localStorage.getItem("login_password");
  
  if (!username || !password) return null;
  
  // Map system IDs to their login field names
  const systemConfigs = {
    // Checklist & Delegation
    'CHECKLIST': {
      loginField: 'username',
      passwordField: 'password',
      submitAction: 'login'
    },
    // FMS Systems
    'FMS': {
      loginField: 'email',
      passwordField: 'password',
      submitAction: 'submit'
    },
    // MIS Systems
    'MIS': {
      loginField: 'userid',
      passwordField: 'pass',
      submitAction: 'auth'
    },
    // HR Systems
    'HR': {
      loginField: 'emp_id',
      passwordField: 'password',
      submitAction: 'login'
    },
    // Default for other systems
    'DEFAULT': {
      loginField: 'username',
      passwordField: 'password',
      submitAction: 'login'
    }
  };
  
  // Find the right config for this system
  let config = systemConfigs.DEFAULT;
  Object.keys(systemConfigs).forEach(key => {
    if (systemId.includes(key) && key !== 'DEFAULT') {
      config = systemConfigs[key];
    }
  });
  
  return {
    username,
    password,
    loginField: config.loginField,
    passwordField: config.passwordField,
    submitAction: config.submitAction
  };
};
// Login function
export const LoginCredentialsApi = async (formData) => {
  try {
    const { username, password } = formData;
    console.log("Attempting login for:", username);
    
    // Fetch users from USER sheet
    const users = await fetchFromGoogleSheets("USER");
    console.log("Total users in database:", users.length);
    
    // Find matching user
    const matchedUser = users.find(user => {
      const userUsername = (user.Username || user.username || '').toString().toLowerCase().trim();
      const inputUsername = (username || '').toLowerCase().trim();
      const userPassword = (user.Password || user.password || '').toString().trim();
      const inputPassword = (password || '').toString().trim();
      
      console.log(`Comparing login: ${userUsername} === ${inputUsername} && ${userPassword} === ${inputPassword}`);
      
      return userUsername === inputUsername && userPassword === inputPassword;
    });

    if (matchedUser) {
      console.log("Login successful for user:", matchedUser.Username || matchedUser.username);
      
      // Fetch apps to get names and URLs
      const allApps = await fetchAllApps();
      
      // Determine which apps user has access to
      const accessibleApps = [];
      const accessibleAppIds = [];
      
      // Check APP01 to APP16 columns
      for (let i = 1; i <= 16; i++) {
        const appKey = `APP${i.toString().padStart(2, '0')}`;
        const appAccess = (matchedUser[appKey] || '').toString().toLowerCase().trim();
        
        if (appAccess === 'yes') {
          const appInfo = allApps.find(app => app.id === appKey);
          if (appInfo && appInfo.url) {
            accessibleApps.push(appInfo.url);
            accessibleAppIds.push(appKey);
          } else {
            // If app not found in APP sheet, still add the ID
            accessibleApps.push(`https://${appKey.toLowerCase()}.example.com`);
            accessibleAppIds.push(appKey);
          }
        }
      }
      
      console.log("User accessible apps:", accessibleAppIds);
      
      // Store accessible app IDs in localStorage
      localStorage.setItem("accessibleAppIds", JSON.stringify(accessibleAppIds));
      
      // Return user data
      return { 
        data: {
          username: matchedUser.Username || matchedUser.username,
          name: matchedUser.Name || matchedUser.name,
          employee_code: matchedUser['Employee Code'] || matchedUser.employee_code,
          role: matchedUser.Role || matchedUser.role,
          department: matchedUser.Department || matchedUser.department,
          system_access: JSON.stringify(accessibleApps),
          accessibleAppsCount: accessibleApps.length,
          isAdmin: (matchedUser.Role || matchedUser.role || '').toString().toLowerCase() === 'admin',
          accessibleAppIds: accessibleAppIds,
          status: matchedUser.Status || matchedUser.status || 'active'
        }
      };
    } else {
      console.log("Login failed: Invalid username or password");
      return { error: "Invalid username or password" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed. Please try again later." };
  }
};

// Fetch user's accessible apps
export const fetchUserApps = async (username) => {
  try {
    const users = await fetchFromGoogleSheets("USER");
    const allApps = await fetchAllApps();
    
    const user = users.find(u => {
      const userUsername = (u.Username || u.username || '').toString().toLowerCase().trim();
      return userUsername === username.toLowerCase().trim();
    });
    
    if (!user) {
      console.log("User not found:", username);
      return [];
    }
    
    const userApps = [];
    
    // Check which apps this user has access to
    for (let i = 1; i <= 16; i++) {
      const appKey = `APP${i.toString().padStart(2, '0')}`;
      if (user[appKey] && user[appKey].toString().toLowerCase().trim() === 'yes') {
        const appInfo = allApps.find(app => app.id === appKey);
        if (appInfo) {
          userApps.push({
            id: appKey,
            name: appInfo.name,
            url: appInfo.url,
            label: appInfo.name || appKey
          });
        } else {
          // If app not found in APP sheet, create a default entry
          userApps.push({
            id: appKey,
            name: appKey.replace('APP', 'App '),
            url: `https://${appKey.toLowerCase()}.example.com`,
            label: appKey.replace('APP', 'App ')
          });
        }
      }
    }
    
    console.log("User apps for", username, ":", userApps.length);
    return userApps;
  } catch (error) {
    console.error("Error fetching user apps:", error);
    return [];
  }
};

// Fetch all systems for admin view
export const fetchAllSystems = async () => {
  try {
    const allApps = await fetchAllApps();
    
    // Ensure we have a consistent structure
    return allApps.map(app => ({
      id: app.id,
      name: app.name,
      url: app.url,
      label: app.label || app.name || app.id
    }));
  } catch (error) {
    console.error("Error fetching all systems:", error);
    return [];
  }
};

// Function to check if user exists
export const checkUserExists = async (username) => {
  try {
    const users = await fetchAllUsers();
    return users.some(user => 
      (user.Username || user.username || '').toString().toLowerCase() === username.toLowerCase()
    );
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};

// Function to get user by username
export const getUserByUsername = async (username) => {
  try {
    const users = await fetchAllUsers();
    return users.find(user => 
      (user.Username || user.username || '').toString().toLowerCase() === username.toLowerCase()
    );
  } catch (error) {
    console.error("Error getting user by username:", error);
    return null;
  }
};