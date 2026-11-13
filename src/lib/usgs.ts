/**
 * USGS Earthquake Feed Fetcher and Normalizer
 * Nguồn dữ liệu: USGS Earthquake Hazards Program
 */

export interface Earthquake {
  id: string;
  lat: number;
  lon: number;
  depthKm: number;
  mag: number;
  time: number;
  place: string;
  tsunami: number;
  depthCategory: "shallow" | "intermediate" | "deep";
  depthCategoryVi: string;
}

export interface EarthquakeFeedResult {
  earthquakes: Earthquake[];
  count: number;
  isFallback: boolean;
  feedUrl: string;
  error?: string;
}

export type FeedPeriod = "day" | "week" | "month";
export type FeedMagnitude = "all" | "2.5" | "4.5";

export function getDepthCategory(depthKm: number): {
  category: "shallow" | "intermediate" | "deep";
  labelVi: string;
} {
  if (depthKm <= 70) {
    return { category: "shallow", labelVi: "Nông (0 - 70 km)" };
  }
  if (depthKm <= 300) {
    return { category: "intermediate", labelVi: "Trung bình (70 - 300 km)" };
  }
  return { category: "deep", labelVi: "Sâu (> 300 km)" };
}

export async function fetchUSGSEarthquakes(
  period: FeedPeriod = "week",
  minMag: FeedMagnitude = "4.5"
): Promise<EarthquakeFeedResult> {
  const feedUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMag}_${period}.geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(feedUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`USGS HTTP ${res.status}: ${res.statusText}`);
    }

    const geojson = await res.json();
    const earthquakes = parseGeoJson(geojson);

    return {
      earthquakes,
      count: earthquakes.length,
      isFallback: false,
      feedUrl,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi kết nối USGS API";
    console.warn("USGS feed fetch failed, falling back to local snapshot:", errorMsg);

    // Fallback to local snapshot
    try {
      const fallbackRes = await fetch("/data/usgs-snapshot-4.5_week.json");
      if (!fallbackRes.ok) throw new Error("Không thể nạp bản snapshot dự phòng");
      const fallbackGeoJson = await fallbackRes.json();
      const fallbackQuakes = parseGeoJson(fallbackGeoJson);

      return {
        earthquakes: fallbackQuakes,
        count: fallbackQuakes.length,
        isFallback: true,
        feedUrl,
        error: `Không thể kết nối đến máy chủ USGS (${errorMsg}). Đang hiển thị bản dữ liệu mẫu (snapshot).`,
      };
    } catch (fallbackErr: unknown) {
      const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : "Lỗi không xác định";
      return {
        earthquakes: [],
        count: 0,
        isFallback: true,
        feedUrl,
        error: `Lỗi nạp dữ liệu: ${fbMsg}`,
      };
    }
  }
}

interface GeoJsonFeature {
  id?: string;
  geometry?: {
    coordinates?: [number, number, number];
  };
  properties?: {
    mag?: number;
    place?: string;
    time?: number;
    tsunami?: number;
  };
}

interface RawGeoJson {
  features?: GeoJsonFeature[];
}

function parseGeoJson(geojson: RawGeoJson): Earthquake[] {
  if (!geojson || !Array.isArray(geojson.features)) return [];

  const results: Earthquake[] = [];

  for (const f of geojson.features) {
    const coords = f.geometry?.coordinates;
    const props = f.properties;
    if (!coords || coords.length < 2 || !props) continue;

    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    const depthKm = coords.length > 2 ? Math.max(0, Number(coords[2])) : 10;
    const mag = Number(props.mag ?? 0);
    const time = Number(props.time ?? Date.now());
    const place = props.place || "Không xác định";
    const tsunami = Number(props.tsunami ?? 0);

    const { category, labelVi } = getDepthCategory(depthKm);

    results.push({
      id: f.id || `${lat}_${lon}_${time}`,
      lat,
      lon,
      depthKm,
      mag,
      time,
      place,
      tsunami,
      depthCategory: category,
      depthCategoryVi: labelVi,
    });
  }

  return results;
}
