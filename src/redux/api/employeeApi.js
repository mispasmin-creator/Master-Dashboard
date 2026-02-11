import axios from 'axios';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec';

/**
 * Fetch all employee data from the EMPLOYEE sheet
 * @returns {Promise} Response with employee data
 */
export const fetchEmployeeDataApi = async () => {
    try {
        console.log("📞 Calling Google Apps Script for EMPLOYEE sheet...");
        
        const response = await axios.get(SCRIPT_URL, {
            params: {
                sheetName: 'EMPLOYEE',
                action: 'fetch'
            },
            timeout: 30000 // 30 second timeout
        });

        console.log("✅ Employee API response received:", {
            success: response.data?.success,
            dataLength: response.data?.data?.length
        });

        if (response.data.success && Array.isArray(response.data.data)) {
            const data = response.data.data;
            
            // Log first few rows for debugging
            if (data.length > 0) {
                console.log("📋 Headers:", data[0]);
                console.log("📋 First employee row:", data[1]);
            }
            
            return {
                data: response.data.data,
                error: null
            };
        } else {
            console.error("❌ API response not successful:", response.data);
            return {
                data: null,
                error: response.data.error || 'Failed to fetch employee data'
            };
        }
    } catch (error) {
        console.error("❌ Employee API error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        return {
            data: null,
            error: error.response?.data?.error || error.message || 'Network error'
        };
    }
};