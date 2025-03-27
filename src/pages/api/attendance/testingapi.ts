import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method!=='POST')
        return res.status(405).json({error:"Method not allowed"});
        fetch("http://localhost:3000/api/graphql",{
        body: JSON.stringify({
            query:`
            query{
            users{
                id
                email
                name
              }
            }
            `
        })
        }).then(response=>response.json()).then(data=>console.log(data));
        res.status(200).json({message:"Testing API"});
    }