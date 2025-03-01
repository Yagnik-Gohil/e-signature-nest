import * as jwt from 'jsonwebtoken';

const isTokenExpired = async (token: string) => {
  try {
    const valid = await jwt.verify(token, process.env.JWT_SECRET);
    if (valid) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    return true;
  }
};

export default isTokenExpired;
