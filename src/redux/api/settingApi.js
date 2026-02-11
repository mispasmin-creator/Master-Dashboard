// settingApi.js - COMPLETE WORKING VERSION
import axios from 'axios';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec';

/**
 * Fetch all user details from the USER sheet
 * @returns {Promise} Response with user data
 */
export const fetchUserDetailsApi = async () => {
    try {
        console.log("📞 Calling Google Apps Script for USER sheet...");
        
        const response = await axios.get(SCRIPT_URL, {
            params: {
                sheetName: 'USER',
                action: 'fetch'
            },
            timeout: 30000
        });

        console.log("✅ User API response received");
        
        if (response.data.success && Array.isArray(response.data.data)) {
            const data = response.data.data;
            
            console.log("📊 USER sheet data structure:");
            console.log("Headers:", data[0]);
            console.log("Total rows:", data.length);
            
            // Log first 5 rows for debugging
            console.log("First 5 rows of USER sheet:");
            data.slice(0, 5).forEach((row, idx) => {
                console.log(`Row ${idx}:`, row);
            });
            
            if (data.length === 0) {
                console.log("⚠️ No user data found");
                return [];
            }

            // Find column indices
            const headers = data[0];
            
            // Find all possible username/employee code columns
            const usernameIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes('username') || 
                     h.toString().toLowerCase().includes('user_name') ||
                     h.toString().toLowerCase().includes('user'))
            );
            
            const employeeCodeIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes('employee code') || 
                     h.toString().toLowerCase().includes('employee_code') ||
                     h.toString().toLowerCase().includes('empcode') ||
                     h.toString().toLowerCase().includes('employee'))
            );
            
            const nameIndex = headers.findIndex(h => 
                h && h.toString().toLowerCase().includes('name')
            );
            
            console.log("📊 Column indices found:");
            console.log("- Username:", usernameIndex, headers[usernameIndex]);
            console.log("- Employee Code:", employeeCodeIndex, headers[employeeCodeIndex]);
            console.log("- Name:", nameIndex, headers[nameIndex]);

            // Convert rows to user objects
            const users = data.slice(1).map(row => {
                const user = {};
                headers.forEach((header, index) => {
                    if (header && header.trim() !== '') {
                        user[header] = row[index] !== undefined && row[index] !== null 
                            ? row[index].toString() 
                            : '';
                    }
                });
                
                // Ensure consistent field names
                if (employeeCodeIndex !== -1 && row[employeeCodeIndex]) {
                    user.employee_id = row[employeeCodeIndex].toString().trim();
                    user.employeeCode = user.employee_id; // Add alias
                }
                
                if (usernameIndex !== -1 && row[usernameIndex]) {
                    user.user_name = row[usernameIndex].toString().trim();
                    user.username = user.user_name; // Add alias
                }
                
                if (nameIndex !== -1 && row[nameIndex]) {
                    user.name = row[nameIndex].toString().trim();
                }
                
                return user;
            });

            console.log(`✅ Successfully loaded ${users.length} users`);
            console.log("📋 First user sample:", users[0]);
            
            return users;
        } else {
            console.error("❌ User API response not successful:", response.data);
            return [];
        }
    } catch (error) {
        console.error("❌ User API error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        return [];
    }
};

/**
 * Fetch all employee details from the EMPLOYEE sheet
 * @returns {Promise} Response with employee data
 */
export const fetchAllEmployeesApi = async () => {
    try {
        console.log("📞 Calling Google Apps Script for EMPLOYEE sheet...");
        
        const response = await axios.get(SCRIPT_URL, {
            params: {
                sheetName: 'EMPLOYEE',
                action: 'fetch'
            },
            timeout: 30000
        });

        console.log("✅ Employee API response received");
        
        if (response.data.success && Array.isArray(response.data.data)) {
            const data = response.data.data;
            
            console.log("📊 EMPLOYEE sheet data structure:");
            console.log("Headers:", data[0]);
            console.log("Total employees:", data.length - 1);
            
            if (data.length === 0) {
                console.log("⚠️ No employee data found");
                return [];
            }

            // Find column indices
            const headers = data[0];
            
            const employeeCodeIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes('employee code') || 
                     h.toString().toLowerCase().includes('employee_code'))
            );
            
            const nameIndex = headers.findIndex(h => 
                h && h.toString().toLowerCase().includes('name')
            );
            
            const designationIndex = headers.findIndex(h => 
                h && h.toString().toLowerCase().includes('designation')
            );
            
            const dateOfJoiningIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes('date of joining') || 
                     h.toString().toLowerCase().includes('doj'))
            );
            
            const photoIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes("candidate's photo") || 
                     h.toString().toLowerCase().includes('photo'))
            );
            
            const mobileIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes('mobile no') || 
                     h.toString().toLowerCase().includes('mobile'))
            );
            
            const emailIndex = headers.findIndex(h => 
                h && (h.toString().toLowerCase().includes('personal email') || 
                     h.toString().toLowerCase().includes('email'))
            );

            console.log("📊 EMPLOYEE column indices:");
            console.log("- Employee Code:", employeeCodeIndex);
            console.log("- Name:", nameIndex);
            console.log("- Designation:", designationIndex);
            console.log("- Date of Joining:", dateOfJoiningIndex);
            console.log("- Photo:", photoIndex);
            console.log("- Mobile:", mobileIndex);
            console.log("- Email:", emailIndex);

            // Convert rows to employee objects
            const employees = data.slice(1).map(row => {
                const employee = {};
                headers.forEach((header, index) => {
                    if (header && header.trim() !== '') {
                        employee[header] = row[index] !== undefined && row[index] !== null 
                            ? row[index].toString() 
                            : '';
                    }
                });
                
                // Add aliases for consistent field names
                if (employeeCodeIndex !== -1) {
                    employee['Employee Code'] = row[employeeCodeIndex] || '';
                    employee.employeeCode = employee['Employee Code'];
                }
                
                if (nameIndex !== -1) {
                    employee['Name'] = row[nameIndex] || '';
                    employee.name = employee['Name'];
                }
                
                if (designationIndex !== -1) {
                    employee['Designation'] = row[designationIndex] || '';
                    employee.designation = employee['Designation'];
                }
                
                if (dateOfJoiningIndex !== -1) {
                    employee['Date Of Joining'] = row[dateOfJoiningIndex] || '';
                }
                
                if (photoIndex !== -1) {
                    employee["Candidate's Photo"] = row[photoIndex] || '';
                    employee.photo = employee["Candidate's Photo"];
                }
                
                if (mobileIndex !== -1) {
                    employee["Mobile No."] = row[mobileIndex] || '';
                    employee.mobile = employee["Mobile No."];
                }
                
                if (emailIndex !== -1) {
                    employee["Personal Email-Id"] = row[emailIndex] || '';
                    employee.email = employee["Personal Email-Id"];
                }
                
                return employee;
            });

            console.log(`✅ Successfully loaded ${employees.length} employees`);
            console.log("📋 First employee sample:", employees[0]);
            
            return employees;
        } else {
            console.error("❌ Employee API response not successful:", response.data);
            return [];
        }
    } catch (error) {
        console.error("❌ Employee API error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        return [];
    }
};

