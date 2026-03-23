"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BLANK = "__blank__";

export default function WorkspaceSelector({
  workspaces,
}: {
  workspaces: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const match = pathname.match(/^\/workspaces\/([^/]+)/);
  const currentWorkspaceId = match?.[1] ?? BLANK;

  const handleChange = (value: string) => {
    if (value === BLANK) {
      router.push("/");
    } else {
      router.push(`/workspaces/${value}/examples`);
    }
  };

  return (
    <Select value={currentWorkspaceId} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Workspace" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={BLANK}>-</SelectItem>
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            {workspace.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
