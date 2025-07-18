"use client";

import { useRouter } from "next/navigation";
import { imageRemove } from "@/actions/image-remove";
import { deleteProduct } from "@/actions/product";
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

  //delete product and image
  const handleDeleteListing = async (id: string, images: string[]) => {
    const getImageKey = (src: string) =>
      src.substring(src.lastIndexOf("/") + 1);
    try {
      // Delete all associated images first
      for (const image of images) {
        const imageKey = getImageKey(image);
        const res = await imageRemove(imageKey);
        if (res.success) {
          toast.success(`Image ${imageKey} removed successfully`);
        }
      }

      // Delete the product after all images are removed
      await deleteProduct(id);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Error deleting product and associated images");
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
          onClick={() => router.push(`/admin/products/${row.getValue("id")}`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            handleDeleteListing(row.getValue("id"), row.getValue("images"))
          }
        >
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
