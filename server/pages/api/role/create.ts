import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import RoleModel, { IRole } from '@/models/role';
import { ROLE_TYPE } from '@/constant/index';

import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

const handler = nextConnect();

// handler.post(async(req: NextApiRequest, res: NextApiResponse) => {
// 	try {
//     const {
//         // query: { id },
//         body: { name, password, roles }
//     } = req
//     await conn()
//     console.log('req:', req.body)
//     // TODO: do it later
//     const docs = await UserModel.create({ name, password, roles, id: '22' })
//     res.status(HttpStatus.OK).json({ data:{},code:0,message:'' })
// 	} catch (err: any) {
//         console.log('err:', err)
// 		res.status(HttpStatus.BAD_REQUEST).json({error: 'ffff'});
// 	}
// })

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      // query: { id },
      body: { name, password, roles },
    } = req;
    const newRole: IRole = {
      name: 'new',
      project_id: '224',
      id: '11',
      type: ROLE_TYPE.admin,
    };
    await conn();
    console.log('req:', req.body);
    // TODO: do it later
    const docs = await RoleModel.create(newRole);
    res.status(HttpStatus.OK).json({ data: {}, code: 0, message: '' });
  } catch (err: any) {
    console.log('err:', err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: 'ffff' });
  }
});

export default handler;
