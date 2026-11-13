"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EARTH_CORE_TEX } from "@/lib/earthCoreTextures";
import "./earthStructure.css";

export interface EarthStructureViewerProps {
  onSwitchToTectonics?: () => void;
}

const KM = 6371;
const R = 2;
const TAU = Math.PI * 2;
const D2R = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
const radial = (phi: number) => new THREE.Vector3(-Math.cos(phi), 0, Math.sin(phi));
const WEDGE_DIR = radial(Math.PI / 4);
const FACE_PHI = [Math.PI / 2, 0];
const HOVER = [0.62, 0.56, 0.5, 0.44].map((f) => f * R);
const THICK = [35, 2855, 2260, 1221];

export const CORE_LAYERS = [
  {
    key: "crust",
    name: "Vỏ Trái Đất",
    en: "Crust",
    c: "--l-crust",
    tag: "Rắn · dày 5–70 km",
    depth: "0 – 35 km (trung bình lục địa)",
    thick: "5–10 km dưới đại dương · 30–70 km dưới lục địa",
    state: "Rắn",
    comp: "Đá granit (lục địa) và đá bazan (đại dương); giàu oxy, silic, nhôm",
    temp: "Tăng dần theo độ sâu, khoảng 500–1.000 °C ở đáy vỏ",
    vol: "≈ 1%",
    bound: "Mặt Moho (gián đoạn Mohorovičić)",
    fact: "Nếu Trái Đất to bằng quả táo, lớp vỏ còn mỏng hơn vỏ quả táo.",
  },
  {
    key: "mantle",
    name: "Manti",
    en: "Mantle",
    c: "--l-mantle",
    tag: "Rắn dẻo · dày ≈ 2.855 km",
    depth: "35 – 2.890 km",
    thick: "≈ 2.855 km",
    state: "Rắn nhưng dẻo; đá chảy rất chậm (vài cm mỗi năm) theo dòng đối lưu",
    comp: "Đá silicat giàu magie và sắt (peridotit)",
    temp: "≈ 1.000 – 3.700 °C",
    vol: "≈ 82–84%",
    bound: "Ranh giới manti – lõi (gián đoạn Gutenberg)",
    fact: "Dòng đối lưu trong manti kéo các mảng kiến tạo dịch chuyển, gây ra động đất, núi lửa và tạo núi.",
  },
  {
    key: "outer",
    name: "Lõi ngoài",
    en: "Outer core",
    c: "--l-outer",
    tag: "Lỏng · dày ≈ 2.260 km",
    depth: "2.890 – 5.150 km",
    thick: "≈ 2.260 km",
    state: "Lỏng",
    comp: "Sắt và niken nóng chảy, kèm một ít nguyên tố nhẹ (lưu huỳnh, oxy)",
    temp: "≈ 4.000 – 5.000 °C",
    vol: "≈ 15%",
    bound: "Ranh giới lõi ngoài – lõi trong (gián đoạn Lehmann)",
    fact: "Kim loại lỏng chuyển động trong lõi ngoài tạo ra từ trường Trái Đất: nhờ đó la bàn chỉ hướng Bắc, và gió Mặt Trời bị chặn lại.",
  },
  {
    key: "inner",
    name: "Lõi trong",
    en: "Inner core",
    c: "--l-inner",
    tag: "Rắn · bán kính ≈ 1.220 km",
    depth: "5.150 – 6.371 km (tâm Trái Đất)",
    thick: "Bán kính ≈ 1.220 km",
    state: "Rắn",
    comp: "Chủ yếu là sắt và niken",
    temp: "≈ 5.200 °C",
    vol: "< 1%",
    bound: "—",
    fact: "Lõi trong nóng gần bằng bề mặt Mặt Trời (≈ 5.500 °C) nhưng vẫn rắn, vì áp suất ở đây lớn gấp khoảng 3,6 triệu lần áp suất khí quyển.",
  },
];

export const CORE_STAGES = [
  { name: "Trái Đất nguyên vẹn", short: "Nguyên vẹn" },
  { name: "Lớp 1 · Vỏ Trái Đất", short: "Vỏ", layer: 0 },
  { name: "Lớp 2 · Manti", short: "Manti", layer: 1 },
  { name: "Lớp 3 · Lõi ngoài", short: "Lõi ngoài", layer: 2 },
  { name: "Lớp 4 · Lõi trong", short: "Lõi trong", layer: 3 },
  { name: "Mặt cắt: cả 4 lớp", short: "Mặt cắt" },
];

interface TweenItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any;
  key: string;
  to: number;
  from: number | null;
  dur: number;
  delay: number;
  t0: number;
  res: () => void;
}

interface LidData {
  g: THREE.Group;
  r: number;
  mats: THREE.Material[];
  y: number;
  op: number;
  tr: number | null;
}

const CUT_ANCHOR: [number, number | null][] = [
  [30, null],
  [55, 0.78],
  [68, 0.37],
  [138, 0.11],
];

