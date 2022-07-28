import  formidable  from  'formidable';
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextApiRequestWithFile } from '../types'
const  form = formidable({ multiples:  true }); // multiples means req.files will be an array


export  default  async  function  parseMultipartForm(req: NextApiRequestWithFile, res: NextApiResponse, next: any) {
	const  contentType = req.headers['content-type']
	if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
		form.parse(req, (err, fields, files) => {
            if (!err) {
                req.body = fields; // sets the body field in the request object
                req.files = files; // sets the files field in the request object
            }
		    next(); // continues to the next middleware or to the route
		})
	} else {
		next();
	}
}