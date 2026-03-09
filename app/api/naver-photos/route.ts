import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/graphql";

const PHOTO_QUERY = `query getPhotoViewerItems($input: PhotoViewerInput) {
  photoViewer(input: $input) {
    photos {
      originalUrl
      __typename
    }
    __typename
  }
}`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId || !/^\d+$/.test(businessId)) {
    return NextResponse.json({ error: "Invalid businessId" }, { status: 400 });
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://pcmap.place.naver.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      body: JSON.stringify([
        {
          operationName: "getPhotoViewerItems",
          variables: {
            input: {
              businessId,
              businessType: "restaurant",
              cursors: [
                { id: "biz" },
                { id: "clip" },
                { id: "cp0" },
                { id: "aiView" },
                { id: "visitorReview" },
                { id: "imgSas" },
                { id: "cp" },
              ],
              excludeAuthorIds: [],
              excludeSection: [],
              excludeClipIds: [],
              dateRange: "",
              filter: "업체",
            },
          },
          query: PHOTO_QUERY,
        },
      ]),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const photos: string[] = (data[0]?.data?.photoViewer?.photos ?? [])
      .map((p: { originalUrl: string }) => p.originalUrl)
      .filter(Boolean);

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Naver photos fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
