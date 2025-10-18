import { getCurrentUser } from '../../../utils/auth';


export const checkAuth = async () => {
  try {
    const user = await getCurrentUser();
    return { isAuthenticated: true, user };
  } catch (error) {
    return { isAuthenticated: false };
  }
};
