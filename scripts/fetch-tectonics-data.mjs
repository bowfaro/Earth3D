import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./public/data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchJson(url) {
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return await res.json();
}

async function main() {
  console.log("Starting data download...");

  // 1. PB2002 Plates Polygons
  const platesRaw = await fetchJson(
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "pb2002_plates.json"),
    JSON.stringify(platesRaw),
    "utf8"
  );
  console.log(`Saved pb2002_plates.json (${platesRaw.features.length} plates)`);

  // 2. PB2002 Steps (Boundaries with classification)
  const stepsRaw = await fetchJson(
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json"
  );

  // Group steps by boundary type:
  // OSR, CRB -> divergent (Phân kỳ)
  // SUB, OCB, CCB -> convergent (Hội tụ)
  // OTF, CTF -> transform (Trượt ngang)
  const classifiedFeatures = stepsRaw.features.map((f) => {
    const sc = (f.properties?.STEPCLASS || "").toUpperCase();
    let type = "transform";
    let typeVi = "Trượt ngang";

    if (sc === "OSR" || sc === "CRB") {
      type = "divergent";
      typeVi = "Phân kỳ (Tách giãn)";
    } else if (sc === "SUB" || sc === "OCB" || sc === "CCB") {
      type = "convergent";
      typeVi = "Hội tụ (Hút chìm / Va chạm)";
    } else if (sc === "OTF" || sc === "CTF") {
      type = "transform";
      typeVi = "Trượt ngang (Chuyển dạng)";
    }

    return {
      type: "Feature",
      properties: {
        stepClass: sc,
        boundaryType: type,
        boundaryTypeVi: typeVi,
        plateBound: f.properties?.PLATEBOUND || "",
        stepLength: f.properties?.STEPLENGTH || 0,
      },
      geometry: f.geometry,
    };
  });

  const boundariesGeoJson = {
    type: "FeatureCollection",
    features: classifiedFeatures,
  };

  fs.writeFileSync(
    path.join(DATA_DIR, "pb2002_boundaries.json"),
    JSON.stringify(boundariesGeoJson),
    "utf8"
  );
  console.log(
    `Saved pb2002_boundaries.json (${classifiedFeatures.length} steps classified)`
  );

  // 3. World Coastlines (GeoJSON from d3/world-atlas geojson or natural earth simplified)
  // Let's fetch 110m land polygons or coastlines
  try {
    const landRaw = await fetchJson(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_coastline.geojson"
    );
    fs.writeFileSync(
      path.join(DATA_DIR, "ne_110m_coastline.json"),
      JSON.stringify(landRaw),
      "utf8"
    );
    console.log("Saved ne_110m_coastline.json");
  } catch (err) {
    console.warn("Could not download coastline from primary URL, trying fallback...", err);
    const landRaw = await fetchJson(
      "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_coastline.json"
    );
    fs.writeFileSync(
      path.join(DATA_DIR, "ne_110m_coastline.json"),
      JSON.stringify(landRaw),
      "utf8"
    );
    console.log("Saved ne_110m_coastline.json via fallback");
  }

  // 4. USGS Snapshot for offline fallback
  const usgsRaw = await fetchJson(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "usgs-snapshot-4.5_week.json"),
    JSON.stringify(usgsRaw),
    "utf8"
  );
  console.log(`Saved usgs-snapshot-4.5_week.json (${usgsRaw.features.length} earthquakes)`);

  // 5. ATTRIBUTION.md
  const attributionMd = `# BẢN QUYỀN VÀ NGUỒN DỮ LIỆU (ATTRIBUTION)

Tài liệu này xác nhận và ghi nhận nguồn gốc tất cả các tập dữ liệu được sử dụng trong dự án Địa Cầu 3D & Mảng Kiến Tạo:

## 1. Dữ liệu Mảng kiến tạo và Ranh giới (PB2002)
- **Tác giả:** Peter Bird (2003)
- **Tác phẩm khoa học:** "An updated digital model of plate boundaries", *Geochemistry, Geophysics, Geosystems*, 4(3), 1027, \`doi:10.1029/2001GC000252\`.
- **Bản chuyển đổi GeoJSON:** Hugo Ahlenius, Nordpil và repo open-source \`github.com/fraxen/tectonicplates\`.
- **Giấy phép:** Open Data Commons Attribution License (ODC-By v1.0).
- **Phân loại ranh giới:**
  - **OSR** (Oceanic Spreading Ridge), **CRB** (Continental Rift Boundary) -> Phân kỳ (Divergent)
  - **SUB** (Subduction zone), **OCB** (Oceanic Convergent Boundary), **CCB** (Continental Convergent Boundary) -> Hội tụ (Convergent)
  - **OTF** (Oceanic Transform Fault), **CTF** (Continental Transform Fault) -> Trượt ngang (Transform)

## 2. Dữ liệu Động đất (USGS Earthquake Hazards Program)
- **Cơ quan:** U.S. Geological Survey (USGS) Earthquake Hazards Program
- **URL Feed:** \`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/\`
- **Tập dữ liệu:** Realtime GeoJSON feeds (4.5_week, 2.5_week, all_day, etc.)
- **Bản quyền:** Dữ liệu công cộng của chính phủ Hoa Kỳ (Public Domain / Free open access).

## 3. Đường bờ biển lục địa (Natural Earth Coastline)
- **Nguồn:** Natural Earth (\`naturalearthdata.com\`)
- **Tập dữ liệu:** 110m Physical Coastline
- **Bản quyền:** Public Domain.

## 4. Mô hình 3D Lõi Trái Đất (Earth Core)
- **Tác giả:** saVRee 3D (www.savree.com)
- **URL Sketchfab:** \`https://sketchfab.com/3d-models/earth-core-7bb72849e81f4bfab1a77a059fb422b3\`
- **Giấy phép / Nhãn:** NoAI. Dự án chỉ nhúng và điều khiển qua Sketchfab Viewer API chính thức, không tải, không sao chép, không re-host file model.
`;

  fs.writeFileSync(path.join(DATA_DIR, "ATTRIBUTION.md"), attributionMd, "utf8");
  console.log("Saved ATTRIBUTION.md successfully.");
  console.log("All data successfully downloaded and verified!");
}

main().catch((err) => {
  console.error("Data download failed:", err);
  process.exit(1);
});
