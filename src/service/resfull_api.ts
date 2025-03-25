import {response} from '../type/response_type';
// import { URL } from '@env';
const API_URL = 'http://192.168.51.104:8080';
import axios from 'axios';
import {checkAndRefreshToken} from '../util/checkingToken';
const postData = async (
  route: string,
  data: any,
  check: any,
): Promise<response> => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);

  if (checking === null) {
    return {
      data: null,
      code: 404,
      message: 'Token is invalid or expired',
      status: false,
    };
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
const postFormData = async (route: string, data: any, check: any) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  const formData = new FormData();
  formData.append('message', JSON.stringify(data.message));
  formData.append('conversation', JSON.stringify(data.conversation));
  formData.append('user', JSON.stringify(data.user));
  formData.append('filesOrder', JSON.stringify(data.filesOrder));
  data.message.attachments.forEach((file: any, index: number) => {
    // console.log(file.url)
    formData.append('media', {
      uri: file.url || `file://${file.path}`,
      name:file.name,
      type:file.type,
    });
  });

  if (checking === null) {
    return null;
  } else {
    try {
      //  const parts = formData.getParts();
      //   parts.forEach((part) => {
      //     console.log(part.headers, part, "màn hình post video1");
      //   });
      //  console.log(formData.append,"dhsdjisjid",formData.getParts)
      const response = await axios.post(`${API_URL}/${route}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          authorization: `Bearer ${checking.access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('not send message', error);
      throw error;
    }
  }
};
// Hàm GET
const getData = async (route: string, query: any, param: any, check: any) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null;
  }
  try {
    const response = await axios.get(`${API_URL}/${route}/${param}`, {
      params: query ?? null,
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
};
const getResearch = async (route: string, params: any) => {
  try {
    const response: any = await axios.get(`${API_URL}${route}`, {
      params: {text: params},
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('GET Error:', error);
    throw error;
  }
};

// Hàm PUT
const putData = async (
  route: string,
  data: any,
  check: any,
  params: string,
) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null;
  } else {
    try {
      const datas = `${API_URL}/${route}/${params}`;
      console.log(datas);
      const response = await axios.put(`${API_URL}/${route}/${params}`, data, {
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
  }
};

// Hàm PATCH
const patchData = async (
  route: string,
  data: any,
  check: any,
  params: string,
) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null;
  } else {
    try {
      const response = await axios.patch(`${API_URL}/${route}`, data, {
        headers: {
          'Content-Type': 'application/json JSON',
          authorization: `Bearer ${checking.access_token} `,
        },
      });
      return response.data;
    } catch (error) {
      console.error('PATCH Error:', error);
      throw error;
    }
  }
};

// Hàm DELETE
const deleteData = async (
  route: string,
  check: any,
  _id: string,
  params: string,
) => {
  const checking = await checkAndRefreshToken(check.dispatch, check.user);
  if (checking === null) {
    return null;
  } else {
    try {
      const response = await axios.delete(`${API_URL}/${route}/${_id}`, {
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
export {
  postData,
  getData,
  putData,
  patchData,
  deleteData,
  postFormData,
  getResearch,
  API_URL,
};
  // const extension = file.name?.split('.').pop() || 'file'; // Lấy phần mở rộng nếu có
    // const name =
    //   file.name || `${new Date().toISOString().slice(0, -5)}.${extension}`;
    // let type = ;
    // if (!type) {
    //   // Gán MIME type dựa trên phần mở rộng
    //   if (extension.match(/(jpg|jpeg|png|gif)/i)) type = `image/${extension}`;
    //   else if (extension.match(/(mp4|mov|avi)/i)) type = `video/${extension}`;
    //   else type = 'application/octet-stream'; // Mặc định nếu không rõ
    // }