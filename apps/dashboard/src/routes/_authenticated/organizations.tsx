import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { orgQueries } from "#/modules/organizations/queries";
import { useCreateOrg, useDeleteOrg } from "#/modules/organizations/mutations";

export const Route = createFileRoute("/_authenticated/organizations")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { data: orgs, isLoading } = useQuery(orgQueries.list());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
        <CreateOrgDialog />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32">Actions</TableHead>
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
                : orgs?.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Link
                          to="/orgs/$orgId"
                          params={{ orgId: org.id }}
                          className="font-medium hover:underline"
                        >
                          {org.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{org.slug}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/orgs/$orgId" params={{ orgId: org.id }}>
                              View
                            </Link>
                          </Button>
                          <DeleteOrgButton orgId={org.id} orgName={org.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && (!orgs || orgs.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No organizations yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateOrgDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const createOrg = useCreateOrg();

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setName(""); setSlug(""); } }}>
      <DialogTrigger asChild>
        <Button size="sm">Create Organization</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization for multi-tenant access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (optional)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme-inc"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name || createOrg.isPending}
            onClick={() =>
              createOrg.mutate(
                { name, slug: slug || undefined },
                {
                  onSuccess: () => {
                    toast.success("Organization created");
                    setOpen(false);
                  },
                  onError: () => toast.error("Failed to create organization"),
                }
              )
            }
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteOrgButton({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [open, setOpen] = useState(false);
  const deleteOrg = useDeleteOrg();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Organization</DialogTitle>
          <DialogDescription>
            Permanently delete "{orgName}". This removes all members and
            invitations. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deleteOrg.isPending}
            onClick={() =>
              deleteOrg.mutate(orgId, {
                onSuccess: () => {
                  toast.success("Organization deleted");
                  setOpen(false);
                },
                onError: () => toast.error("Failed to delete organization"),
              })
            }
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
