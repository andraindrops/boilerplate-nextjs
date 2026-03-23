import { type NextRequest, NextResponse } from "next/server";

import * as notificationService from "@/services/shared/notification";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(null, { status: 401 });
  }

  const result = await notificationService.run();

  return NextResponse.json(result);
}
