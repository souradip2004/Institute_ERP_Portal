import { makeSchema, objectType, stringArg, nonNull } from "nexus";
import path from "path"
import prisma from "../prisma";
/*
id                String    @id @default(uuid()) @db.Uuid
  email             String    @unique
  passwordHash      String    @map("password_hash")
  role              Role      @default(STUDENT)
  isActive          Boolean   @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  lastLogin         DateTime? @map("last_login")
  resetToken        String?   @map("reset_token")
  resetTokenExpires DateTime? @map("reset_token_expires")
  isEmailVerified   Boolean   @default(false) @map("is_email_verified")
  twoFactorSecret   String?   @map("two_factor_secret")
  twoFactorEnabled  Boolean   @default(false) @map("two_factor_enabled")
  profileImageUrl   String?   @map("profile_image_url")
  timezone          String?
  institutionId     String    @map("institution_id") @db.Uuid
  */
const User = objectType({
  name: "User",
  definition(t: import("nexus/dist/core").ObjectDefinitionBlock<"User">) {
    t.string("id");
    t.string("email");
    t.string("passwordHash");
    t.boolean("isActive");
    t.string("role");
    t.nullable.field("institution", {
      type: "Institution",
      resolve: async (parent) => {
      if (!parent.id) {
        throw new Error("User ID is required");
      }
      const institution = await prisma.user.findUnique({ where: { id: parent.id } }).institution();
      if (institution) {
        return {
        ...institution,
        createdAt: institution.createdAt.toISOString(),
        updatedAt: institution.updatedAt.toISOString(),
        subscriptionEndDate: institution.subscriptionEndDate ? institution.subscriptionEndDate.toISOString() : null,
        };
      }
      return null;
      },
    });
    t.nullable.string("createdAt");
    t.string("updatedAt");
    t.nullable.string("lastLogin");
    t.nullable.string("resetToken");
    t.nullable.string("resetTokenExpires")
    t.boolean("isEmailVerified");
    t.nullable.string("twoFactorSecret");
    t.boolean("twoFactorEnabled");
    t.nullable.string("profileImageUrl");
    t.nullable.string("timezone");
    t.string("institutionId");
        return null;
      },
    });
export default User;
