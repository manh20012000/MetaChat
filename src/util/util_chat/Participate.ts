import {itemuser} from '../../type/search_type';

let participate: itemuser[] = [];

export const Add_Participate = (users: itemuser[] | itemuser): itemuser[] => {
  // Kiểm tra nếu chỉ nhận 1 user (không phải mảng)
  if (!Array.isArray(users)) {
    participate.push(users);
  } else {
    // Thêm tất cả user từ mảng vào participate
    users.forEach(user => {
      participate.push(user);
    });
  }
  return participate;
};

export const Get_Id_Participate = () => { 
    return participate.map(user => user._id);
}

export const Get_Participate = () => { 
    return participate;
}

export const Clear_Participate = () => { 
    participate = [];
}
