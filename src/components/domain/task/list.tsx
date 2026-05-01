"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import type * as taskSchema from "@/schemas/domain/task";

import * as taskAction from "@/actions/domain/task";

import { Button } from "@/components/ui/_index";

export default function Component({
  workspaceId,
  tasks,
  className,
  ...props
}: {
  workspaceId: string;
  tasks: taskSchema.entitySchema[];
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const handleCreate = async () => {
    await taskAction.create({
      data: {
        name: "Untitled",
        content: "Untitled content",
      },
    });
  };

  return (
    <div className={cn(className)} {...props}>
      <div className="space-y-8">
        <Button
          onClick={handleCreate}
          className="w-full"
          data-testid="task-create-button"
        >
          Create
        </Button>
        {tasks.length <= 0 ? (
          <div
            className="text-center text-muted-foreground"
            data-testid="task-empty-state"
          >
            Create one to get started.
          </div>
        ) : (
          <div className="space-y-4" data-testid="task-list">
            {tasks.map((task) => {
              return (
                <div key={task.id} data-testid="task-list-item">
                  <Link href={`/workspaces/${workspaceId}/tasks/${task.id}`}>
                    <div>{task.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {task.content}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
