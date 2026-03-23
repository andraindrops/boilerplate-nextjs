"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import * as storageClient from "@/lib/storage/client";
import { cn } from "@/lib/utils";

import * as exampleSchema from "@/schemas/domain/example";

import * as exampleAction from "@/actions/domain/example";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@/components/ui/_index";

import { ImageUploader } from "@/components/shared/imageUploader";

export default function Component({
  workspaceId,
  example,
  className,
  ...props
}: {
  workspaceId: string;
  example: exampleSchema.entitySchema;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();

  const [pendingInternalImageFile, setPendingInternalImageFile] =
    useState<File | null>(null);
  const [pendingExternalImageFile, setPendingExternalImageFile] =
    useState<File | null>(null);

  const handleRemove = async () => {
    if (example?.id == null) return;

    const result = await exampleAction.remove({
      id: example.id,
    });

    console.log("Example removed:", result);

    toast.success("Removed");

    router.push(`/workspaces/${workspaceId}/examples`);
  };

  const handleSubmit = async ({
    data,
  }: {
    data: exampleSchema.updateSchema;
  }) => {
    if (pendingInternalImageFile != null) {
      data.internalImageKey = await storageClient.uploadImage({
        workspaceId,
        file: pendingInternalImageFile,
        prefix: "example-internal",
      });

      setPendingInternalImageFile(null);
    }

    if (pendingExternalImageFile != null) {
      data.externalImageKey = await storageClient.uploadImage({
        workspaceId,
        file: pendingExternalImageFile,
        prefix: "example-external",
      });

      setPendingExternalImageFile(null);
    }

    const result = await exampleAction.update({
      id: example.id,
      data: {
        name: data.name,
        internalImageKey: data.internalImageKey,
        externalImageKey: data.externalImageKey,
      },
    });

    console.log("Example updated:", result);

    toast.success("Updated");

    router.refresh();
  };

  const form = useForm<exampleSchema.updateSchema>({
    resolver: zodResolver(exampleSchema.updateZodSchema),
    defaultValues: {
      name: example?.name ?? "",
      internalImageKey: example?.internalImageKey ?? null,
      externalImageKey: example?.externalImageKey ?? null,
    },
  });

  const handleInternalImageChange = ({ file }: { file: File | null }) => {
    setPendingInternalImageFile(file);
  };

  const handleInternalImageDelete = () => {
    form.setValue("internalImageKey", null);
    setPendingInternalImageFile(null);
  };

  const handleExternalImageChange = ({ file }: { file: File | null }) => {
    setPendingExternalImageFile(file);
  };

  const handleExternalImageDelete = () => {
    form.setValue("externalImageKey", null);
    setPendingExternalImageFile(null);
  };

  return (
    <div className={cn(className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            await handleSubmit({
              data,
            });
          })}
          className="space-y-2"
          data-testid="example-form"
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
                    data-testid="example-name-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ImageUploader
            imageUrl={example.internalImageUrl ?? null}
            size="full"
            onFileChange={handleInternalImageChange}
            onDelete={handleInternalImageDelete}
          />
          <ImageUploader
            imageUrl={example.externalImageUrl ?? null}
            size="full"
            onFileChange={handleExternalImageChange}
            onDelete={handleExternalImageDelete}
          />
          <Button
            type="submit"
            className="w-full"
            data-testid="example-submit-button"
          >
            Submit
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={handleRemove}
            data-testid="example-remove-button"
          >
            Remove
          </Button>
        </form>
      </Form>
    </div>
  );
}
