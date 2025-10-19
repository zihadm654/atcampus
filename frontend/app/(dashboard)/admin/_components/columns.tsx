"use client";

import type { User, UserRole } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/dashboard/data-table/column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserRoleSelect } from "@/components/user-role-select";
import { admin } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate font-medium capitalize">
        {row.getValue("id")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2 truncate font-medium">
        <span className="max-w-[500px] truncate font-medium capitalize">
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-48 space-x-2 truncate font-medium">
        <span className="truncate font-medium capitalize">
          {row.getValue("status")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-48 space-x-2 truncate font-medium">
        <span className="truncate font-medium capitalize">
          {row.getValue("phone")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "banned",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banned" />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-48 space-x-2 truncate font-medium">
        <span className="truncate font-medium capitalize">
          <Badge variant={row.getValue("banned") ? "destructive" : "outline"}>
            {row.getValue("banned") ? "Yes" : "No"}
          </Badge>
        </span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-48 space-x-2 truncate font-medium">
        <span className="truncate font-medium capitalize">
          <UserRoleSelect
            role={row.getValue("role") as UserRole}
            userId={row.getValue("id")}
          />
        </span>
      </div>
    ),
  },
  {
    accessorKey: "ban",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ban" />
    ),
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
      const [banForm, setBanForm] = useState({
        userId: "",
        reason: "",
        expirationDate: undefined as Date | undefined,
      });

      const handleBanUser = async (e: React.FormEvent) => {
        e.preventDefault();
        // setIsLoading(`ban-${banForm.userId}`);
        try {
          if (!banForm.expirationDate) {
            throw new Error("Expiration date is required");
          }
          await admin.banUser({
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
          // setIsLoading(undefined);
        }
      };
      return (
        <div className="flex max-w-48 space-x-2 truncate font-medium">
          <span className="truncate font-medium capitalize">
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
                            !banForm.expirationDate && "text-muted-foreground"
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
                    // disabled={isLoading === `ban-${banForm.userId}`}
                    type="submit"
                  >
                    Ban User
                    {/* {isLoading === `ban-${banForm.userId}` ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Banning...
                      </>
                    ) : (
                      "Ban User"
                    )} */}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              // disabled={isLoading?.startsWith("ban")}
              onClick={async () => {
                setBanForm({
                  userId: row.getValue("id"),
                  reason: "",
                  expirationDate: undefined,
                });
                if (row.getValue("banned")) {
                  // setIsLoading(`ban-${user.id}`);
                  await admin.unbanUser(
                    {
                      userId: row.getValue("id"),
                    },
                    {
                      onError(context) {
                        toast.error(
                          context.error.message || "Failed to unban user"
                        );
                        // setIsLoading(undefined);
                      },
                      onSuccess() {
                        queryClient.invalidateQueries({
                          queryKey: ["users"],
                        });
                        toast.success("User unbanned successfully");
                      },
                    }
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
              {/* {isLoading === `ban-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.banned ? (
                              "Unban"
                            ) : (
                              "Ban"
                            )} 
                             */}
              {row.getValue("banned") ? "Unban" : "Ban"}
            </Button>
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formattedDate = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return (
        <div className="flex w-[100px] items-center">
          <span className="capitalize">{formattedDate}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id));
      const [startDate, endDate] = value;
      return rowDate >= startDate && rowDate <= endDate;
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
