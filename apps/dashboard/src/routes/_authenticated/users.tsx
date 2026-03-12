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
import { adminUserQueries } from "#/modules/users/queries";
import {
  useBanUser,
  useUnbanUser,
  useSetUserRole,
  useRemoveUser,
} from "#/modules/users/mutations";
import type { AdminUser } from "#/modules/users/contracts";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

const PAGE_SIZE = 10;

function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery(
    adminUserQueries.list({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      searchValue: search || undefined,
      searchField: "email",
    })
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  setPage(0);
                }
              }}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch(searchInput);
                setPage(0);
              }}
            >
              Search
            </Button>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(0);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.users.map((user) => (
                    <UserRow key={user.id} user={user as AdminUser} />
                  ))}
              {!isLoading && data?.users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {data?.total ?? 0} total users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role ?? "user"}
        </Badge>
      </TableCell>
      <TableCell>
        {user.banned ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <UserActions user={user} />
      </TableCell>
    </TableRow>
  );
}

function UserActions({ user }: { user: AdminUser }) {
  const setRole = useSetUserRole();
  const ban = useBanUser();
  const unban = useUnbanUser();
  const remove = useRemoveUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SetRoleDialog user={user} onSubmit={setRole} />
        <DropdownMenuSeparator />
        {user.banned ? (
          <DropdownMenuItem
            onClick={() =>
              unban.mutate(user.id, {
                onSuccess: () => toast.success("User unbanned"),
                onError: () => toast.error("Failed to unban user"),
              })
            }
            disabled={unban.isPending}
          >
            Unban User
          </DropdownMenuItem>
        ) : (
          <BanDialog user={user} onSubmit={ban} />
        )}
        <DropdownMenuSeparator />
        <RemoveDialog user={user} onSubmit={remove} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SetRoleDialog({
  user,
  onSubmit,
}: {
  user: AdminUser;
  onSubmit: ReturnType<typeof useSetUserRole>;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"user" | "admin">((user.role as "user" | "admin") ?? "user");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Set Role
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Role</Label>
          <div className="flex gap-2">
            {(["user", "admin"] as const).map((r) => (
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={onSubmit.isPending}
            onClick={() =>
              onSubmit.mutate(
                { userId: user.id, role },
                {
                  onSuccess: () => {
                    toast.success("Role updated");
                    setOpen(false);
                  },
                  onError: () => toast.error("Failed to update role"),
                }
              )
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BanDialog({
  user,
  onSubmit,
}: {
  user: AdminUser;
  onSubmit: ReturnType<typeof useBanUser>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setReason(""); }}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          variant="destructive"
        >
          Ban User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {user.name} ({user.email}) from the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Reason (optional)</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for banning..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={onSubmit.isPending}
            onClick={() =>
              onSubmit.mutate(
                { userId: user.id, banReason: reason || undefined },
                {
                  onSuccess: () => {
                    toast.success("User banned");
                    setOpen(false);
                  },
                  onError: () => toast.error("Failed to ban user"),
                }
              )
            }
          >
            Ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RemoveDialog({
  user,
  onSubmit,
}: {
  user: AdminUser;
  onSubmit: ReturnType<typeof useRemoveUser>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          variant="destructive"
        >
          Remove User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove User</DialogTitle>
          <DialogDescription>
            Permanently remove {user.name} ({user.email}). This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={onSubmit.isPending}
            onClick={() =>
              onSubmit.mutate(user.id, {
                onSuccess: () => {
                  toast.success("User removed");
                  setOpen(false);
                },
                onError: () => toast.error("Failed to remove user"),
              })
            }
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
