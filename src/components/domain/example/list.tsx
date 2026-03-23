"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import type * as exampleSchema from "@/schemas/domain/example.ts";

import * as exampleAction from "@/actions/domain/example";

import { Button } from "@/components/ui/_index";

export default function Component({
  workspaceId,
  examples,
  className,
  ...props
}: {
  workspaceId: string;
  examples: exampleSchema.entitySchema[];
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const handleCreate = async () => {
    await exampleAction.create({
      data: {
        name: "Untitled",
      },
    });
  };

  return (
    <div className={cn(className)} {...props}>
      <div className="space-y-8">
        <Button
          onClick={handleCreate}
          className="w-full"
          data-testid="example-create-button"
        >
          Create
        </Button>
        {examples.length <= 0 ? (
          <div
            className="text-center text-muted-foreground"
            data-testid="example-empty-state"
          >
            Create one to get started.
          </div>
        ) : (
          <div className="space-y-4" data-testid="example-list">
            {examples.map((example) => {
              return (
                <div key={example.id} data-testid="example-list-item">
                  <Link
                    href={`/workspaces/${workspaceId}/examples/${example.id}`}
                  >
                    <div>{example.name}</div>
                    <div className="mt-2 flex gap-2">
                      {example.internalImageUrl ? (
                        // biome-ignore lint/performance/noImgElement: Use img for internal
                        <img
                          src={example.internalImageUrl}
                          alt={`${example.name} internal`}
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : null}
                      {example.externalImageUrl ? (
                        // biome-ignore lint/performance/noImgElement: Use img for external
                        <img
                          src={example.externalImageUrl}
                          alt={`${example.name} external`}
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : null}
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
