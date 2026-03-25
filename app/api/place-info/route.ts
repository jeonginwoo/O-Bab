import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const url = `https://pcmap.place.naver.com/restaurant/${placeId}/home?from=map&fromPanelNum=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://map.naver.com/",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
      },
    });

    const html = await response.text();
    
    // Find window.__APOLLO_STATE__ JSON object
    const pattern = /window\.__APOLLO_STATE__\s*=\s*(\{.*?\});/;
    const match = html.match(pattern);

    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      const baseKey = Object.keys(data).find(k => k.startsWith("PlaceDetailBase"));
      
      if (baseKey) {
        const baseInfo = data[baseKey];
        return NextResponse.json({
          name: baseInfo.name,
          category: baseInfo.category,
          address: baseInfo.roadAddress || baseInfo.address,
          phone: baseInfo.virtualPhone || baseInfo.phone,
          score: baseInfo.visitorReviewsScore,
          reviewsCount: baseInfo.visitorReviewsTotal,
          conveniences: baseInfo.conveniences || [],
          microReviews: baseInfo.microReviews || [],
        });
      }
    }
    
    return NextResponse.json({ error: "Data not found in HTML" }, { status: 404 });
  } catch (error) {
    console.error("Place Info API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