export function EarthStructureViewer({ onSwitchToTectonics }: EarthStructureViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  const [currentStage, setCurrentStage] = useState<number>(0);
  const [crustExag, setCrustExag] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<boolean>(false);

  // References for mutable 3D animation state
  const stateRef = useRef<{
    stage: number;
    mode: "split" | "cut";
    wOff: number;
    wOp: number;
    atm: number;
    spin: boolean;
    vshift: number;
    labelStage: number;
    crustExag: boolean;
    autoOn: boolean;
    autoTok: number;
    epoch: number;
    camBusy: number;
    cv: { d: number; e: number; az: number; ty: number };
    tweens: Set<TweenItem>;
    goToFn?: (n: number, fromAuto?: boolean) => Promise<void>;
  }>({
    stage: 0,
    mode: "split",
    wOff: 0,
    wOp: 1,
    atm: 1,
    spin: true,
    vshift: 0,
    labelStage: -1,
    crustExag: false,
    autoOn: false,
    autoTok: 0,
    epoch: 0,
    camBusy: 0,
    cv: { d: 7.4, e: 14, az: 0.35, ty: 0 },
    tweens: new Set(),
  });

  // Synchronize state ref with React states
  useEffect(() => {
    stateRef.current.crustExag = crustExag;
  }, [crustExag]);

  // Main 3D Three.js Initialization & Lifecycle
  useEffect(() => {
    const viewer = viewerRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    const labelsEl = labelsRef.current;
    if (!viewer || !canvas || !svg || !labelsEl) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0xffffff, 0.38));
    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x4a3426, 0.3));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(-3.2, 2.8, 4);
    camera.add(keyLight);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4.2;
    controls.maxDistance = 20;
    controls.rotateSpeed = 0.7;

    const loader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    function loadTexture(uri: string, srgb = true) {
      const t = loader.load(uri);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      return t;
    }

    const texMap: Record<string, THREE.Texture> = {
      earth: loadTexture(EARTH_CORE_TEX.earth),
      spec: loadTexture(EARTH_CORE_TEX.earthSpec, false),
      mantle: loadTexture(EARTH_CORE_TEX.mantle),
      outer: loadTexture(EARTH_CORE_TEX.outer),
      inner: loadTexture(EARTH_CORE_TEX.inner),
      disk_true: loadTexture(EARTH_CORE_TEX.disk_true),
      disk_exag: loadTexture(EARTH_CORE_TEX.disk_exag),
    };

    const earthMat = new THREE.MeshPhongMaterial({
      map: texMap.earth,
      specularMap: texMap.spec,
      specular: new THREE.Color(0x3a4b5c),
      shininess: 22,
    });

    function layerMat(k: string) {
      const c = ({ mantle: [0.36, 0.85, 0], outer: [0.6, 0.6, 0], inner: [0.5, 0.42, 0.25] } as Record<string, number[]>)[k];
      return new THREE.MeshStandardMaterial({
        map: texMap[k],
        emissiveMap: texMap[k],
        emissive: 0xffffff,
        emissiveIntensity: c ? c[0] : 0.3,
        roughness: c ? c[1] : 0.7,
        metalness: c ? c[2] : 0.1,
      });
    }

    function diskMat(side: THREE.Side = THREE.FrontSide) {
      const t = stateRef.current.crustExag ? texMap.disk_exag : texMap.disk_true;
      return new THREE.MeshStandardMaterial({
        map: t,
        emissiveMap: t,
        emissive: 0xffffff,
        emissiveIntensity: 0.3,
        roughness: 0.85,
        side,
      });
    }

    function sphereGeo(r: number, ws: number, hs: number, ps: number, pl: number, ts: number, tl: number) {
      const g = new THREE.SphereGeometry(r, ws, hs, ps, pl, ts, tl);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i),
          v = uv.getY(i);
        uv.setXY(i, (ps + u * pl) / TAU, 1 - (ts + (1 - v) * tl) / Math.PI);
      }
      uv.needsUpdate = true;
      return g;
    }

    function planarUV(g: THREE.BufferGeometry) {
      const p = g.attributes.position,
        uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5);
      }
      uv.needsUpdate = true;
      return g;
    }

    function faceGeo(phi: number) {
      const g = planarUV(new THREE.CircleGeometry(R, 160, -Math.PI / 2, Math.PI));
      const er = radial(phi);
      const n = er.clone().cross(UP);
      g.applyMatrix4(new THREE.Matrix4().makeBasis(er, UP, n));
      return g;
    }

    const planet = new THREE.Group();
    scene.add(planet);

    // Atmosphere mesh with custom Fresnel glow shader
    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.035, 96, 64),
      new THREE.ShaderMaterial({
        uniforms: {
          uOp: { value: 1 },
          uColor: { value: new THREE.Color(0x7fbcff) },
        },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vP;
          void main(){
            vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vP = mv.xyz;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float uOp;
          uniform vec3 uColor;
          varying vec3 vN;
          varying vec3 vP;
          void main(){
            float f = 1.0 - abs(dot(normalize(vN), normalize(-vP)));
            float a = pow(f, 3.2) * 0.75 * uOp;
            gl_FragColor = vec4(uColor, a);
          }
        `,
        transparent: true,
        depthWrite: false,
      })
    );
    scene.add(atm);

    let splitG: THREE.Group | null = null;
    let cutG: THREE.Group | null = null;
    let wedge: THREE.Group | null = null;
    let wedgeMats: THREE.Material[] = [];
    let lids: LidData[] = [];

    function radii() {
      const rm = 1 - (stateRef.current.crustExag ? 280 : 35) / KM;
      return [1, rm, 3480 / KM, 1221 / KM].map((f) => f * R);
    }

    function disposeGroup(g: THREE.Group) {
      g.traverse((o) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m = o as any;
        if (m.geometry) m.geometry.dispose();
        if (m.material && m.material !== earthMat) m.material.dispose();
      });
      planet.remove(g);
    }

    function build() {
      const keep = lids.map((l) => ({ y: l.y, op: l.op }));
      if (splitG) disposeGroup(splitG);
      if (cutG) disposeGroup(cutG);
      const rs = radii();
      splitG = new THREE.Group();
      cutG = new THREE.Group();
      planet.add(splitG, cutG);

      // Split set: southern crust bowl + equatorial cross-section + four northern lids
      splitG.add(
        new THREE.Mesh(
          sphereGeo(R, 160, 48, 0, TAU, Math.PI / 2, Math.PI / 2),
          earthMat
        )
      );
      const eq = planarUV(new THREE.CircleGeometry(R, 256));
      eq.rotateX(-Math.PI / 2);
      splitG.add(new THREE.Mesh(eq, diskMat()));

      const backCol = [0x3b2c22, 0x5c1d0d, 0x8e4c0c, 0x8c7430];
      lids = rs.map((r, i) => {
        const g = new THREE.Group();
        const shellMat = i === 0 ? earthMat.clone() : layerMat(CORE_LAYERS[i].key);
        const shellGeo = sphereGeo(r, 160, 48, 0, TAU, 0, Math.PI / 2);
        const back = new THREE.MeshStandardMaterial({
          color: backCol[i],
          side: THREE.BackSide,
          roughness: 1,
        });
        const capG =
          i < 3
            ? new THREE.RingGeometry(rs[i + 1], r, 256, 1)
            : new THREE.CircleGeometry(r, 128);
        planarUV(capG);
        capG.rotateX(Math.PI / 2);
        const cap = diskMat();
        g.add(new THREE.Mesh(shellGeo, shellMat), new THREE.Mesh(shellGeo, back), new THREE.Mesh(capG, cap));
        splitG!.add(g);
        const k = keep[i] || { y: 0, op: 1 };
        return { g, r, mats: [shellMat, back, cap], y: k.y, op: k.op, tr: null };
      });

      // Cut set: 270° body with two meridian faces + the removable 90° wedge
      cutG.add(
        new THREE.Mesh(
          sphereGeo(R, 192, 96, Math.PI / 2, 1.5 * Math.PI, 0, Math.PI),
          earthMat
        )
      );
      FACE_PHI.forEach((p) =>
        cutG!.add(new THREE.Mesh(faceGeo(p), diskMat(THREE.DoubleSide)))
      );
      wedge = new THREE.Group();
      const wm = earthMat.clone();
      const f1 = diskMat(THREE.DoubleSide);
      const f2 = diskMat(THREE.DoubleSide);
      wedge.add(
        new THREE.Mesh(sphereGeo(R, 64, 96, 0, Math.PI / 2, 0, Math.PI), wm),
        new THREE.Mesh(faceGeo(0), f1),
        new THREE.Mesh(faceGeo(Math.PI / 2), f2)
      );
      wedgeMats = [wm, f1, f2];
      cutG.add(wedge);
    }

    function setOpacity(mats: THREE.Material[], op: number) {
      const tr = op < 0.999;
      mats.forEach((m) => {
        m.transparent = tr;
        m.opacity = op;
        m.depthWrite = op > 0.5;
      });
    }

    function applyState() {
      const S = stateRef.current;
      if (splitG) splitG.visible = S.mode === "split";
      if (cutG) cutG.visible = S.mode === "cut";
      lids.forEach((l) => {
        l.g.position.y = l.y;
        l.g.visible = l.op > 0.004;
        if (l.tr !== l.op) {
          setOpacity(l.mats, l.op);
          l.tr = l.op;
        }
      });
      if (wedge) {
        wedge.position.copy(WEDGE_DIR).multiplyScalar(S.wOff);
        wedge.position.y += S.wOff * 0.18;
        wedge.visible = S.wOp > 0.004;
        setOpacity(wedgeMats, S.wOp);
      }
      if (atm.material && "uniforms" in atm.material) {
        atm.material.uniforms.uOp.value = S.atm;
      }
    }

    // Tween system
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function tw(obj: any, key: string, to: number, dur: number, delay = 0) {
      return new Promise<void>((res) =>
        stateRef.current.tweens.add({
          obj,
          key,
          to,
          from: null,
          dur: dur * 1000,
          delay: delay * 1000,
          t0: performance.now(),
          res,
        })
      );
    }

    const wait = (s: number) => tw({ v: 0 }, "v", 1, s);

    function runTweens(now: number) {
      stateRef.current.tweens.forEach((a) => {
        const el = now - a.t0 - a.delay;
        if (el < 0) return;
        if (a.from === null) a.from = a.obj[a.key];
        const p = a.dur > 0 ? Math.min(1, el / a.dur) : 1;
        a.obj[a.key] = a.from! + (a.to - a.from!) * ease(p);
        if (p >= 1) {
          stateRef.current.tweens.delete(a);
          a.res();
        }
      });
    }

    function cancelAll() {
      stateRef.current.epoch++;
      stateRef.current.tweens.clear();
    }

    // Camera rig
    const target = controls.target;
    function aspectFix() {
      const a = viewer!.clientWidth / Math.max(1, viewer!.clientHeight);
      return a < 1.25 ? 1.25 / a : 1;
    }
    function wide() {
      return viewer!.clientWidth > 720;
    }

    function placeCamera() {
      const CV = stateRef.current.cv;
      target.set(0, CV.ty, 0);
      const e = CV.e * D2R;
      camera.position.set(
        CV.d * Math.cos(e) * Math.sin(CV.az),
        CV.ty + CV.d * Math.sin(e),
        CV.d * Math.cos(e) * Math.cos(CV.az)
      );
      camera.lookAt(target);
    }

    function readCamera() {
      const CV = stateRef.current.cv;
      const o = camera.position.clone().sub(target);
      CV.d = o.length();
      CV.e = Math.asin(THREE.MathUtils.clamp(o.y / CV.d, -1, 1)) / D2R;
      CV.az = Math.atan2(o.x, o.z);
      CV.ty = target.y;
    }

    function camTo(n: number) {
      const p =
        n === 0
          ? { d: 7.3, e: 14, ty: 0 }
          : n === 5
          ? { d: 7.6, e: 19, ty: 0 }
          : { d: 9.2, e: 27, ty: 0.55 };
      readCamera();
      stateRef.current.camBusy++;
      const sh = n === 0 || !wide() ? 0 : 0.09;
      Promise.all([
        tw(stateRef.current.cv, "d", p.d * aspectFix(), 1.4),
        tw(stateRef.current.cv, "e", p.e, 1.4),
        tw(stateRef.current.cv, "ty", p.ty, 1.4),
        tw(stateRef.current, "vshift", sh, 1.4),
      ]).then(() => {
        stateRef.current.camBusy--;
      });
    }

    function lidTargets(n: number) {
      return lids.map((l, i) => {
        if (n === 0) return { y: 0, op: 1 };
        if (i < n - 1) return { y: HOVER[i] + 1.3 * R, op: 0 };
        if (i === n - 1) return { y: HOVER[i], op: 1 };
        return { y: 0, op: 1 };
      });
    }

    function wrapPi(a: number) {
      return Math.atan2(Math.sin(a), Math.cos(a));
    }

    function alignAngle() {
      readCamera();
      const want =
        stateRef.current.cv.az - Math.atan2(WEDGE_DIR.x, WEDGE_DIR.z) + 0.42;
      return planet.rotation.y + wrapPi(want - planet.rotation.y);
    }

    async function goTo(n: number, fromAuto = false) {
      if (!fromAuto) {
        stateRef.current.autoOn = false;
        stateRef.current.autoTok++;
        setIsPlaying(false);
      }
      n = Math.max(0, Math.min(5, n));
      cancelAll();
      stateRef.current.camBusy = 0;
      const my = stateRef.current.epoch;
      stateRef.current.stage = n;
      stateRef.current.labelStage = -1;
      setCurrentStage(n);

      camTo(n);
      if (n === 5) {
        stateRef.current.spin = false;
        if (stateRef.current.mode !== "cut") {
          const p: Promise<void>[] = [];
          lids.forEach((l, i) => {
            const d = (3 - i) * 0.08;
            p.push(tw(l, "y", 0, 1.0, d), tw(l, "op", 1, 0.6, d));
          });
          p.push(
            tw(stateRef.current, "atm", 0, 0.5),
            tw(planet.rotation, "y", alignAngle(), 1.2)
          );
          await Promise.all(p);
          if (my !== stateRef.current.epoch) return;
          stateRef.current.mode = "cut";
          stateRef.current.wOff = 0;
          stateRef.current.wOp = 1;
          await wait(0.15);
          if (my !== stateRef.current.epoch) return;
        } else {
          await tw(planet.rotation, "y", alignAngle(), 0.8);
          if (my !== stateRef.current.epoch) return;
        }
        tw(stateRef.current, "atm", 0.6, 1.2, 0.6);
        await Promise.all([
          tw(stateRef.current, "wOff", (2.8 * R) / 2, 1.7),
          tw(stateRef.current, "wOp", 0, 1.1, 0.6),
        ]);
        if (my !== stateRef.current.epoch) return;
      } else {
        if (stateRef.current.mode === "cut") {
          await Promise.all([
            tw(stateRef.current, "wOff", 0, 0.9),
            tw(stateRef.current, "wOp", 1, 0.6),
          ]);
          if (my !== stateRef.current.epoch) return;
          stateRef.current.mode = "split";
        }
        stateRef.current.spin = true;
        const t = lidTargets(n);
        const p: Promise<void>[] = [];
        lids.forEach((l, i) => {
          const leaving = t[i].op < l.op - 0.01;
          const d = leaving ? 0 : 0.25;
          p.push(tw(l, "y", t[i].y, 1.3, d));
          if (Math.abs(t[i].op - l.op) > 0.001) {
            p.push(
              tw(l, "op", t[i].op, leaving ? 0.8 : 0.6, leaving ? 0.35 : d)
            );
          }
        });
        p.push(tw(stateRef.current, "atm", n === 0 ? 1 : 0, 0.8));
        await Promise.all(p);
        if (my !== stateRef.current.epoch) return;
      }
      stateRef.current.labelStage = n;
    }

    stateRef.current.goToFn = goTo;

    // SVG Labels & 3D Projections
    labelsEl.innerHTML = "";
    svg.innerHTML = "";
    const LBL = CORE_LAYERS.map((L, i) => {
      const dot = document.createElement("div");
      dot.className = "earth-struct-dot earth-struct-off";
      dot.style.setProperty("--c", `var(${L.c})`);
      dot.innerHTML = `<span class="num">${i + 1}</span>`;

      const card = document.createElement("div");
      card.className = "earth-struct-lbl earth-struct-off";
      card.style.setProperty("--c", `var(${L.c})`);
      card.innerHTML = `<span class="num">${i + 1}</span><span><b>${L.name}</b><small>${L.en} · ${L.tag}</small></span>`;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "earth-struct-off");

      labelsEl.append(dot, card);
      svg.appendChild(line);
      return { dot, card, line, show: false };
    });

    const v3 = new THREE.Vector3();
    const camRight = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    let W = 1,
      H = 1;

    function project(p: THREE.Vector3): [number, number] {
      v3.copy(p).project(camera);
      return [((v3.x + 1) / 2) * W, ((1 - v3.y) / 2) * H];
    }

    function setLabel(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      o: any,
      show: boolean,
      ax: number,
      ay: number,
      lx: number,
      ly: number
    ) {
      if (show !== o.show) {
        [o.dot, o.card, o.line].forEach((e) =>
          e.classList.toggle("earth-struct-off", !show)
        );
        o.show = show;
      }
      if (!show) return;
      o.dot.style.transform = `translate(${ax}px,${ay}px)`;
      const cw = o.card.offsetWidth || 180,
        ch = o.card.offsetHeight || 44;
      const x = Math.min(Math.max(8, lx), W - cw - 8),
        y = Math.min(Math.max(8, ly - ch / 2), H - ch - 8);
      o.card.style.transform = `translate(${x}px,${y}px)`;
      const ex = x > ax ? x : x + cw;
      o.line.setAttribute("x1", String(ax));
      o.line.setAttribute("y1", String(ay));
      o.line.setAttribute("x2", String(ex));
      o.line.setAttribute("y2", String(y + ch / 2));
    }

    function updateLabels() {
      viewer!.classList.toggle("earth-struct-compact", W < 640);
      camRight.setFromMatrixColumn(camera.matrixWorld, 0);
      camRight.y = 0;
      camRight.normalize();
      toCam.copy(camera.position).sub(target);
      toCam.y = 0;
      toCam.normalize();

      const ls = stateRef.current.labelStage;
      const [cx] = project(new THREE.Vector3(0, 0, 0));
      const [rx] = project(new THREE.Vector3().copy(camRight).multiplyScalar(R));
      const colX = Math.max(cx + (rx - cx) * 1.08 + 24, 0);

      if (ls >= 1 && ls <= 4) {
        const i = ls - 1,
          l = lids[i];
        if (!l) return;
        const e = 32 * D2R,
          a = 58 * D2R;
        const p = new THREE.Vector3(0, l.y, 0)
          .addScaledVector(toCam, l.r * Math.cos(e) * Math.cos(a))
          .addScaledVector(camRight, l.r * Math.cos(e) * Math.sin(a))
          .addScaledVector(UP, l.r * Math.sin(e));
        const [ax, ay] = project(p);
        LBL.forEach((o, j) =>
          setLabel(o, j === i, ax, ay, Math.max(colX, ax + 40), ay - 26)
        );
      } else if (ls === 5) {
        const q = planet.quaternion;
        let er: THREE.Vector3 | null = null;
        FACE_PHI.forEach((phi) => {
          const v = radial(phi).applyQuaternion(q);
          if (!er || v.dot(camRight) > er.dot(camRight)) er = v;
        });
        const rs = radii();
        const pts = CUT_ANCHOR.map(([th, rf], i) => {
          const r = rf == null ? (rs[0] + rs[1]) / 2 : rf * R,
            t = th * D2R;
          const p = er!
            .clone()
            .multiplyScalar(r * Math.sin(t))
            .addScaledVector(UP, r * Math.cos(t));
          const [ax, ay] = project(p);
          return { i, ax, ay, ly: ay };
        });
        const sorted = [...pts].sort((a, b) => a.ay - b.ay),
          GAP = 52;
        for (let k = 1; k < sorted.length; k++) {
          sorted[k].ly = Math.max(sorted[k].ly, sorted[k - 1].ly + GAP);
        }
        pts.forEach((p) => setLabel(LBL[p.i], true, p.ax, p.ay, colX, p.ly));
      } else {
        LBL.forEach((o) => setLabel(o, false, 0, 0, 0, 0));
      }
    }

    function resize() {
      if (!viewer) return;
      W = viewer.clientWidth;
      H = viewer.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      svg!.setAttribute("viewBox", `0 0 ${W} ${H}`);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(viewer);

    build();
    resize();

    stateRef.current.cv.d = 7.3 * aspectFix();
    stateRef.current.cv.e = 14;
    stateRef.current.cv.az = 0.35;
    stateRef.current.cv.ty = 0;
    placeCamera();
    planet.rotation.y = -3.25; // Vietnam faces viewer at start
    stateRef.current.labelStage = 0;

    let animId: number;
    let last = performance.now();
    let lastShift = -1;

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      runTweens(now);
      if (stateRef.current.spin) planet.rotation.y += dt * 0.11;
      if (stateRef.current.camBusy > 0) placeCamera();
      controls.update();
      if (stateRef.current.vshift !== lastShift) {
        if (stateRef.current.vshift > 0.0005) {
          camera.setViewOffset(W, H, W * stateRef.current.vshift, 0, W, H);
        } else {
          camera.clearViewOffset();
        }
        lastShift = stateRef.current.vshift;
      }
      applyState();
      renderer.render(scene, camera);
      updateLabels();
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);

    // Watch crustExag state changes to rebuild geometries
    const rebuildOnCrustExag = () => {
      build();
      lids.forEach((l) => (l.tr = null));
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (viewer as any).__rebuildOnCrustExag = rebuildOnCrustExag;

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      cancelAll();
      controls.dispose();
      renderer.dispose();
      if (splitG) disposeGroup(splitG);
      if (cutG) disposeGroup(cutG);
      Object.values(texMap).forEach((t) => t.dispose());
    };
  }, []);

  // Handle Crust Exaggeration toggle
  const handleToggleExag = (checked: boolean) => {
    setCrustExag(checked);
    stateRef.current.crustExag = checked;
    if (viewerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = (viewerRef.current as any).__rebuildOnCrustExag;
      if (fn) fn();
    }
  };

  // Step Navigation
  const handleGoTo = useCallback((n: number) => {
    if (stateRef.current.goToFn) {
      stateRef.current.goToFn(n, false);
    }
  }, []);

  // Autoplay function
  const handleTogglePlay = useCallback(async () => {
    if (isPlaying) {
      stateRef.current.autoOn = false;
      stateRef.current.autoTok++;
      setIsPlaying(false);
      return;
    }

    const tok = ++stateRef.current.autoTok;
    stateRef.current.autoOn = true;
    setIsPlaying(true);
    const alive = () => stateRef.current.autoOn && tok === stateRef.current.autoTok;

    if (stateRef.current.stage >= 5) {
      await stateRef.current.goToFn?.(0, true);
      if (!alive()) return;
      await new Promise((r) => setTimeout(r, 700));
    }

    while (alive() && stateRef.current.stage < 5) {
      await stateRef.current.goToFn?.(stateRef.current.stage + 1, true);
      if (!alive()) return;
      if (stateRef.current.stage < 5) {
        await new Promise((r) => setTimeout(r, 2600));
      }
    }

    if (alive()) {
      stateRef.current.autoOn = false;
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleGoTo(stateRef.current.stage + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleGoTo(stateRef.current.stage - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGoTo]);

  // Render Depth Scale Bar Ruler
  const renderRuler = (activeLayerIndex: number | null) => {
    return (
      <div className="earth-struct-ruler">
        <p className="earth-struct-sub">Thước độ sâu · Đúng tỉ lệ</p>
        <div className="earth-struct-bar" role="img" aria-label="Độ dày các lớp theo tỉ lệ thật">
          {CORE_LAYERS.map((L, i) => (
            <span
              key={L.key}
              className={`${L.key}${activeLayerIndex != null && activeLayerIndex !== i ? " dim" : ""}`}
              style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--c" as any]: `var(${L.c})`,
                width: `${(THICK[i] / KM) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="earth-struct-ticks">
          <span style={{ left: 0 }}>
            0 km<br />bề mặt
          </span>
          <span style={{ left: `${(2890 / KM) * 100}%` }}>2.890 km</span>
          <span style={{ left: `${(5150 / KM) * 100}%` }}>5.150 km</span>
          <span style={{ left: "100%" }}>
            6.371 km<br />tâm
          </span>
        </div>
      </div>
    );
  };

  const currentStageObj = CORE_STAGES[currentStage] || CORE_STAGES[0];
  const activeLayerIndex = currentStageObj.layer !== undefined ? currentStageObj.layer : null;
  const currentLayer = activeLayerIndex !== null ? CORE_LAYERS[activeLayerIndex] : null;

  return (
    <div ref={containerRef} className="earth-struct-container">
      {/* Left Column: 3D Stage & Step Rail */}
      <section className="earth-struct-viewer-wrap" aria-label="Mô hình 3D Trái Đất">
        <div ref={viewerRef} className="earth-struct-viewer">
          {webglError ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400">
              Trình duyệt chưa bật WebGL nên không hiển thị được mô hình 3D. Hãy mở trang bằng Chrome, Edge hoặc Safari.
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} aria-label="Mô hình Trái Đất 3D, kéo để xoay" />
              <svg ref={svgRef} className="earth-struct-lines" aria-hidden="true" />
              <div ref={labelsRef} className="earth-struct-labels" aria-hidden="true" />

              {/* Floating Caption Top-Left */}
              <div className="earth-struct-caption">
                <span className="step">Bước {currentStage + 1} / {CORE_STAGES.length}</span>
                <span className="name">{currentStageObj.name}</span>
                {crustExag && (
                  <span className="note">Vỏ đang được phóng đại ×8 để dễ quan sát</span>
                )}
              </div>

              {/* Interaction Hint Bottom-Right */}
              <div className="earth-struct-hint">
                Kéo để xoay · Cuộn chuột hoặc chụm hai ngón để phóng to
              </div>
            </>
          )}
        </div>

        {/* Stepper & Controls Toolbar */}
        <div className="earth-struct-controls">
          <ol className="earth-struct-stepper">
            {CORE_STAGES.map((s, i) => (
              <li key={s.short}>
                <button
                  type="button"
                  onClick={() => handleGoTo(i)}
                  aria-current={i === currentStage ? "step" : undefined}
                  className={i < currentStage ? "done" : ""}
                >
                  <span className="n">{i + 1}</span>
                  <span className="t">{s.short}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="earth-struct-btns">
            <button
              type="button"
              className="earth-struct-btn icon"
              onClick={() => handleGoTo(currentStage - 1)}
              disabled={currentStage === 0}
              aria-label="Bước trước"
              title="Bước trước (Mũi tên trái)"
            >
              <svg viewBox="0 0 24 24">
                <path d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12z" />
              </svg>
            </button>

            <button
              type="button"
              className="earth-struct-btn primary"
              onClick={handleTogglePlay}
            >
              {isPlaying ? (
                <>
                  <svg viewBox="0 0 24 24">
                    <path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" />
                  </svg>
                  Tạm dừng
                </>
              ) : currentStage === 0 ? (
                <>
                  <svg viewBox="0 0 24 24">
                    <path d="M7 4.5v15l12.5-7.5z" />
                  </svg>
                  Bắt đầu tách lớp
                </>
              ) : currentStage === 5 ? (
                <>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
                  </svg>
                  Xem lại từ đầu
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24">
                    <path d="M7 4.5v15l12.5-7.5z" />
                  </svg>
                  Tiếp tục tự động
                </>
              )}
            </button>

            <button
              type="button"
              className="earth-struct-btn icon"
              onClick={() => handleGoTo(currentStage + 1)}
              disabled={currentStage === 5}
              aria-label="Bước tiếp"
              title="Bước tiếp (Mũi tên phải)"
            >
              <svg viewBox="0 0 24 24">
                <path d="M8.6 18.6 10 20l8-8-8-8-1.4 1.4 6.6 6.6z" />
              </svg>
            </button>

            <button
              type="button"
              className="earth-struct-btn icon"
              onClick={() => handleGoTo(0)}
              aria-label="Về Trái Đất nguyên vẹn"
              title="Đặt lại ban đầu"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
              </svg>
            </button>
          </div>

          <label className="earth-struct-toggle">
            <input
              type="checkbox"
              checked={crustExag}
              onChange={(e) => handleToggleExag(e.target.checked)}
            />
            <span className="earth-struct-sw" aria-hidden="true" />
            <span>Phóng đại vỏ ×8</span>
          </label>
        </div>
      </section>

      {/* Right Column: Educational Field-Notes Panel */}
      <aside className="earth-struct-panel" aria-live="polite">
        {currentStage === 0 && (
          <>
            <div>
              <h2>Trái Đất của chúng ta</h2>
              <div className="en">Earth · bán kính trung bình 6.371 km</div>
            </div>
            <p>
              Bề mặt ta nhìn thấy (lục địa, đại dương, băng) chỉ là phần trên cùng của lớp vỏ rất mỏng.
              Bên dưới là ba lớp nữa, càng vào sâu càng nóng và đặc.
            </p>
            <ol className="earth-struct-list">
              {CORE_LAYERS.map((L, i) => (
                <li
                  key={L.key}
                  style={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ["--c" as any]: `var(${L.c})`,
                    cursor: "pointer",
                  }}
                  onClick={() => handleGoTo(i + 1)}
                  title={`Bấm để xem ${L.name}`}
                >
                  <span className="k">{i + 1}</span>
                  <span className="font-semibold text-white">{L.name}</span>
                  <span className="s">{L.state.split(";")[0]}</span>
                </li>
              ))}
            </ol>
            {renderRuler(null)}
          </>
        )}

        {currentStage >= 1 && currentStage <= 4 && currentLayer && (
          <>
            <div
              className="earth-struct-ptitle"
              style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--c" as any]: `var(${currentLayer.c})`,
              }}
            >
              <span className="earth-struct-chip" />
              <div>
                <h2>{currentLayer.name}</h2>
                <div className="en">{currentLayer.en}</div>
              </div>
            </div>

            <dl className="earth-struct-facts">
              <dt>Độ sâu</dt>
              <dd className="earth-struct-num-data font-bold text-amber-300">
                {currentLayer.depth}
              </dd>
              <dt>Độ dày</dt>
              <dd>{currentLayer.thick}</dd>
              <dt>Trạng thái</dt>
              <dd>{currentLayer.state}</dd>
              <dt>Thành phần</dt>
              <dd>{currentLayer.comp}</dd>
              <dt>Nhiệt độ</dt>
              <dd>{currentLayer.temp}</dd>
              <dt>Thể tích</dt>
              <dd>{currentLayer.vol} thể tích Trái Đất</dd>
              <dt>Ranh giới dưới</dt>
              <dd>{currentLayer.bound}</dd>
            </dl>

            <div
              className="earth-struct-fact"
              style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--c" as any]: `var(${currentLayer.c})`,
              }}
            >
              💡 {currentLayer.fact}
            </div>

            {/* Pedagogical link from Crust / Mantle to Tectonics tab */}
            {(currentStage === 1 || currentStage === 2) && onSwitchToTectonics && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 flex flex-col gap-2">
                <div className="text-xs text-cyan-200">
                  {currentStage === 1
                    ? "Vỏ Trái Đất cùng phần trên của manti tạo thành Thạch quyển — bị nứt vỡ thành các mảng kiến tạo luôn dịch chuyển."
                    : "Dòng đối lưu nhiệt trong manti chính là động cơ kéo các mảng kiến tạo di chuyển, gây ra động đất & núi lửa."}
                </div>
                <button
                  type="button"
                  onClick={onSwitchToTectonics}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/30"
                >
                  <span>🗺️</span> Khám phá Mảng kiến tạo & Động đất
                </button>
              </div>
            )}

            {renderRuler(activeLayerIndex)}
          </>
        )}

        {currentStage === 5 && (
          <>
            <div>
              <h2>Mặt cắt hình nêm</h2>
              <div className="en">Cutaway · 4 lớp và 3 ranh giới</div>
            </div>
            <p>
              Một múi 90° được lấy ra để lộ mặt cắt từ bề mặt tới tâm. Các vòng trên mặt cắt có bán kính đúng tỉ lệ theo mô hình PREM.
            </p>

            <table className="earth-struct-sum">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>Lớp</th>
                  <th>Độ sâu (km)</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {CORE_LAYERS.map((L, i) => (
                  <tr
                    key={L.key}
                    style={{
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ["--c" as any]: `var(${L.c})`,
                    }}
                  >
                    <td>
                      <span className="earth-struct-list" style={{ display: "inline-block" }}>
                        <span className="k">{i + 1}</span>
                      </span>
                    </td>
                    <td className="font-semibold text-white">{L.name}</td>
                    <td className="earth-struct-num-data">
                      {["0 – 35", "35 – 2.890", "2.890 – 5.150", "5.150 – 6.371"][i]}
                    </td>
                    <td>{["Rắn", "Rắn dẻo", "Lỏng", "Rắn"][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-1">
              <p className="earth-struct-sub" style={{ marginBottom: 6 }}>
                3 Ranh giới địa chấn lớn
              </p>
              <dl className="earth-struct-facts">
                <dt className="text-amber-300 font-medium">Mặt Moho</dt>
                <dd>
                  Vỏ / Manti · <span className="earth-struct-num-data">≈ 35 km</span>
                </dd>
                <dt className="text-orange-300 font-medium">Gutenberg</dt>
                <dd>
                  Manti / Lõi ngoài · <span className="earth-struct-num-data">2.890 km</span>
                </dd>
                <dt className="text-yellow-300 font-medium">Lehmann</dt>
                <dd>
                  Lõi ngoài / Lõi trong · <span className="earth-struct-num-data">5.150 km</span>
                </dd>
              </dl>
            </div>

            {renderRuler(null)}
          </>
        )}
      </aside>
    </div>
  );
}
