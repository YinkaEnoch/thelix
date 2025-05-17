export const getAccessToken = () => {
  return sessionStorage.getItem("APP_ACCESS_TOKEN");
};

export const saveAccessToken = (accessToken: string) => {
  sessionStorage.setItem("APP_ACCESS_TOKEN", accessToken);
};
