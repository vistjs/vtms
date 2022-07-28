import type { NextApiRequest, NextApiResponse } from 'next'
import conn from '@/lib/mongoose'
import Project from '@/models/project';
import { PROJECT_STATUS } from '@/constant/index'
import HttpStatus from 'http-status-codes'
import middleware from '../../../middleware/middleware'
import { newProjectSeq } from '../../../utils'

import nextConnect from 'next-connect';

const handler = nextConnect();

handler.use(middleware);

handler.put(async(req: NextApiRequest, res: NextApiResponse) => {
	try {
		const {
      query: { id },
      body: { name,desc, logo },
    } = req
    await conn()
    let doc
    if(id==='create'){
      const seqId = await newProjectSeq();
      doc = await Project.create({name, logo, desc, seq: seqId})
    }else{
      doc = await Project.findOneAndUpdate({ seq: Number(id) }, {name, logo, desc} , {new: true, upsert: true});
    }
    res.status(HttpStatus.OK).json({ data:{id: doc.seq},code:0,message:'' })
	} catch (err: any) {
		res.status(HttpStatus.BAD_REQUEST).json({error: err.message});
	}
});

handler.delete(async(req: NextApiRequest, res: NextApiResponse) => {
	try {
		const {
      query: { id },
    } = req
    await conn()
    let doc = await Project.findOneAndUpdate({ seq: Number(id) }, {status: PROJECT_STATUS.deleted});
    res.status(HttpStatus.OK).json({ data:{id: doc.seq},code:0,message:'' })
	} catch (err: any) {
		res.status(HttpStatus.BAD_REQUEST).json({error: err.message});
	}
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
}