# PLAN: Trang web khám phá cấu trúc 3D bên trong Trái Đất

> Tài liệu này dành cho AI coding agent. Đọc hết trước khi code. Làm tuần tự theo phase, hoàn thành checklist và acceptance criteria của phase trước rồi mới sang phase sau.

## 1. Mục tiêu

Xây một trang web một trang (landing/explorer) dành cho học sinh, gồm **hai chế độ xem 3D** (chuyển bằng tab):

1. **Bên trong Trái Đất**: mô hình 3D **Earth Core** (bản "nổ" của lõi Trái Đất), kèm thông tin từng lớp: vỏ, manti trên, manti dưới, lõi ngoài, lõi trong.
2. **Mảng kiến tạo & động đất**: quả địa cầu 3D thể hiện rõ các mảng kiến tạo, loại ranh giới giữa chúng và các trận động đất thực tế, để học sinh tự quan sát và hiểu **vì sao động đất xảy ra**.

Lưu ý: model Earth Core không có bề mặt, lục địa hay mảng kiến tạo, nên chế độ 2 là một viewer riêng, tự dựng bằng Three.js, không dùng model của saVRee.

## 2. Nguồn model (QUAN TRỌNG)

- Model: **Earth Core** bởi **saVRee**
- URL: https://sketchfab.com/3d-models/earth-core-7bb72849e81f4bfab1a77a059fb422b3
- UID: `7bb72849e81f4bfab1a77a059fb422b3`
- Khoảng 38k tam giác, 21.9k vertices. Model gắn nhãn **NoAI**.

Quy tắc bắt buộc:

1. **Không tải, không commit, không re-host** file model. Chỉ dùng **Sketchfab embed + Viewer API**.
2. Không đưa model vào dataset hoặc input của bất kỳ chương trình AI sinh nội dung nào (nhãn NoAI). Agent chỉ viết code điều khiển viewer, không "đọc" hay biến đổi model.
3. Luôn hiển thị credit trong footer: "Earth Core by saVRee on Sketchfab" kèm link gốc.
4. Nếu sau này cần self-host, phải kiểm tra license/nút Download trên Sketchfab trước và hỏi chủ dự án.

## 2b. Nguồn dữ liệu cho chế độ "Mảng kiến tạo & động đất"

| Dữ liệu                                         | Nguồn                                                                                                                                                                  | Giấy phép / credit                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Ranh giới và đa giác các mảng                   | PB2002 (Peter Bird, 2003), bản GeoJSON/shapefile của `github.com/fraxen/tectonicplates`                                                                                | Open Data Commons Attribution License. Credit: Hugo Ahlenius, Peter Bird, Nordpil (`doi:10.1029/2001GC000252`) |
| Loại ranh giới (phân kỳ / hội tụ / trượt ngang) | PB2002, file `steps` (mỗi đoạn có phân loại)                                                                                                                           | Như trên. Agent kiểm tra file thật có trường phân loại không (xem Phase 5)                                     |
| Động đất                                        | USGS Earthquake GeoJSON summary feed, ví dụ `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson` (cũng có `2.5_`, `all_`, và `_day`, `_month`) | Dữ liệu công khai, không cần API key. Credit "USGS Earthquake Hazards Program"                                 |
| Đường bờ biển (để học sinh định vị)             | Natural Earth (ví dụ qua gói `world-atlas`)                                                                                                                            | Agent xác nhận lại giấy phép trước khi dùng                                                                    |

Quy tắc:

- Tải dữ liệu mảng về lưu trong `public/data/`, kèm file `ATTRIBUTION.md` ghi nguồn đầy đủ.
- Dữ liệu động đất lấy từ USGS khi chạy. Bắt buộc có trạng thái lỗi, và một bản snapshot nhỏ trong repo làm dự phòng khi mất mạng hoặc USGS lỗi.
- Không tự bịa tọa độ, độ sâu, độ lớn trận động đất.

## 3. Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Sketchfab Viewer API (script `https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js`, load ở client)
- Dữ liệu các lớp: file JSON tĩnh trong repo
- Deploy: Vercel

