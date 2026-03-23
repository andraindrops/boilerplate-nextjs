"use client";

import { OrganizationList } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

export default function Component({
  className,
  ...props
}: {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <OrganizationList hidePersonal={true} />
    </div>
  );
}
