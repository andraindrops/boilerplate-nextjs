"use client";

import { Trash2 as RemoveIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Button, Input } from "@/components/ui/_index";

export function ImageUploader({
  imageUrl,
  onFileChange,
  onDelete,
  size = 512,
  className,
  children,
  testId,
  noImageText = "No Image",
  disabled = false,
}: {
  imageUrl: string | null;
  onFileChange?: ({ file }: { file: File | null }) => void;
  onDelete?: () => void;
  size?: number | "full" | "fill";
  className?: string;
  children?: React.ReactNode;
  testId?: string;
  noImageText?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const previewRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewRef.current != null) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreview();
  }, [revokePreview]);

  const handleSelect = ({ e }: { e: React.ChangeEvent<HTMLInputElement> }) => {
    const file = e.target.files?.[0];

    if (file == null) return;

    revokePreview();
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;

    setPreview(objectUrl);
    setDeleted(false);

    onFileChange?.({ file });
  };

  const handleDelete = ({ e }: { e: React.MouseEvent }) => {
    e.stopPropagation();

    revokePreview();
    setPreview(null);
    setDeleted(true);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onFileChange?.({ file: null });
    onDelete?.();
  };

  const displayUrl = deleted ? null : preview || imageUrl;

  const sizeStyle =
    size === "fill"
      ? { width: "100%", height: "100%" }
      : size === "full"
        ? { width: "100%", aspectRatio: "1 / 1" }
        : { width: size, height: size };

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg border", className)}
      style={sizeStyle}
      data-testid={testId}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: This is a file upload trigger area */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: This is a file upload trigger area */}
      <div
        className={cn(
          "relative h-full w-full",
          disabled ? "cursor-default" : "cursor-pointer",
        )}
        onClick={disabled ? undefined : () => inputRef.current?.click()}
        aria-disabled={disabled || undefined}
      >
        {displayUrl ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: Use img for external blob urls */}
            <img
              src={displayUrl}
              alt="Uploaded content"
              className="h-full w-full object-contain"
            />
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={(e) => handleDelete({ e })}
              >
                <RemoveIcon size={4} />
              </Button>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {noImageText}
          </div>
        )}
      </div>
      <Input
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
        className="hidden"
        ref={inputRef}
        onChange={(e) => handleSelect({ e })}
        disabled={disabled}
      />
      {children}
    </div>
  );
}