Cho chế độ "Mảng kiến tạo & động đất" được phép dùng thêm: `three`, `@react-three/fiber`, `@react-three/drei`, `d3-geo` (vẽ đa giác các mảng lên canvas làm texture). Chỉ load các thư viện này khi người dùng mở tab đó (dynamic import). Không thêm thư viện nặng khác (GSAP...) và hỏi trước khi thêm dependency mới ngoài danh sách này.

## 4. Cấu trúc thư mục đề xuất

```
src/
  app/
    layout.tsx
    page.tsx
  components/
    EarthViewer.tsx        # client component, nhúng iframe + Viewer API
    LayerPanel.tsx         # danh sách lớp, chọn lớp
    LayerCard.tsx          # thông tin chi tiết một lớp
    Credits.tsx            # credit saVRee, Bird/Nordpil, USGS
    ViewTabs.tsx           # chuyển giữa "Bên trong Trái Đất" và "Mảng & động đất"
    tectonics/
      PlateGlobe.tsx       # địa cầu R3F: texture mảng, đường ranh giới, điểm động đất
      BoundaryLayer.tsx    # đường ranh giới tô màu theo loại
      QuakeLayer.tsx       # InstancedMesh điểm động đất (kích thước theo độ lớn, màu theo độ sâu)
      ControlsPanel.tsx    # bật/tắt lớp, lọc độ lớn, độ sâu, khoảng thời gian
      BoundaryExplainer.tsx # giải thích cơ chế từng loại ranh giới (SVG/CSS)
      QuakeInfo.tsx        # thông tin một trận động đất khi bấm vào
      GuidedTour.tsx       # các câu hỏi quan sát cho học sinh
  data/
    layers.json            # dữ liệu các lớp
    boundary-types.json    # mô tả cơ chế từng loại ranh giới (tiếng Việt)
    guided-tour.json       # câu hỏi và gợi ý quan sát
  hooks/
    useSketchfab.ts        # khởi tạo client, expose api + trạng thái ready
  lib/
    sketchfab.ts           # hằng số UID, helper camera/node
    geo.ts                 # lon/lat -> vector 3D, vẽ GeoJSON lên canvas
    usgs.ts                # fetch + chuẩn hoá feed USGS (có fallback snapshot)
```

## 5. Dữ liệu các lớp (`layers.json`)

Mỗi lớp gồm: `id`, `name` (vi), `depthFromKm`, `depthToKm`, `state` (rắn/lỏng/dẻo), `temperatureC` (khoảng), `composition`, `description`, `nodeNames` (tên node trong model, điền sau Phase 1), `camera` (position + target).

Giá trị tham khảo ban đầu (**phải đối chiếu USGS/NASA trước khi chốt**):

| Lớp        | Độ sâu (km)                              | Trạng thái |
| ---------- | ---------------------------------------- | ---------- |
| Vỏ         | 0 – ~35 (trung bình, thay đổi theo vùng) | Rắn        |
| Manti trên | ~35 – 660                                | Rắn, dẻo   |
| Manti dưới | 660 – 2.890                              | Rắn        |
| Lõi ngoài  | 2.890 – 5.150                            | Lỏng       |
| Lõi trong  | 5.150 – 6.371                            | Rắn        |

Không bịa số liệu. Chỗ nào không chắc, ghi khoảng giá trị và nguồn.

Liên hệ với chế độ 2: các mảng kiến tạo là những mảnh **thạch quyển** (vỏ cùng phần trên cùng của manti trên) trôi chậm trên lớp mềm hơn bên dưới. Thẻ thông tin của lớp "Vỏ" và "Manti trên" nên có đường dẫn sang tab "Mảng kiến tạo & động đất".

## 6. Các phase

### Phase 1: Khảo sát model

- [ ] Tạo trang thử nghiệm nhúng viewer với UID ở trên.
- [ ] Sau sự kiện `viewerready`, gọi `api.getNodeList` / `getNodeMap` và log ra danh sách node.
- [ ] Ghi lại tên node tương ứng từng lớp vào `layers.json`.
- [ ] Kết luận: model có tách được từng lớp thành node riêng không?

**Acceptance:** có file ghi chú (hoặc comment trong `lib/sketchfab.ts`) liệt kê node và kết luận. Nếu KHÔNG tách được lớp, dừng lại báo chủ dự án để chọn: chỉ dùng camera + annotation, hay chuyển sang tự dựng bằng Three.js.

### Phase 2: Khung dự án

