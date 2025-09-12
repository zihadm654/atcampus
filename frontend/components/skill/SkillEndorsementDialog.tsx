"use client";

import { useState } from "react";
import { UserSkillData } from "@/types/types";
import { useSkillEndorsements } from "./endorsement.mutations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface SkillEndorsementDialogProps {
  skill: UserSkillData;
}

export default function SkillEndorsementDialog({ skill }: SkillEndorsementDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: endorsements, isLoading } = useSkillEndorsements(skill.id);
  const endorsementCount = skill._count?.endorsements || 0;

  if (endorsementCount === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
          <ThumbsUp className="h-3 w-3" />
          {endorsementCount} {endorsementCount === 1 ? "endorsement" : "endorsements"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Endorsements for {skill.title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : endorsements?.length === 0 ? (
            <p className="text-center text-muted-foreground">No endorsements yet</p>
          ) : (
            <ul className="space-y-4">
              {endorsements?.map((endorsement) => (
                <li key={endorsement.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={endorsement.endorser.image || undefined} alt={endorsement.endorser.name || ""} />
                    <AvatarFallback>
                      {endorsement.endorser.name?.charAt(0) || endorsement.endorser.username?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{endorsement.endorser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{endorsement.endorser.username} · {formatDistanceToNow(new Date(endorsement.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}