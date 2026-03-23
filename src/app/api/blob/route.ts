import { type NextRequest, NextResponse } from "next/server";

import { getStorageType } from "@/lib/storage/server";

import * as authService from "@/services/shared/auth";
import { AccessDeniedError } from "@/services/shared/scope";
import * as storageService from "@/services/shared/storage";
import { STORAGE_TYPES } from "@/services/shared/storage";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (key == null) {
    return new NextResponse(null, { status: 400 });
  }

  if (getStorageType({ storageTypes: STORAGE_TYPES, key }) !== "internal") {
    return new NextResponse(null, { status: 400 });
  }

  try {
    await authService.getTeamId();
  } catch {
    return new NextResponse(null, { status: 401 });
  }

  // key format: workspaces/${workspaceId}/${prefix}/${filename}
  const workspaceId = key.split("/")[1];

  if (workspaceId == null) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const ifNoneMatch = request.headers.get("if-none-match") ?? undefined;

    const result = await storageService.getBlob({
      workspaceId,
      key,
      ifNoneMatch,
    });

    if (result == null) {
      return new NextResponse(null, { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    if (result.statusCode !== 200) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Cache-Control": "private, no-cache",
        ETag: result.blob.etag,
      },
    });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return new NextResponse(null, { status: 403 });
    }

    console.error(`Failed to fetch blob: ${key}`, error);

    return new NextResponse(null, { status: 500 });
  }
}
