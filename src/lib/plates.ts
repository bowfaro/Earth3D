/**
 * Major Tectonic Plates & Associated Countries Mapping
 */

import { geoContains } from "d3-geo";
import { CountryData } from "@/components/tectonics/CountryInfo";

export interface MajorPlate {
  id: string;
  name: string;
  en: string;
  code: string;
  lat: number;
  lon: number;
  desc: string;
  color: string;
  keywords: string[];
}

export const MAJOR_PLATES: MajorPlate[] = [
  {
    id: "eurasian",
    name: "Mảng Âu - Á",
    en: "Eurasian Plate",
    code: "EU",
    lat: 48,
    lon: 80,
    desc: "Mảng lục địa khổng lồ bao gồm hầu hết châu Âu và châu Á, tiếp giáp nhiều đới hút chìm và va chạm phức tạp.",
    color: "#38bdf8",
    keywords: ["Âu - Á", "Á-Âu", "Âu-Á", "Eurasian", "Eurasia", "Anatolia", "Sunda", "Yangtze", "Amur"],
  },
  {
    id: "pacific",
    name: "Mảng Thái Bình Dương",
    en: "Pacific Plate",
    code: "PA",
    lat: 0,
    lon: -160,
    desc: "Mảng đại dương lớn nhất thế giới, viền quanh bởi Vành đai lửa với hàng trăm rãnh hút chìm và núi lửa hoạt động dữ dội.",
    color: "#06b6d4",
    keywords: ["Thái Bình Dương", "Pacific"],
  },
  {
    id: "north-american",
    name: "Mảng Bắc Mỹ",
    en: "North American Plate",
    code: "NA",
    lat: 48,
    lon: -100,
    desc: "Bao gồm phần lớn lục địa Bắc Mỹ, đảo Greenland, một phần biển Caribe và vùng đông bắc Siberia (Nga).",
    color: "#10b981",
    keywords: ["Bắc Mỹ", "North American", "Cocos"],
  },
  {
    id: "south-american",
    name: "Mảng Nam Mỹ",
    en: "South American Plate",
    code: "SA",
    lat: -18,
    lon: -60,
    desc: "Bao gồm lục địa Nam Mỹ và đáy Nam Đại Tây Dương, có bờ Tây va chạm dữ dội với mảng Nazca tạo dãy Andes.",
    color: "#f59e0b",
    keywords: ["Nam Mỹ", "South American"],
  },
  {
    id: "african",
    name: "Mảng Châu Phi",
    en: "African Plate",
    code: "AF",
    lat: 5,
    lon: 22,
    desc: "Bao gồm lục địa châu Phi và thung lũng tách giãn Đông Phi – nơi vỏ Trái Đất đang dần bị xé toạc để hình thành đại dương mới.",
    color: "#8b5cf6",
    keywords: ["Châu Phi", "Phi", "African"],
  },
  {
    id: "indo-australian",
    name: "Mảng Ấn - Úc",
    en: "Indo-Australian Plate",
    code: "IN",
    lat: -15,
    lon: 105,
    desc: "Hợp nhất từ mảng Ấn Độ và mảng Úc, đang dịch chuyển về phía bắc húc vào mảng Âu - Á tạo nên dãy núi Himalaya cao nhất thế giới.",
    color: "#ec4899",
    keywords: ["Ấn - Úc", "Ấn Độ", "Úc", "Indo-Australian", "Australia", "India"],
  },
  {
    id: "antarctic",
    name: "Mảng Nam Cực",
    en: "Antarctic Plate",
    code: "AN",
    lat: -78,
    lon: 0,
    desc: "Bao phủ toàn bộ lục địa băng giá Nam Cực và các cao nguyên ngầm ở vùng biển Nam Cực, bao quanh bởi các sống núi tách giãn.",
    color: "#94a3b8",
    keywords: ["Nam Cực", "Antarctic"],
  },
  {
    id: "nazca",
    name: "Mảng Nazca",
    en: "Nazca Plate",
    code: "NZ",
    lat: -18,
    lon: -95,
    desc: "Mảng đại dương ở đông nam Thái Bình Dương, đang chìm dưới mảng Nam Mỹ với tốc độ ~7-8 cm/năm sinh ra nhiều động đất mạnh.",
    color: "#f43f5e",
    keywords: ["Nazca"],
  },
  {
    id: "philippine",
    name: "Mảng Philippine",
    en: "Philippine Plate",
    code: "PS",
    lat: 18,
    lon: 132,
    desc: "Mảng đại dương rất hoạt động, bao bọc bởi các rãnh vực sâu nhất hành tinh như rãnh Mariana và rãnh Philippines.",
    color: "#eab308",
    keywords: ["Philippine"],
  },
  {
    id: "arabian",
    name: "Mảng Ả Rập",
    en: "Arabian Plate",
    code: "AR",
    lat: 24,
    lon: 45,
    desc: "Mảng lục địa cổ gồm bán đảo Ả Rập, dịch chuyển về phía bắc va chạm vào mảng Âu - Á gây biến dạng và động đất ở Thổ Nhĩ Kỳ và Iran.",
    color: "#a855f7",
    keywords: ["Ả Rập", "Arabian", "Anatolia"],
  },
];