- [ ] Khởi tạo Next.js + TypeScript + Tailwind, cấu hình ESLint.
- [ ] Layout cơ bản: header, vùng viewer, panel thông tin, footer.
- [ ] Thiết lập design tokens (màu, font) trong Tailwind config. Ưu tiên nền tối để model nổi bật.

**Acceptance:** `npm run dev` chạy được, trang hiển thị khung rỗng đúng bố cục, responsive từ 360px.

### Phase 3: Tích hợp viewer

- [ ] `EarthViewer.tsx` là client component (`"use client"`).
- [ ] Load script Sketchfab một lần, khởi tạo bằng `new Sketchfab(iframe)` và `client.init(UID, {...})`.
- [ ] Tuỳ chọn init gợi ý: `autostart: 1`, `ui_infos: 0`, `ui_watermark: 0` nếu được phép, `ui_controls: 1`.
- [ ] Hiển thị loading state và error state (có ảnh/placeholder dự phòng khi viewer lỗi).
- [ ] Lazy load: chỉ khởi tạo viewer khi vùng viewer vào viewport hoặc khi bấm "Tải mô hình" (ưu tiên mobile).
- [ ] Cleanup khi unmount.

**Acceptance:** model hiện và xoay được trên desktop và mobile, không lỗi console, không load script hai lần.

### Phase 4: Tương tác theo lớp

- [ ] `LayerPanel` liệt kê các lớp theo thứ tự độ sâu.
- [ ] Chọn lớp thì gọi `api.setCameraLookAt(position, target, duration)` bay tới lớp đó.
- [ ] Nếu Phase 1 cho phép: ẩn/mờ các lớp khác bằng `api.hide/show(nodeId)`.
- [ ] Nút "Xem toàn bộ" đưa camera và các node về trạng thái mặc định.
- [ ] `LayerCard` hiển thị thông tin lớp đang chọn, cập nhật khi đổi lớp.
- [ ] (Tuỳ chọn) Annotation trên model qua `api.createAnnotation` hoặc dùng annotation có sẵn.

**Acceptance:** chọn từng lớp trong panel, camera và thẻ thông tin đổi tương ứng, không giật, nút reset hoạt động.

### Phase 5: Mảng kiến tạo và động đất (chế độ 2)

Mục tiêu sư phạm: học sinh **nhìn thấy** động đất tập trung dọc ranh giới các mảng, rồi **hiểu** cơ chế tạo ra chúng.

**5a. Kiểm tra dữ liệu**

- [ ] Tải GeoJSON ranh giới và đa giác mảng (PB2002) vào `public/data/`, tạo `ATTRIBUTION.md`.
- [ ] Kiểm tra file ranh giới có trường loại (phân kỳ / hội tụ / trượt ngang) hay không. Nếu chỉ có tên cặp mảng, dùng dữ liệu `steps` của PB2002 để phân loại; nếu vẫn thiếu, **dừng và báo chủ dự án**, không tự đoán loại cho từng ranh giới.
- [ ] Viết `usgs.ts`: fetch feed, chuẩn hoá về `{ id, lat, lon, depthKm, mag, time, place, tsunami }`, xử lý lỗi, có snapshot dự phòng.

**5b. Địa cầu 3D**

- [ ] `PlateGlobe`: địa cầu xoay và zoom được. Dùng `d3-geo` vẽ đa giác các mảng (mỗi mảng một màu dễ phân biệt) lên canvas dạng equirectangular rồi dùng làm texture cho hình cầu. Chồng thêm đường bờ biển để học sinh định vị lục địa.
- [ ] Hiện tên mảng (Thái Bình Dương, Âu-Á, Bắc Mỹ, Nam Mỹ, Phi, Ấn-Úc, Nam Cực và các mảng nhỏ) dạng nhãn bật/tắt được. Nhãn luôn quay về phía người xem, không bị che.
- [ ] `BoundaryLayer`: vẽ ranh giới thành đường nổi trên mặt cầu, **màu theo loại** kèm chú giải:
  - Phân kỳ (hai mảng tách ra, ví dụ sống núi giữa đại dương)
  - Hội tụ (hai mảng tiến lại gần: hút chìm hoặc va chạm)
  - Trượt ngang / chuyển dạng (hai mảng trượt ngang qua nhau)
