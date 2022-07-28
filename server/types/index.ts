import type { NextApiRequest, NextApiResponse } from 'next'

export type NextApiRequestWithFile = NextApiRequest & {
    files: any
  }