import { authClient } from "#/libs/auth";

export async function inviteMember(
  organizationId: string,
  email: string,
  role: "member" | "admin" | "owner"
) {
  const res = await authClient.organization.inviteMember({
    organizationId,
    email,
    role,
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function removeMember(organizationId: string, memberIdOrEmail: string) {
  const res = await authClient.organization.removeMember({
    organizationId,
    memberIdOrEmail,
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  role: "member" | "admin" | "owner"
) {
  const res = await authClient.organization.updateMemberRole({
    organizationId,
    memberId,
    role,
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function cancelInvitation(invitationId: string) {
  const res = await authClient.organization.cancelInvitation({
    invitationId,
  });
  if (res.error) throw res.error;
  return res.data;
}