- [ ] Không chỉ dựa vào màu: mỗi loại có thêm kiểu nét hoặc ký hiệu khác nhau trong chú giải (hỗ trợ học sinh mù màu).

**5c. Động đất**

- [ ] `QuakeLayer`: dùng `InstancedMesh`. Kích thước điểm theo độ lớn, **màu theo độ sâu** (nông, trung bình, sâu). Chú giải ghi rõ ngưỡng đang dùng.
- [ ] Mặc định tải `4.5_week` để giữ số điểm vừa phải. Cho chọn khoảng thời gian (ngày / tuần / tháng) và độ lớn tối thiểu. Giới hạn khoảng 2.000 điểm trên mobile, vượt thì báo và gợi ý tăng ngưỡng độ lớn.
- [ ] Bấm vào một điểm: `QuakeInfo` hiển thị độ lớn, độ sâu, vị trí, thời gian, cờ sóng thần (nếu có trong dữ liệu) và câu hỏi gợi mở: "Điểm này nằm gần loại ranh giới nào?".
- [ ] Nút "Ẩn/hiện động đất" và "Chỉ hiện ranh giới" để học sinh tự so sánh vị trí động đất với ranh giới mảng.

**5d. Giải thích nguyên nhân**

- [ ] `BoundaryExplainer`: khi bấm một đoạn ranh giới (hoặc chọn loại trong chú giải), hiện sơ đồ 2D động bằng SVG/CSS và giải thích ngắn bằng tiếng Việt:
  - Phân kỳ: mảng tách ra, vật chất từ manti trồi lên, đá nứt gãy gây động đất nông.
  - Hội tụ: mảng nặng hơn hút chìm xuống dưới mảng kia (hoặc hai mảng va chạm), ma sát lớn, động đất xảy ra ở nhiều độ sâu.
  - Trượt ngang: hai mảng trượt qua nhau, bị kẹt rồi giật.
- [ ] Một phần giải thích chung về cơ chế: các mảng luôn chuyển động rất chậm (cỡ vài cm mỗi năm), tại chỗ bị kẹt thì ứng suất tích tụ dần, đến khi vượt sức chịu của đá thì đứt gãy và giải phóng năng lượng đột ngột dưới dạng sóng địa chấn (động đất). Ghi rõ đây là mô hình đàn hồi giản lược cho học sinh.
- [ ] Giải thích vì sao động đất sâu thường nằm dọc vùng hút chìm: mảng chìm xuống kéo theo các trận động đất ở độ sâu tăng dần. (Tuỳ chọn: lát cắt 2D dọc một vùng hút chìm, vẽ các điểm động đất theo độ sâu từ dữ liệu thật.)
- [ ] Nút liên kết ngược sang tab "Bên trong Trái Đất": "Mảng kiến tạo nằm ở lớp nào của Trái Đất?" (thạch quyển, xem mục 5).

**5e. Hoạt động cho học sinh (`GuidedTour`)**

- [ ] 4 đến 6 nhiệm vụ quan sát ngắn, mỗi nhiệm vụ có gợi ý và đáp án hiện sau khi học sinh thử:
  1. Bật động đất, tắt ranh giới. Các điểm có phân bố đều không?
  2. Bật ranh giới. Động đất tập trung ở đâu? (vành đai quanh Thái Bình Dương, thường gọi là "Vòng đai lửa")
  3. So sánh màu độ sâu giữa vùng hội tụ và vùng phân kỳ. Có khác nhau không?
  4. Tìm một vùng có ranh giới trượt ngang và nhận xét độ sâu động đất ở đó.
  5. Tìm Việt Nam trên địa cầu: nằm gần hay xa ranh giới mảng? Nhận xét mật độ động đất mạnh so với các khu vực khác. (Agent chỉ viết nhận xét dựa trên dữ liệu đang hiển thị, kiểm tra số liệu trước khi khẳng định.)
- [ ] Nội dung nhiệm vụ nằm trong `guided-tour.json`, không hard-code trong component.

**Acceptance:**

