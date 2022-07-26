import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../lib/mongodb";

async function fetchMovies(req: NextApiRequest, res: NextApiResponse){
    const client = await clientPromise
    const db = client.db("myDatabase")

  const movies = await db
    .collection("movies")
    .find({})
    .sort({ metacritic: -1 })
    .limit(20)
    .toArray();

  res.json(movies);
};

export default fetchMovies