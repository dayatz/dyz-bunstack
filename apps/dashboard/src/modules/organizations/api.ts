import { authClient } from "#/libs/auth";
import type { CreateOrgRequestData } from "./contracts";

export async function listOrganizations() {
  const res = await authClient.organization.list();
  if (res.error) throw res.error;
  return res.data;
}

export async function getOrganization(organizationId: string) {
  const res = await authClient.organization.getFullOrganization({
    query: { organizationId },
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function createOrganization(data: CreateOrgRequestData) {
  const res = await authClient.organization.create({
    name: data.name,
    slug: data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-"),
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function deleteOrganization(organizationId: string) {
  const res = await authClient.organization.delete({
    organizationId,
  });
  if (res.error) throw res.error;
  return res.data;
}
