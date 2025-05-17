export const getUserData = () => {
  return JSON.parse(sessionStorage.getItem("APP_USER_DATA") ?? "");
};

export const saveUserData = (userData: Record<string, any>) => {
  sessionStorage.setItem("APP_USER_DATA", JSON.stringify(userData));
};
