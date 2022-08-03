import type { NextApiRequest, NextApiResponse } from 'next'
import conn from '@/lib/mongoose'
import Project from '@/models/project';
import UserModel, {IUser} from '@/models/user';

import HttpStatus from 'http-status-codes'
import nextConnect from 'next-connect';
import { PROJECT_STATUS } from '@/constant/index'

const handler = nextConnect();

// handler.get(async(req: NextApiRequest, res: NextApiResponse) => {
// 	try {
//     await conn()
//     const docs = await Project.find({status: PROJECT_STATUS.enable}).lean()
//     res.status(HttpStatus.OK).json({ data:{list: docs},code:0,message:'' })
// 	} catch (err: any) {
// 		res.status(HttpStatus.BAD_REQUEST).json({error: err.message});
// 	}
// });

handler.post(async(req: NextApiRequest, res: NextApiResponse) => {
	try {
    const {
        // query: { id },
        body: { name, password, roles }
    } = req
    await conn()
    console.log('req:', req.body)
    // TODO: do it later
    const docs = await UserModel.create({ name, password, roles, id: '22' })
    res.status(HttpStatus.OK).json({ data:{},code:0,message:'' })
	} catch (err: any) {
        console.log('err:', err)
		res.status(HttpStatus.BAD_REQUEST).json({error: 'ffff'});
	}
})

export default handler;