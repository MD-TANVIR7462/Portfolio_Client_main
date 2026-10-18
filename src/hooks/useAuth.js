import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
  };
};
