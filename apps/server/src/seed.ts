import { auth } from "#/auth";
import { db } from "#/db";
import { user } from "#/db/schema";
// @mt-start
import { organization as orgTable, member as memberTable } from "#/db/schema";
// @mt-end
import { eq } from "drizzle-orm";
import { dbLogger } from "#/lib/logger";

const demoAccounts = [
  { name: "Admin User", email: "admin@demo.com", password: "password123", role: "admin" as const },
  { name: "Test User", email: "user@demo.com", password: "password123", role: "user" as const },
];

async function seed() {
  for (const account of demoAccounts) {
    try {
      const { role: _, ...signUpBody } = account;
      await auth.api.signUpEmail({ body: signUpBody });
      dbLogger.success(`Created: ${account.email}`);
    } catch (e: any) {
      if (e?.message?.includes("already exists") || e?.body?.code === "USER_ALREADY_EXISTS") {
        dbLogger.info(`Already exists: ${account.email}`);
      } else {
        dbLogger.error(`Failed to create ${account.email}:`, e);
      }
    }

    // Always ensure role is set correctly
    await db.update(user).set({ role: account.role }).where(eq(user.email, account.email));
    dbLogger.success(`Set role: ${account.email} → ${account.role}`);
  }

  // @mt-start
  // Seed demo organization
  try {
    const adminUser = await db.select().from(user).where(eq(user.email, "admin@demo.com")).then(r => r[0]);
    const testUser = await db.select().from(user).where(eq(user.email, "user@demo.com")).then(r => r[0]);

    if (adminUser && testUser) {
      const orgId = crypto.randomUUID();
      await db.insert(orgTable).values({
        id: orgId,
        name: "Demo Corp",
        slug: "demo-corp",
        createdAt: new Date(),
      }).onConflictDoNothing();

      await db.insert(memberTable).values([
        { id: crypto.randomUUID(), organizationId: orgId, userId: adminUser.id, role: "owner", createdAt: new Date() },
        { id: crypto.randomUUID(), organizationId: orgId, userId: testUser.id, role: "member", createdAt: new Date() },
      ]).onConflictDoNothing();

      dbLogger.success("Created Demo Corp organization with members");
    }
  } catch (e: any) {
    if (e?.message?.includes("duplicate") || e?.code === "23505") {
      dbLogger.info("Demo Corp already exists");
    } else {
      dbLogger.error("Failed to seed organization:", e);
    }
  }
  // @mt-end

  dbLogger.success("Seed complete.");
  process.exit(0);
}

seed();