// Mapping PB2002 micro-plate and regional codes to major plate identifiers
const CODE_TO_MAJOR: Record<string, string> = {
  EU: "eurasian",
  SU: "eurasian",
  YA: "eurasian",
  AM: "eurasian",
  ON: "eurasian",
  AS: "eurasian",
  BU: "eurasian",
  PA: "pacific",
  SB: "pacific",
  NB: "pacific",
  SS: "pacific",
  NH: "pacific",
  TO: "pacific",
  KE: "pacific",
  NI: "pacific",
  WL: "pacific",
  MN: "pacific",
  CR: "pacific",
  BR: "pacific",
  FT: "pacific",
  BH: "pacific",
  NA: "north-american",
  OK: "north-american",
  CA: "north-american",
  CO: "north-american",
  JF: "north-american",
  RI: "north-american",
  PM: "north-american",
  SA: "south-american",
  AP: "south-american",
  ND: "south-american",
  AF: "african",
  SO: "african",
  IN: "indo-australian",
  AU: "indo-australian",
  TI: "indo-australian",
  MO: "indo-australian",
  AN: "antarctic",
  SL: "antarctic",
  SW: "antarctic",
  SC: "antarctic",
  NZ: "nazca",
  EA: "nazca",
  JZ: "nazca",
  GP: "nazca",
  PS: "philippine",
  CL: "philippine",
  MA: "philippine",
  AR: "arabian",
  AT: "arabian",
};

/**
 * Filter countries that belong to or border a given major tectonic plate
 */
export function getCountriesForPlate(
  plate: MajorPlate,
  countries: CountryData[]
): CountryData[] {
  return countries.filter((c) => {
    const text = c.plate.toLowerCase();
    return plate.keywords.some((kw) => {
      const k = kw.toLowerCase();
      if (k === "phi") {
        // Exclude 'philippine'
        return /(?<!philip)phi(?!lippine)/i.test(text);
      }
      return text.includes(k);
    });
  });
}

interface GeoJsonFeatureLike {
  properties?: {
    Code?: string;
    PlateName?: string;
  };
  geometry?: unknown;
}

interface PlatesGeoJsonLike {
  type?: string;
  features?: GeoJsonFeatureLike[];
}

/**
 * Determine which major plate contains a given latitude/longitude point
 */
export function findPlateByCoordinates(
  lat: number,
  lon: number,
  platesGeoJson?: PlatesGeoJsonLike | null
): MajorPlate | null {
  // 1. Point-in-polygon test using PB2002 plate polygons if available
  if (platesGeoJson?.features) {
    const pt: [number, number] = [lon, lat];
    for (const f of platesGeoJson.features) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (geoContains(f as any, pt)) {
          const code = f.properties?.Code;
          const majorId = code ? CODE_TO_MAJOR[code] : null;
          if (majorId) {
            const found = MAJOR_PLATES.find((p) => p.id === majorId);
            if (found) return found;
          }
        }
      } catch {
        // continue search
      }
    }
  }

  // 2. Fallback: find nearest major plate by great-circle distance
  let bestPlate: MajorPlate | null = null;
  let minDistance = Infinity;

  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  for (const plate of MAJOR_PLATES) {
    const pLatRad = plate.lat * (Math.PI / 180);
    const pLonRad = plate.lon * (Math.PI / 180);

    const dLat = pLatRad - latRad;
    const dLon = pLonRad - lonRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latRad) *
        Math.cos(pLatRad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (dist < minDistance) {
      minDistance = dist;
      bestPlate = plate;
    }
  }

  return bestPlate;
}
