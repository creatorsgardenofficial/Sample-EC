import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "新規アカウントの作成は無効になっています" },
    { status: 403 }
  );
}
