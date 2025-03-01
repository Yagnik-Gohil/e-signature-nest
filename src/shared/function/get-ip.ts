import { Request } from 'express';

const getIp = (req: Request): string => {
  const ip =
    req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;
  return Array.isArray(ip) ? ip[0] : ip || '';
};

export default getIp;
