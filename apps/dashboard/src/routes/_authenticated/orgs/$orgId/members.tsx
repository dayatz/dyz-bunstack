import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@dyz-bunstack-app/ui";
import { memberQueries } from "#/modules/members/queries";
import {
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
  useCancelInvitation,
} from "#/modules/members/mutations";

export const Route = createFileRoute(
  "/_authenticated/orgs/$orgId/members"
)({
  component: MembersPage,
});

function MembersPage() {
  const { orgId } = Route.useParams();
  const { data, isLoading } = useQuery(memberQueries.list(orgId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Members</h2>
        <InviteMemberDialog orgId={orgId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.members?.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.name}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.role === "owner"
                              ? "default"
                              : member.role === "admin"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <MemberActions orgId={orgId} member={member} />
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && (!data?.members || data.members.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No members
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data?.invitations && data.invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invitations.map((inv: any) => (
                  <InvitationRow key={inv.id} orgId={orgId} invitation={inv} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemberActions({ orgId, member }: { orgId: string; member: any }) {
  const updateRole = useUpdateMemberRole(orgId);
  const removeMember = useRemoveMember(orgId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["member", "admin", "owner"] as const).map((role) => (
          <DropdownMenuItem
            key={role}
            disabled={member.role === role || updateRole.isPending}
            onClick={() =>
              updateRole.mutate(
                { memberId: member.id, role },
                {
                  onSuccess: () => toast.success(`Role changed to ${role}`),
                  onError: () => toast.error("Failed to change role"),
                }
              )
            }
          >
            Set as {role}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={removeMember.isPending}
          onClick={() =>
            removeMember.mutate(member.id, {
              onSuccess: () => toast.success("Member removed"),
              onError: () => toast.error("Failed to remove member"),
            })
          }
        >
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InvitationRow({ orgId, invitation }: { orgId: string; invitation: any }) {
  const cancel = useCancelInvitation(orgId);

  return (
    <TableRow>
      <TableCell>{invitation.email}</TableCell>
      <TableCell>
        <Badge variant="outline">{invitation.role ?? "member"}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{invitation.status}</Badge>
      </TableCell>
      <TableCell>
        {invitation.status === "pending" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(invitation.id, {
                onSuccess: () => toast.success("Invitation cancelled"),
                onError: () => toast.error("Failed to cancel invitation"),
              })
            }
          >
            Cancel
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function InviteMemberDialog({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin" | "owner">("member");
  const invite = useInviteMember(orgId);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEmail(""); setRole("member"); } }}>
      <DialogTrigger asChild>
        <Button size="sm">Invite Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              {(["member", "admin", "owner"] as const).map((r) => (
                <Button
                  key={r}
                  variant={role === r ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRole(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!email || invite.isPending}
            onClick={() =>
              invite.mutate(
                { email, role },
                {
                  onSuccess: () => {
                    toast.success("Invitation sent");
                    setOpen(false);
                  },
                  onError: () => toast.error("Failed to send invitation"),
                }
              )
            }
          >
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
