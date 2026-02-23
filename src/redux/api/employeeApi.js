import axios from 'axios';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec';

/**
 * Fetch all employee data from the EMPLOYEE sheet
 * @returns {Promise} Response with employee data
 */
export const fetchEmployeeDataApi = async () => {
    try {
        const response = await axios.get(SCRIPT_URL, {
            params: {
                sheetName: 'EMPLOYEE',
                action: 'fetch'
            },
            timeout: 30000 // 30 second timeout
        });

        if (response.data.success && Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                error: null
            };
        } else {
            return {
                data: null,
                error: response.data.error || 'Failed to fetch employee data'
            };
        }
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.error || error.message || 'Network error'
        };
    }
};