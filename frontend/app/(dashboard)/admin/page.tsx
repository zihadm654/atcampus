"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStatusAction } from "@/actions/update-status.action";
import { UserRole, UserStatus } from "@prisma/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReturnButton } from "@/components/auth/return-button";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { UserRoleSelect } from "@/components/user-role-select";

import { columns } from "./_components/columns";
import { UsersClient } from "./_components/table";
import { UsersTable } from "./_components/users-table";

type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }>({
    email: "",
    password: "",
    name: "",
    role: UserRole.STUDENT,
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    userId: "",
    reason: "",
    expirationDate: undefined as Date | undefined,
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        },
      );
      return data?.users || [];
    },
  });
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("create");
    try {
      await authClient.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role as
          | "STUDENT"
          | "PROFESSOR"
          | "INSTITUTION"
          | "ORGANIZATION",
      });
      toast.success("User created successfully");
      setNewUser({ email: "", password: "", name: "", role: "STUDENT" });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(`delete-${id}`);
    try {
      await Promise.all([authClient.admin.removeUser({ userId: id })]);
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await authClient.admin.revokeUserSessions({ userId: id });
      toast.success("Sessions revoked for user");
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke sessions");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setIsLoading(`impersonate-${id}`);
    try {
      await authClient.admin.impersonateUser({ userId: id });
      toast.success("Impersonated user");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to impersonate user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(`ban-${banForm.userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error("Expiration date is required");
      }
      await authClient.admin.banUser({
        userId: banForm.userId,
        banReason: banForm.reason,
        banExpiresIn: banForm.expirationDate.getTime() - Date.now(),
      });
      toast.success("User banned successfully");
      setIsBanDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
    } finally {
      setIsLoading(undefined);
    }
  };
  console.log(users, "users");

  return (
    <div className="container mx-auto space-y-5 p-2">
      <ReturnButton href="/dashboard" label="profile" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateUser}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                    type="email"
                    value={newUser.email}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    type="password"
                    value={newUser.password}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                    value={newUser.name}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value as UserRole })
                    }
                    value={newUser.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                      <SelectItem value={UserRole.INSTITUTION}>
                        Institution
                      </SelectItem>
                      <SelectItem value={UserRole.ORGANIZATION}>
                        Organization
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  disabled={isLoading === "create"}
                  type="submit"
                >
                  {isLoading === "create" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog onOpenChange={setIsBanDialogOpen} open={isBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleBanUser}>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    onChange={(e) =>
                      setBanForm({ ...banForm, reason: e.target.value })
                    }
                    required
                    value={banForm.reason}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !banForm.expirationDate && "text-muted-foreground",
                        )}
                        id="expirationDate"
                        variant={"outline"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        onSelect={(date) =>
                          setBanForm({ ...banForm, expirationDate: date })
                        }
                        selected={banForm.expirationDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                  type="submit"
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    "Ban User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Banned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <UserRoleSelect
                        role={user.role as UserRole}
                        userId={user.id}
                      />
                    </TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          disabled={isLoading?.startsWith("delete")}
                          onClick={() => handleDeleteUser(user.id)}
                          size="sm"
                          variant="destructive"
                        >
                          {isLoading === `delete-${user.id}` ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash className="size-3" />
                          )}
                        </Button>
                        <Button
                          disabled={isLoading?.startsWith("revoke")}
                          onClick={() => handleRevokeSessions(user.id)}
                          size="sm"
                          variant="outline"
                        >
                          {isLoading === `revoke-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          disabled={isLoading?.startsWith("impersonate")}
                          onClick={() => handleImpersonateUser(user.id)}
                          size="sm"
                          variant="secondary"
                        >
                          {isLoading === `impersonate-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserCircle className="size-3" />
                              Impersonate
                            </>
                          )}
                        </Button>
                        <Button
                          disabled={isLoading?.startsWith("ban")}
                          onClick={async () => {
                            setBanForm({
                              userId: user.id,
                              reason: "",
                              expirationDate: undefined,
                            });
                            if (user.banned) {
                              setIsLoading(`ban-${user.id}`);
                              await authClient.admin.unbanUser(
                                {
                                  userId: user.id,
                                },
                                {
                                  onError(context) {
                                    toast.error(
                                      context.error.message ||
                                        "Failed to unban user",
                                    );
                                    setIsLoading(undefined);
                                  },
                                  onSuccess() {
                                    queryClient.invalidateQueries({
                                      queryKey: ["users"],
                                    });
                                    toast.success("User unbanned successfully");
                                  },
                                },
                              );
                              queryClient.invalidateQueries({
                                queryKey: ["users"],
                              });
                            } else {
                              setIsBanDialogOpen(true);
                            }
                          }}
                          size="sm"
                          variant="outline"
                        >
                          {isLoading === `ban-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.banned ? (
                            "Unban"
                          ) : (
                            "Ban"
                          )}
                        </Button>
                        {user.role === UserRole.ORGANIZATION && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                              >
                                <DotsHorizontalIcon className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[16rem]"
                            >
                              <span className="text-gray-500 pl-3">Change Status</span>
                              <hr />
                              <DropdownMenuItem
                                onClick={async () => {
                                  await updateStatusAction(
                                    user.id,
                                    UserStatus.ACTIVE,
                                  );
                                  toast.success(
                                    "User status updated to ACTIVE",
                                  );
                                }}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  await updateStatusAction(
                                    user.id,
                                    UserStatus.PENDING,
                                  );
                                  toast.success(
                                    "User status updated to pending",
                                  );
                                }}
                              >
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  await updateStatusAction(
                                    user.id,
                                    UserStatus.REJECTED,
                                  );
                                  toast.success(
                                    "User status updated to REJECTED",
                                  );
                                }}
                              >
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* <DataTable columns={columns as any} data={users || []} /> */}
    </div>
  );
}
