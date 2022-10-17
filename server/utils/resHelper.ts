import type { NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import { ErrorCode, ErrorShowType } from '@/constant';

export function handlePagination(
  page?: any,
  limit?: any,
): {
  limit: number;
  offset: number;
} {
  if (page && typeof page === 'string' && typeof parseInt(page) === 'number') {
    page = parseInt(page);
  } else {
    page = 1;
  }
  if (
    limit &&
    typeof limit === 'string' &&
    typeof parseInt(limit) === 'number'
  ) {
    limit = parseInt(limit);
  } else {
    limit = 10;
  }
  return {
    limit,
    offset: (page - 1) * limit,
  };
}

export function generateQueryFilter(params: { [key: string]: any }) {
  let filter: { [key: string]: any } = {};
  if (params) {
    Object.keys(params).forEach((itemKey) => {
      if (params[itemKey] == undefined) {
        return;
      }
      filter[itemKey] = params[itemKey];
    });
  }
  return filter;
}

interface ResponseStructure {
  data: any;
  code: ErrorCode;
  message: string;
  errorMessage?: string;
  showType?: ErrorShowType;
}

export function normalizeResult(
  data: any,
  code: ErrorCode,
  message = '',
  errorMessage?: string,
  showType?: ErrorShowType,
): ResponseStructure {
  const res: ResponseStructure = { data, code, message };
  if (typeof errorMessage !== 'undefined') {
    res.errorMessage = errorMessage;
  }
  if (typeof showType !== 'undefined') {
    res.showType = showType;
  }
  return res;
}

export function normalizeSuccess(
  res: NextApiResponse,
  data: any,
  message = '',
) {
  res.status(HttpStatus.OK).json(normalizeResult(data, ErrorCode.SUCCESS));
}

export function normalizeError(
  res: NextApiResponse,
  errorMessage = '',
  code = ErrorCode.COMMON_ERROR,
  showType = ErrorShowType.ERROR_MESSAGE,
) {
  res
    .status(HttpStatus.OK)
    .json(normalizeResult(null, code, '', errorMessage, showType));
}
