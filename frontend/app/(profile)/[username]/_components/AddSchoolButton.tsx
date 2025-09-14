"use client";
import React from 'react';

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import EditSchoolDialog from "./EditSchoolDialog";

export default function AddSchoolButton() {
  const [showEditSchoolDialog, setShowEditSchoolDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setShowEditSchoolDialog(true)} size="sm">
        <PlusIcon className="mr-2 size-4" />
        Add School
      </Button>
      <EditSchoolDialog
        school={undefined}
        open={showEditSchoolDialog}
        onOpenChange={setShowEditSchoolDialog}
      />
    </>
  );
}