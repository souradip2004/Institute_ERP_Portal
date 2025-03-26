import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";

/*
  id                  String              @id @default(uuid()) @db.Uuid
  name                String
  type                String // Consider creating an enum if types are fixed
  address             String?
  city                String?
  state               String?
  country             String?
  postalCode          String?             @map("postal_code")
  phone               String?
  email               String?
  website             String?
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")
  logoUrl             String?             @map("logo_url")
  primaryColor        String?             @map("primary_color")
  subscriptionStatus  SubscriptionStatus? @map("subscription_status")
  subscriptionEndDate DateTime?           @map("subscription_end_date")
  subscriptionPlanId  String?             @map("subscription_plan_id") @db.Uuid
  */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const institution = req.body;
        const institutionid=await prisma.institution.findFirst({
            where:{
                name:institution.name
            }
        });
        if (institutionid) {
            return res.status(404).json({ error: 'Institution already exists',id: institutionid.id });
        }
        console.log(institution)
        const newInstitution = await prisma.institution.create({
            data: institution,
            
        });
        return res.status(201).json({ message: 'Institution created successfully', id: newInstitution.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//curl http://localhost:3000/api/attendance/department -X POST -H "Content-Type: application/json" -d '{"name":"Computer Science","code":"CS","description":"Computer Science Department"}'