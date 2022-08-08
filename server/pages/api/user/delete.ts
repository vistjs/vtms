import type { NextApiRequest, NextApiResponse } from 'next'
import conn from '@/lib/mongoose'
import Project from '@/models/project';
import UserModel from '@/models/user';

import HttpStatus from 'http-status-codes'
import nextConnect from 'next-connect';

const handler = nextConnect();

handler.delete(async(req: NextApiRequest, res: NextApiResponse) => {
	try {
    const {
        body: { id }
    } = req
    await conn()
    const { deletedCount } = await UserModel.deleteOne({ id })
    if (deletedCount) {
        res.status(HttpStatus.OK).json({ data:{id},code:0,message:'delete success.' })
    } else {
        res.status(HttpStatus.OK).json({ data:{id},code:0,message:`not found ${id}.` })
    }
	} catch (err: any) {
		res.status(HttpStatus.BAD_REQUEST).json({err});
	}
})

export default handler;