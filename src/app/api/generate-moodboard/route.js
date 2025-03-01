import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { Vibrant } from "node-vibrant/node";
import tinycolor from "tinycolor2";

export async function POST(request) {
  let vibe;
  try {
    const body = await request.json();
    vibe = body.vibe;
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!vibe || typeof vibe !== "string") {
    return NextResponse.json({ error: "Vibe is required and must be a string" }, { status: 400 });
  }

  try {
    const unsplashApiKey = process.env.UNSPLASH_API_KEY || "mVil4AQm6bfPZuGlQGkSol_MZvvZ0lLYI4sajzP_k3M";
    // If vibe is a hex color (e.g., #FF6F61), use it as a color query; otherwise, use as text
    const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(vibe);
    const query = isHexColor ? `color:${vibe.slice(1)}` : vibe; // Remove # for Unsplash color query
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=8&client_id=${unsplashApiKey}`;

    const unsplashRes = await fetch(unsplashUrl);
    if (!unsplashRes.ok) {
      const text = await unsplashRes.text();
      throw new Error(`Unsplash API failed with status ${unsplashRes.status}: ${text.slice(0, 100)}`);
    }

    const unsplashData = await unsplashRes.json();
    if (!unsplashData.results || unsplashData.results.length === 0) {
      return NextResponse.json({ error: "No images found for this vibe" }, { status: 404 });
    }
    const images = unsplashData.results.map((result) => result.urls.small);

    let colors;
    try {
      const palette = await Vibrant.from(images[0]).getPalette();
      const baseColors = [
        palette.Vibrant?.hex || "#FF6F61",
        palette.Muted?.hex || "#6B5B95",
        palette.DarkVibrant?.hex || "#88B04B",
        palette.LightVibrant?.hex || "#F7CAC9",
        palette.DarkMuted?.hex || "#92A8D1",
        palette.LightMuted?.hex || "#955251",
      ];
      const vibrantColor = tinycolor(palette.Vibrant?.hex || "#FF6F61");
      const mutedColor = tinycolor(palette.Muted?.hex || "#6B5B95");
      colors = [
        ...baseColors,
        vibrantColor.analogous()[1].toHexString(),
        mutedColor.complement().toHexString(),
      ].slice(0, 8);
    } catch (vibrantError) {
      console.error("Vibrant Error:", vibrantError.message);
      colors = [
        "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9",
        "#92A8D1", "#955251", "#B565A7", "#009B77",
      ];
    }

    return NextResponse.json({ images, colors }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error.message);
    return NextResponse.json({ error: "Failed to generate mood board" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}