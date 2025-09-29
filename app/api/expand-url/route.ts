import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Follow the redirect to get the full URL
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    const expandedUrl = response.url;

    return NextResponse.json({ expandedUrl });
  } catch (error) {
    console.error("Error expanding URL:", error);
    return NextResponse.json(
      { error: "Failed to expand URL" },
      { status: 500 }
    );
  }
}