/**
 * Update system access settings
 * @param {Object} settings - System access settings to update
 * @returns {Promise} Response from API
 */
export const patchSystemAccessApi = async (settings) => {
    try {
        console.log("📝 Updating system access settings...", settings);
        
        const response = await axios.post(SCRIPT_URL, {
            sheetName: 'SYSTEM_ACCESS',
            action: 'update',
            data: settings
        }, {
            timeout: 30000
        });

        console.log("✅ System access updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ System access update error:", error);
        throw error;
    }
};

/**
 * Add a new user to USER sheet
 * @param {Object} userData - User data to add
 * @returns {Promise} Response from API
 */
export const addUserApi = async (userData) => {
    try {
        console.log("📝 Adding new user...", userData);
        
        const response = await axios.post(SCRIPT_URL, {
            sheetName: 'USER',
            action: 'insert',
            rowData: Object.values(userData)
        }, {
            timeout: 30000
        });

        console.log("✅ User added:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Add user error:", error);
        throw error;
    }
};

/**
 * Update user in USER sheet
 * @param {number} rowIndex - Row index to update (1-based)
 * @param {Object} userData - Updated user data
 * @returns {Promise} Response from API
 */
export const updateUserApi = async (rowIndex, userData) => {
    try {
        console.log("📝 Updating user at row", rowIndex, "...", userData);
        
        const response = await axios.post(SCRIPT_URL, {
            sheetName: 'USER',
            action: 'update',
            rowIndex: rowIndex,
            rowData: Object.values(userData)
        }, {
            timeout: 30000
        });

        console.log("✅ User updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Update user error:", error);
        throw error;
    }
};

/**
 * Update employee in EMPLOYEE sheet
 * @param {string} employeeCode - Employee code to update
 * @param {Object} updates - Fields to update
 * @returns {Promise} Response from API
 */
export const updateEmployeeApi = async (employeeCode, updates) => {
    try {
        console.log("📝 Updating employee", employeeCode, "...", updates);
        
        const response = await axios.post(SCRIPT_URL, {
            sheetName: 'EMPLOYEE',
            action: 'updateByJobCard',
            jobCardNo: employeeCode,
            columnUpdates: updates
        }, {
            timeout: 30000
        });

        console.log("✅ Employee updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Update employee error:", error);
        throw error;
    }
};

/**
 * Test API connection
 * @returns {Promise} Test response
 */
export const testApiConnection = async () => {
    try {
        console.log("🔧 Testing API connection...");
        
        const response = await axios.get(SCRIPT_URL, {
            timeout: 10000
        });

        console.log("✅ API connection test successful:", response.data);
        return {
            success: true,
            message: "API connection successful",
            data: response.data
        };
    } catch (error) {
        console.error("❌ API connection test failed:", error);
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
};

/**
 * Get sheet data for debugging
 * @param {string} sheetName - Name of sheet to debug
 * @returns {Promise} Sheet data
 */
export const debugSheetData = async (sheetName) => {
    try {
        console.log(`🔍 Debugging sheet: ${sheetName}`);
        
        const response = await axios.get(SCRIPT_URL, {
            params: {
                sheetName: sheetName,
                action: 'fetch'
            },
            timeout: 30000
        });

        console.log(`✅ ${sheetName} sheet debug data:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Debug ${sheetName} sheet error:`, error);
        throw error;
    }
};

// Export all functions
export default {
    fetchUserDetailsApi,
    fetchAllEmployeesApi,
    patchSystemAccessApi,
    addUserApi,
    updateUserApi,
    updateEmployeeApi,
    testApiConnection,
    debugSheetData
};