"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { CrossIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CalendarDatePicker } from "./calender-date-picker";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { UserRole, UserStatus } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icons } from "@/components/shared/icons";
import { admin } from "@/lib/auth-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  link?: string;
  isLoading?: string | undefined;
  setIsLoading?: any;
}

export function DataTableToolbar<TData>({
  table,
  link,
  isLoading,
  setIsLoading,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    // Filter table data based on selected date range
    table.getColumn("createdAt")?.setFilterValue([from, to]);
  };
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("create");
    try {
      await admin.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role as UserRole,
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
  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={Object.values(UserStatus).map((type) => ({ name: type }))}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <CrossIcon className="ml-2 size-4" />
          </Button>
        )}
        <CalendarDatePicker
          date={dateRange}
          onDateSelect={handleDateSelect}
          className="h-8 w-[250px]"
          variant="outline"
        />
      </div>
      <div className="space-x-3 flex items-center">
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="size-4" /> Create User
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
                    {Object.values(UserRole).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
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
                  <>Create User</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