- Địa cầu xoay mượt ở 60fps trên máy thường và không giật rõ trên điện thoại tầm trung với ≤ 2.000 điểm.
- Bật động đất + ranh giới thì thấy rõ động đất dọc theo ranh giới (kiểm tra bằng mắt, vùng quanh Thái Bình Dương).
- Cả 3 loại ranh giới có màu, kiểu nét, chú giải và sơ đồ giải thích riêng.
- Khi USGS lỗi hoặc mất mạng, trang vẫn chạy bằng snapshot và có thông báo rõ cho người dùng.
- Credit PB2002/Nordpil và USGS hiển thị ở footer và trong panel dữ liệu.
- Mọi khẳng định khoa học trong giải thích có nguồn (ghi trong `boundary-types.json` hoặc `ATTRIBUTION.md`).

### Phase 6: Nội dung và phần phụ

- [ ] Hoàn thiện `layers.json` với số liệu đã đối chiếu nguồn.
- [ ] Biểu đồ/hiển thị so sánh độ dày các lớp bằng CSS hoặc SVG thuần.
- [ ] (Tuỳ chọn) Quiz 3 đến 5 câu cuối trang.
- [ ] Footer có credit đúng quy định ở mục 2.

**Acceptance:** mọi lớp có đủ trường dữ liệu, không còn placeholder, credit (saVRee, Bird/Nordpil, USGS) hiển thị và link hoạt động.

### Phase 7: Hoàn thiện và deploy

- [ ] Responsive, đã kiểm tra 360px, 768px, 1280px.
- [ ] A11y: tương tác bàn phím với panel, `aria-label`, tương phản màu, `iframe title`.
- [ ] SEO: title, description, Open Graph.
- [ ] Hiệu năng: kiểm tra Lighthouse, tránh layout shift quanh viewer (đặt tỉ lệ khung cố định).
- [ ] Deploy lên Vercel.

**Acceptance:** `npm run lint`, `npm run build` đều pass, Lighthouse Accessibility ≥ 90, site chạy được trên URL production.

## 7. Quality gate (chạy trước khi báo hoàn thành mỗi phase)

1. `npm run lint` pass
2. `npx tsc --noEmit` pass
3. `npm run build` pass
4. Không có `console.error` khi dùng bình thường
5. Không commit file model hoặc secret

## 8. Rủi ro và cách xử lý

| Rủi ro                                                    | Xử lý                                                                                                       |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Model không tách node theo lớp                            | Dừng ở cuối Phase 1, báo chủ dự án, chuyển sang camera + annotation hoặc tự dựng Three.js                   |
| Viewer nặng trên mobile                                   | Lazy load, nút "Tải mô hình", ảnh poster                                                                    |
| Sketchfab gỡ hoặc đổi quyền model                         | Có ảnh dự phòng và thông báo lỗi thân thiện                                                                 |
| Số liệu khoa học sai                                      | Đối chiếu USGS/NASA, ghi nguồn trong `layers.json`                                                          |
| Vi phạm điều khoản/NoAI                                   | Tuân thủ mục 2, không re-host, không đưa vào dataset AI                                                     |
| File ranh giới PB2002 không có loại ranh giới             | Dùng dữ liệu `steps`; nếu vẫn thiếu thì dừng và báo chủ dự án, không tự gán loại                            |
| USGS lỗi, chậm hoặc đổi định dạng                         | Snapshot dự phòng, thông báo lỗi, kiểm tra dữ liệu khi parse                                                |
| Quá nhiều điểm động đất làm giật trên mobile              | `InstancedMesh`, giới hạn điểm, mặc định `4.5_week`, cho tăng ngưỡng độ lớn                                 |
| Học sinh hiểu nhầm "động đất chỉ xảy ra ở ranh giới mảng" | Ghi chú: phần lớn động đất mạnh tập trung ở ranh giới, nhưng vẫn có động đất trong nội mảng (do đứt gãy cũ) |
| Đơn giản hoá quá mức làm sai kiến thức                    | Mọi mô tả cơ chế phải có nguồn và đúng mức giáo trình phổ thông                                             |

## 9. Quy tắc làm việc cho agent

- Làm đúng phạm vi từng phase, không tự thêm tính năng ngoài plan.
- Commit nhỏ, message rõ ràng theo phase (ví dụ `feat(viewer): init sketchfab client`).
- Gặp điểm chưa rõ hoặc cần thêm dependency thì hỏi, không tự đoán.
- Sau mỗi phase, tóm tắt ngắn: đã làm gì, kết quả quality gate, việc tiếp theo.
