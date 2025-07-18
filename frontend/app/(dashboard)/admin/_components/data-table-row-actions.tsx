"use client";

import { useRouter } from "next/navigation";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // const task = taskSchema.parse(row.original);
  const router = useRouter();

  //delete hotel and image
  const handleDeleteListing = async (id: string, imageString: string) => {
    const getImageKey = (src: string) =>
      src.substring(src.lastIndexOf("/") + 1);
    try {
      const imageKey = getImageKey(imageString);
      // const res = await imgRemove(imageKey);
      // if (res.status === 401) {
      //   toast.success("image removed successfully");
      // }
      // await deleteBanner(id);
      // setIsHotelDeleting(false);
      toast.success("banner deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Error deleting product");
      // setIsHotelDeleting(false);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex size-8 p-0"
        >
          <DotsHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/banner/${row.getValue("id")}`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            handleDeleteListing(row.getValue("id"), row.getValue("imageString"))
          }
        >
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
