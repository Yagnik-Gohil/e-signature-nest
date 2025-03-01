import { IJwtPayload } from '@shared/constants/types';
import * as jwt from 'jsonwebtoken';

const generateToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export default generateToken;
