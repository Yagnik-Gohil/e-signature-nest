export const MESSAGE = {
  SUCCESS: 'Your request is successfully executed',
  SIGN_UP: 'Signup Successful',
  LOGIN: 'Login Successful',
  LOGOUT: 'Logout Successful',
  RECORD_CREATED: (record: string) => `${record} Created Successfully`,
  RECORD_UPDATED: (record: string) => `${record} Updated Successfully`,
  RECORD_DELETED: (record: string) => `${record} Deleted Successfully`,
  RECORD_FOUND: (record: string) => `${record} Found Successfully`,
  RECORD_NOT_FOUND: (record: string) => `${record} Not Found`,
  METHOD_NOT_ALLOWED: 'Method Not Allowed.',
  ALREADY_EXISTS: (record: string) => `${record} Already Exists`,
  WRONG_CREDENTIALS: 'Wrong credentials!',
  UNAUTHENTICATED: 'Please log in to access.',
};

export const VALUE = {
  limit: 10,
  offset: 0,
};
