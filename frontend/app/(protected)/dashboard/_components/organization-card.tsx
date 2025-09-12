"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDownIcon, Loader2, MailPlus, PlusIcon, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ActiveOrganization, Session } from "@/types/auth-types";
import {
  organization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CopyButton from "@/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AvatarInput } from "@/app/(profile)/[username]/_components/EditProfileDialog";
import { motion, AnimatePresence } from "framer-motion";
import { InvitationStatus } from "@prisma/client";

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
    visible: { opacity: 1, height: "auto" },
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
                  <span className="font-bold" />{" "}
                  {optimisticOrg?.name || "Personal"}
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
            <CreateOrganizationDialog currentMember={currentMember} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="rounded-none">
            <AvatarImage
              className="h-full w-full rounded-none object-cover"
              src={optimisticOrg?.logo || undefined}
            />
            <AvatarFallback className="rounded-none">
              {optimisticOrg?.name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{optimisticOrg?.name || "Personal"}</p>
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
                  {member.role !== "owner" &&
                    (currentMember?.role === "owner" ||
                      currentMember?.role === "admin") && (
                      <Button
                        onClick={() => {
                          organization.removeMember({
                            memberIdOrEmail: member.id,
                          });
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        {currentMember?.id === member.id ? "Leave" : "Remove"}
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
              <AnimatePresence>
                {optimisticOrg?.invitations
                  .filter((invitation) => invitation.status === (InvitationStatus.PENDING as string))
                  .map((invitation) => (
                    <motion.div
                      className="flex items-center justify-between"
                      key={invitation.id}
                      variants={inviteVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
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
                                    "Invitation revoked successfully"
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
                            "Revoke"
                          )}
                        </Button>
                        <div>
                          <CopyButton
                            textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {optimisticOrg?.invitations.length === 0 && (
                <motion.p
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No Active Invitations
                </motion.p>
              )}
              {!optimisticOrg?.id && (
                <Label className="text-muted-foreground text-xs">
                  You can&apos;t invite members to your personal workspace.
                </Label>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-end gap-2">
          <div>
            <div>
              {optimisticOrg?.id && (
                <>
                  {/* <InviteMemberDialog
                    optimisticOrg={optimisticOrg}
                    setOptimisticOrg={setOptimisticOrg}
                  /> */}
                  {(currentMember?.role === "owner" ||
                    currentMember?.role === "admin"
                    // currentMember?.role === "ORGANIZATION_ADMIN" ||
                    // currentMember?.role === "SCHOOL_ADMIN" ||
                    // currentMember?.role === "FACULTY_ADMIN"
                  ) && (
                      <InviteProfessorDialog
                        optimisticOrg={optimisticOrg}
                        setOptimisticOrg={setOptimisticOrg}
                      />
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateOrganizationDialog({ currentMember }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");

  // Defensive: handle undefined currentMember and currentMember.user
  const userImage =
    currentMember && currentMember.user ? currentMember.user.image : undefined;

  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  }, [name, isSlugEdited]);

  useEffect(() => {
    if (croppedAvatar) {
      const url = URL.createObjectURL(croppedAvatar);
      setAvatarPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (userImage) {
      setAvatarPreviewUrl(userImage);
    } else {
      setAvatarPreviewUrl("");
    }
  }, [croppedAvatar, userImage]);

  useEffect(() => {
    if (open) {
      setName("");
      setSlug("");
      setIsSlugEdited(false);
      setLogo(null);
    }
  }, [open]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" size="sm" variant="default">
          <PlusIcon />
          <p className="hidden lg:block">New Organization</p>
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
          <div className="space-y-1.5">
            <Label>Avatar</Label>
            <AvatarInput
              src={avatarPreviewUrl}
              onImageCropped={setCroppedAvatar}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await organization.create(
                {
                  name: name,
                  slug: slug,
                  logo: logo || undefined,
                  keepCurrentActiveOrganization: false,
                },
                {
                  onResponse: () => {
                    setLoading(false);
                  },
                  onSuccess: () => {
                    toast.success("Organization created successfully");
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
              "Create"
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
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
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
                try {
                  setLoading(true);

                  // Use our unified invitation API instead of better-auth's built-in method
                  const response = await fetch("/api/invitations", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: email,
                      organizationId: optimisticOrg?.id,
                      role: role === "admin" ? "ORGANIZATION_ADMIN" : "STUDENT",
                      type: "ORGANIZATION_MEMBER",
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to send invitation");
                  }

                  const result = await response.json();

                  // Update the optimistic state with the new invitation
                  if (optimisticOrg && result.invitation) {
                    setOptimisticOrg({
                      ...optimisticOrg,
                      invitations: [
                        ...(optimisticOrg?.invitations || []),
                        result.invitation,
                      ],
                    });
                  }

                  toast.success("Member invited successfully");
                } catch (error: any) {
                  toast.error(error.message || "Failed to send invitation");
                } finally {
                  setLoading(false);
                }
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

// Professor invitation schema
const professorInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  facultyId: z.string().min(1, "Faculty selection is required"),
  title: z.string().optional(),
  department: z.string().optional(),
  message: z.string().optional(),
  contractType: z.string().optional(),
});

function InviteProfessorDialog({
  setOptimisticOrg,
  optimisticOrg,
}: {
  setOptimisticOrg: (org: ActiveOrganization | null) => void;
  optimisticOrg: ActiveOrganization | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof professorInvitationSchema>>({
    resolver: zodResolver(professorInvitationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      facultyId: "",
      title: "Professor",
      department: "",
      message: "",
      contractType: "Full-time",
    },
  });

  // Fetch faculties for the current organization
  const { data: faculties, isLoading: facultiesLoading } = useQuery({
    queryKey: ["faculties", optimisticOrg?.id],
    queryFn: async () => {
      const response = await fetch("/api/faculties");
      if (!response.ok) {
        throw new Error("Failed to fetch faculties");
      }
      return response.json();
    },
    enabled: !!optimisticOrg?.id && open,
  });

  const onSubmit = async (values: z.infer<typeof professorInvitationSchema>) => {
    try {
      setLoading(true);

      // Map professor invitation values to the general invitation schema
      const invitationData = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        facultyId: values.facultyId,
        schoolId: faculties?.find((f: any) => f.id === values.facultyId)?.schoolId,
        organizationId: optimisticOrg?.id,
        role: "PROFESSOR",
        type: "PROFESSOR_APPOINTMENT",
        proposedTitle: values.title,
        department: values.department,
        message: values.message,
        contractType: values.contractType,
      };

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invitationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send professor invitation");
      }

      const result = await response.json();

      // Update the optimistic state with the new invitation
      if (optimisticOrg && result.invitation) {
        setOptimisticOrg({
          ...optimisticOrg,
          invitations: [
            ...(optimisticOrg?.invitations || []),
            result.invitation,
          ],
        });
      }

      toast.success("Professor invitation sent successfully");
      setOpen(false);
      form.reset();
      // Optionally refresh organization data here

    } catch (error: any) {
      toast.error(error.message || "Failed to send professor invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 ml-2" size="sm" variant="outline">
          <GraduationCap size={16} />
          <p>Invite Professor</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Professor</DialogTitle>
          <DialogDescription>
            Send a professor invitation to join your institution and assign them to a specific faculty.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="professor@university.edu" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a faculty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {facultiesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading faculties...
                        </SelectItem>
                      ) : (
                        faculties?.map((faculty: any) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Professor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Visiting">Visiting</SelectItem>
                      <SelectItem value="Adjunct">Adjunct</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="We would like to invite you to join our faculty..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || facultiesLoading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
