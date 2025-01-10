import {useSelector, useDispatch} from 'react-redux';

const useCheckingService = () => {
  const user = useSelector((value: {auth: {value: any}}) => value.auth.value);
  const dispatch = useDispatch();
  
  return {
    dispatch,
    user,
  };
};

export default useCheckingService;
