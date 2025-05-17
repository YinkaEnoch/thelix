export const getUserData = () => {
  const userData = sessionStorage.getItem("APP_USER_DATA");

  if (!userData) return null;

  return JSON.parse(userData);
};

export const saveUserData = (userData: Record<string, any>) => {
  sessionStorage.setItem("APP_USER_DATA", JSON.stringify(userData));
};
