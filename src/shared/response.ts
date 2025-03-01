import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { MESSAGE } from './constants/constant';

interface Data {
  message: string;
  data: any;
}

interface List {
  message?: string;
  total: number;
  limit: number;
  offset: number;
  data: any[];
}

const successCreate = (data: Data, res: Response) => {
  res.status(HttpStatus.CREATED).json({
    status: 1,
    message: data.message ? data.message : MESSAGE.SUCCESS,
    data: data.data,
  });
};

const successResponse = (data: Data, res: Response) => {
  res.status(HttpStatus.OK).json({
    status: 1,
    message: data.message ? data.message : MESSAGE.SUCCESS,
    data: data.data,
  });
};

const successResponseWithPagination = (data: List, res: Response) => {
  const message = data.data.length
    ? MESSAGE.RECORD_FOUND('Record')
    : MESSAGE.RECORD_NOT_FOUND('Record');
  res.status(HttpStatus.OK).json({
    status: 1,
    message: data.message ? data.message : message,
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    data: data.data,
  });
};

const recordNotFound = (data: Data, res: Response) =>
  res.status(HttpStatus.OK).json({
    status: 0,
    message: data.message ? data.message : MESSAGE.RECORD_NOT_FOUND('Record'),
    data: data.data,
  });

const response = {
  successCreate,
  successResponse,
  successResponseWithPagination,
  recordNotFound,
};

export default response;
