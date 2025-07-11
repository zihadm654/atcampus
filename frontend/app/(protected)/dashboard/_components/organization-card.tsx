'use client';

import { ChevronDownIcon, Loader2, MailPlus, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CopyButton from '@/components/ui/copy-button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  organization,
  useListOrganizations,
  useSession,
} from '@/lib/auth-client';
import type { ActiveOrganization, Session } from '@/types/auth-types';

export function OrganizationCard(props: {
  session: Session | null;
  activeOrganization: ActiveOrganization | null;
}) {
  const organizations = useListOrganizations();
  const [optimisticOrg, setOptimisticOrg] = useState<ActiveOrganization | null>(
    props.activeOrganization
  );
  const [isRevoking, setIsRevoking] = useState<string[]>([]);
  const inviteVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
  };

  const { data } = useSession();
  const session = data || props.session;

  const currentMember = optimisticOrg?.members.find(
    (member) => member.userId === session?.user.id
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <div className="flex justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-1">
                <p className="text-sm">
                  <span className="font-bold" />{' '}
                  {optimisticOrg?.name || 'Personal'}
                </p>

                <ChevronDownIcon />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="py-1"
                onClick={async () => {
                  organization.setActive({
                    organizationId: null,
                  });
                  setOptimisticOrg(null);
                }}
              >
                <p className="sm text-sm">Personal</p>
              </DropdownMenuItem>
              {organizations.data?.map((org) => (
                <DropdownMenuItem
                  className="py-1"
                  key={org.id}
                  onClick={async () => {
                    if (org.id === optimisticOrg?.id) {
                      return;
                    }
                    setOptimisticOrg({
                      members: [],
                      invitations: [],
                      ...org,
                    });
                    const { data } = await organization.setActive({
                      organizationId: org.id,
                    });
                    setOptimisticOrg(data);
                  }}
                >
                  <p className="sm text-sm">{org.name}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <CreateOrganizationDialog />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="rounded-none">
            <AvatarImage
              className="h-full w-full rounded-none object-cover"
              src={optimisticOrg?.logo || undefined}
            />
            <AvatarFallback className="rounded-none">
              {optimisticOrg?.name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{optimisticOrg?.name || 'Personal'}</p>
            <p className="text-muted-foreground text-xs">
              {optimisticOrg?.members.length || 1} members
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-grow flex-col gap-2">
            <p className="border-b-2 border-b-foreground/10 font-medium">
              Members
            </p>
            <div className="flex flex-col gap-2">
              {optimisticOrg?.members.map((member) => (
                <div
                  className="flex items-center justify-between"
                  key={member.id}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 sm:flex">
                      <AvatarImage
                        className="object-cover"
                        src={member.user.image || undefined}
                      />
                      <AvatarFallback>
                        {member.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{member.user.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {member.role !== 'owner' &&
                    (currentMember?.role === 'owner' ||
                      currentMember?.role === 'admin') && (
                      <Button
                        onClick={() => {
                          organization.removeMember({
                            memberIdOrEmail: member.id,
                          });
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        {currentMember?.id === member.id ? 'Leave' : 'Remove'}
                      </Button>
                    )}
                </div>
              ))}
              {!optimisticOrg?.id && (
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={session?.user.image || undefined} />
                      <AvatarFallback>
                        {session?.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{session?.user.name}</p>
                      <p className="text-muted-foreground text-xs">Owner</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-grow flex-col gap-2">
            <p className="border-b-2 border-b-foreground/10 font-medium">
              Invites
            </p>
            <div className="flex flex-col gap-2">
              {optimisticOrg?.invitations
                .filter((invitation) => invitation.status === 'pending')
                .map((invitation) => (
                  <div
                    className="flex items-center justify-between"
                    key={invitation.id}
                  >
                    <div>
                      <p className="text-sm">{invitation.email}</p>
                      <p className="text-muted-foreground text-xs">
                        {invitation.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        disabled={isRevoking.includes(invitation.id)}
                        onClick={() => {
                          organization.cancelInvitation(
                            {
                              invitationId: invitation.id,
                            },
                            {
                              onRequest: () => {
                                setIsRevoking([...isRevoking, invitation.id]);
                              },
                              onSuccess: () => {
                                toast.message(
                                  'Invitation revoked successfully'
                                );
                                setIsRevoking(
                                  isRevoking.filter(
                                    (id) => id !== invitation.id
                                  )
                                );
                                setOptimisticOrg({
                                  ...optimisticOrg,
                                  invitations:
                                    optimisticOrg?.invitations.filter(
                                      (inv) => inv.id !== invitation.id
                                    ),
                                });
                              },
                              onError: (ctx) => {
                                toast.error(ctx.error.message);
                                setIsRevoking(
                                  isRevoking.filter(
                                    (id) => id !== invitation.id
                                  )
                                );
                              },
                            }
                          );
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        {isRevoking.includes(invitation.id) ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          'Revoke'
                        )}
                      </Button>
                      <div>
                        <CopyButton
                          textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              {optimisticOrg?.invitations.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No Active Invitations
                </p>
              )}
              {!optimisticOrg?.id && (
                <Label className="text-muted-foreground text-xs">
                  You can&apos;t invite members to your personal workspace.
                </Label>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-end">
          <div>
            <div>
              {optimisticOrg?.id && (
                <InviteMemberDialog
                  optimisticOrg={optimisticOrg}
                  setOptimisticOrg={setOptimisticOrg}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateOrganizationDialog() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  }, [name, isSlugEdited]);

  useEffect(() => {
    if (open) {
      setName('');
      setSlug('');
      setIsSlugEdited(false);
      setLogo(null);
    }
  }, [open]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" size="sm" variant="default">
          <PlusIcon />
          <p>New Organization</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Organization Name</Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Organization Slug</Label>
            <Input
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugEdited(true);
              }}
              placeholder="Slug"
              value={slug}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Logo</Label>
            <Input accept="image/*" onChange={handleLogoChange} type="file" />
            {logo && (
              <div className="mt-2">
                <Image
                  alt="Logo preview"
                  className="h-16 w-16 object-cover"
                  height={16}
                  src={logo}
                  width={16}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await organization.create(
                {
                  name,
                  slug,
                  logo: logo || undefined,
                },
                {
                  onResponse: () => {
                    setLoading(false);
                  },
                  onSuccess: () => {
                    toast.success('Organization created successfully');
                    setOpen(false);
                  },
                  onError: (error) => {
                    toast.error(error.error.message);
                    setLoading(false);
                  },
                }
              );
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteMemberDialog({
  setOptimisticOrg,
  optimisticOrg,
}: {
  setOptimisticOrg: (org: ActiveOrganization | null) => void;
  optimisticOrg: ActiveOrganization | null;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" size="sm" variant="secondary">
          <MailPlus size={16} />
          <p>Invite Member</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            value={email}
          />
          <Label>Role</Label>
          <Select onValueChange={setRole} value={role}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              disabled={loading}
              onClick={async () => {
                const invite = organization.inviteMember({
                  email,
                  role: role as 'member',
                  fetchOptions: {
                    throw: true,
                    onSuccess: (ctx) => {
                      if (optimisticOrg) {
                        setOptimisticOrg({
                          ...optimisticOrg,
                          invitations: [
                            ...(optimisticOrg?.invitations || []),
                            ctx.data,
                          ],
                        });
                      }
                    },
                  },
                });
                toast.promise(invite, {
                  loading: 'Inviting member...',
                  success: 'Member invited successfully',
                  error: (error) => error.error.message,
                });
              }}
            >
              Invite
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
