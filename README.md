# Earth3D - Khám Phá Cấu Trúc Trái Đất 3D & Mảng Kiến Tạo

Trang web giáo dục tương tác STEM dành cho học sinh và người học khoa học Trái Đất:
1. **Bên trong Trái Đất (3D Earth Core)**: Mô hình 3D cắt lớp 90° và bản nổ (exploded view) các tầng cấu trúc: Vỏ, Manti trên (Quyển mềm), Manti dưới, Lõi ngoài lỏng (tạo từ trường) và Lõi trong rắn kết tinh.
2. **Mảng kiến tạo & Động đất (3D Tectonic Globe)**: Quả địa cầu tương tác 3D hiển thị 54 mảng kiến tạo (PB2002), 3 loại ranh giới (Phân kỳ, Hội tụ, Trượt ngang) và các trận động đất trực tiếp thời gian thực từ USGS Earthquake Hazards Program.
3. **Thử thách kiến thức & Hoạt động quan sát**: 5 nhiệm vụ quan sát định hướng cùng bài trắc nghiệm địa chất tự chấm điểm.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Đồ họa 3D**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Địa lý & Chiếu bản đồ**: `d3-geo`
- **Dữ liệu mảng & ranh giới**: PB2002 (Peter Bird 2003 / Hugo Ahlenius / Nordpil)
- **Dữ liệu động đất**: USGS Earthquake Hazards Program Realtime GeoJSON Feeds
- **Bản đồ bề mặt**: NASA Blue Marble 2K & Natural Earth 110m Coastlines

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy môi trường phát triển
npm run dev

# 3. Mở trình duyệt tại
http://localhost:3000
```

---

## 📦 Build Production

```bash
npm run build
npm run start
```

---

## 📜 Bản Quyền & Nguồn Dữ Liệu (Attribution)

- **PB2002 Plate Boundaries**: Peter Bird (2003), doi:10.1029/2001GC000252, Open Data Commons Attribution License.
- **USGS Earthquake Data**: U.S. Geological Survey Earthquake Hazards Program (Public Domain).
- **Coastline Data**: Natural Earth 110m Physical Vectors (Public Domain).
- Chi tiết xem tại `public/data/ATTRIBUTION.md`.
