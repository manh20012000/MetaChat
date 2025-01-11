
import { URL } from '@env';
const API_URL = 'http://192.168.1.6:8080';
console.log('hahah', URL)
import axios from 'axios';
import { checkAndRefreshToken } from '../util/checkingToken';
import User_interface from '../interface/user.Interface';

const postData = async (route: string, data: any ,check:any) => {
  const checking = await checkAndRefreshToken(check.dispatch,check.user);
  if (checking === null) {
    return null;
  } else {
    try {
      const response = await axios.post(`${API_URL}/${route}`, data, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${checking.access_token} `,
        },

      });
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error('POST Error:', error);
      throw error; // Ném lỗi ra để xử lý bên ngoài
    }
  }

};
const postFormData = async (route: string, data: any,check:any) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null
  } else {
    try {

      const response = await axios.post(`${API_URL}/${route}`, data, {
        headers: {
          'Content-Type': "multipart/form-data",
          authorization: `Bearer ${checking.access_token}`,

        },
        data: JSON.stringify(data), // Chuyển dữ liệu thành JSON
      });
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error('POST Error:', error);
      throw error; // Ném lỗi ra để xử lý bên ngoài
    }
  }
}
// Hàm GET
const getData = async (route: string, query: any, param: any,check:any) => {
  console.log('hahahahh')
  const checking =await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null
  } 
    try {
      console.log('hahah222')
      const response = await axios.get(`${API_URL}/${route}/${param}`, {
        params: query ?? {},
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${checking.access_token} `,
        },

        // Tham số truyền qua query
      });
      return response.data;
    } catch (error) {
      console.error('GET Error:', error);
      throw error;
    }
  
}
const getResearch = async (route: string, params: any,) => {
  try {
    const response: any = await axios.get(`${API_URL}${route}`, {
      params: { text: params } ?? {},
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(API_URL)
    return response.data;
  } catch (error) {
    console.error('GET Error:', error);
    throw error;

  };
}

// Hàm PUT
const putData = async (route: string, data: any,check:any) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null
  } else {
    try {
      const response = await axios.put(`${API_URL}/${route}`, data, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${checking.access_token} `,
        },

      });
      return response.data;
    } catch (error) {
      console.error('PUT Error:', error);
      throw error;
    }
  };
}

// Hàm PATCH
const patchData = async (route: string, data: any,check:any) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null
  } else {
    try {
      const response = await axios.patch(`${API_URL}/${route}`, data,
        {
          headers:
          {
            'Content-Type': 'application/json JSON',
            authorization: `Bearer ${checking.access_token} `,
          }
        });
      return response.data;
    } catch (error) {
      console.error('PATCH Error:', error);
      throw error;
    }
  };
}

// Hàm DELETE
const deleteData = async (route: string,check:any) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null
  } else {
    try {
      const response = await axios.delete(`${API_URL}/${route}`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${checking.access_token} `,
        },

        // Tham số truyền qua query
      });
      return response.data;
    } catch (error) {
      console.error('DELETE Error:', error);
      throw error;
    }
  }
};

// Export các hàm
export { postData, getData, putData, patchData, deleteData, postFormData, getResearch, API_URL };
