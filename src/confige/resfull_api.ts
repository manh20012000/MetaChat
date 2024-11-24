const API_URL = 'http://192.168.51.101';
import axios from 'axios';
// Hàm POST
const postData = async (route: string, data: any, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/${route}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token} `,
            },

        });
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error('POST Error:', error);
        throw error; // Ném lỗi ra để xử lý bên ngoài
    }
};
const postFormData = async (route: string, data: any, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/${route}`, data, {
            headers: {
                'Content-Type': "multipart/form-data",
                Authorization: `Bearer ${token}`,

            },
            data: JSON.stringify(data), // Chuyển dữ liệu thành JSON
        });
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error('POST Error:', error);
        throw error; // Ném lỗi ra để xử lý bên ngoài
    }
}
// Hàm GET
const getData = async (route: string, params: any, token: string,) => {
    try {
        const response = await axios.get(`${API_URL}/${route}`, {
            params: params ?? {},
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },

            // Tham số truyền qua query
        });
        return response.data;
    } catch (error) {
        console.error('GET Error:', error);
        throw error;
    }
};

// Hàm PUT
const putData = async (route: string, data: any, token: string) => {
    try {
        const response = await axios.put(`${API_URL}/${route}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },

        });
        return response.data;
    } catch (error) {
        console.error('PUT Error:', error);
        throw error;
    }
};

// Hàm PATCH
const patchData = async (route: string, data: any, token: string) => {
    try {
        const response = await axios.patch(`${API_URL}/${route}`, data,
            {
                headers:
                {
                    'Content-Type': 'application/json JSON',
                    Authorization: `Bearer ${token}`
                }
            });
        return response.data;
    } catch (error) {
        console.error('PATCH Error:', error);
        throw error;
    }
};

// Hàm DELETE
const deleteData = async (route: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/${route}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },

            // Tham số truyền qua query
        });
        return response.data;
    } catch (error) {
        console.error('DELETE Error:', error);
        throw error;
    }
};

// Export các hàm
export { postData, getData, putData, patchData, deleteData, postFormData, API_URL };
