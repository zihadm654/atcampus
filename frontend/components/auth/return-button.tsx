import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ReturnButtonProps {
  href: string;
  label: string;
}

export const ReturnButton = ({ href, label }: ReturnButtonProps) => (
  <Button asChild size="sm">
    <Link href={href}>
      <ArrowLeftIcon /> <span>{label}</span>
    </Link>
  </Button>
);
