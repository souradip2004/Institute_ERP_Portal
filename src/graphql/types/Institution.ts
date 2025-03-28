import { objectType, stringArg, nonNull } from "nexus";
import prisma from "../prisma";
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
const Institution = objectType({
    name: "Institution",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("type");
        t.nullable.string("address");
        t.nullable.string("city");
        t.nullable.string("state");
        t.nullable.string("country");
        t.nullable.string("postalCode");
        t.nullable.string("phone");
        t.nullable.string("email");
        t.nullable.string("website");
        t.field("createdAt", { type: "String" });
        t.field("updatedAt", { type: "String" });
        t.nullable.string("logoUrl");
        t.nullable.string("primaryColor");
        t.nullable.field("subscriptionStatus", { 
            type: "String", 
        });
     
        t.nullable.field("subscriptionEndDate", { 
            type: "String", 
        });
        t.nullable.string("subscriptionPlanId", {
            resolve: async (parent) => {
                if (!parent.id) return null;
                const users = await prisma.institution.findUnique({ where: { id: parent.id } })?.users();
                return users ? users.map(user => user.id).join(", ") : null;
            },
        });
    },
});
export default Institution;