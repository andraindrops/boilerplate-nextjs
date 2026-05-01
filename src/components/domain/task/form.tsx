"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import * as taskSchema from "@/schemas/domain/task";

import * as taskAction from "@/actions/domain/task";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@/components/ui/_index";

export default function Component({
  workspaceId,
  task,
  className,
  ...props
}: {
  workspaceId: string;
  task: taskSchema.entitySchema;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();

  const form = useForm<taskSchema.updateSchema>({
    resolver: zodResolver(taskSchema.updateZodSchema),
    defaultValues: {
      name: task?.name ?? "",
      content: task?.content ?? "",
    },
  });

  const handleRemove = async () => {
    if (task?.id == null) return;

    await taskAction.remove({ id: task.id });

    toast.success("Removed");
    router.push(`/workspaces/${workspaceId}/tasks`);
  };

  const handleSubmit = async ({ data }: { data: taskSchema.updateSchema }) => {
    await taskAction.update({
      id: task.id,
      data,
    });

    toast.success("Updated");
    router.refresh();
  };

  const handleRun = async () => {
    try {
      await taskAction.run({ id: task.id });
      toast.success("Ran");
    } catch {
      toast.error("Run failed");
    }
  };

  return (
    <div className={cn(className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            await handleSubmit({ data });
          })}
          className="space-y-2"
          data-testid="task-form"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full"
                    data-testid="task-name-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full"
                    data-testid="task-content-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            data-testid="task-submit-button"
          >
            Submit
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={handleRemove}
            data-testid="task-remove-button"
          >
            Remove
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={handleRun}
            data-testid="task-run-button"
          >
            Run
          </Button>
        </form>
      </Form>
    </div>
  );
}
