import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const LOCATIONS = [
  { name: '서울', country: '대한민국', lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', color: '#7cd4ff',
    desc: '한강을 따라 펼쳐진 고궁과 초고층 빌딩, 밤새 꺼지지 않는 골목의 불빛이 공존하는 도시.' },
  { name: '도쿄', country: '일본', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo', color: '#ff8fb1',
    desc: '네온이 빛나는 시부야 교차로부터 고요한 신사까지, 세계에서 가장 큰 대도시권.' },
  { name: '싱가포르', country: '싱가포르', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore', color: '#6ef0b0',
    desc: '열대 정원과 미래 도시가 어우러진 적도의 섬. 마리나 베이의 야경이 압권입니다.' },
  { name: '시드니', country: '오스트레일리아', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', color: '#ffd36e',
    desc: '오페라 하우스와 하버 브리지가 만나는 항구, 그리고 끝없이 이어지는 해변.' },
  { name: '카이로', country: '이집트', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo', color: '#ffb86b',
    desc: '나일강 위의 천년 도시. 서쪽 지평선에는 기자의 피라미드가 서 있습니다.' },
  { name: '케이프타운', country: '남아프리카 공화국', lat: -33.9249, lon: 18.4241, tz: 'Africa/Johannesburg', color: '#b59cff',
    desc: '테이블 마운틴 아래 두 대양이 만나는 아프리카 대륙의 남쪽 끝.' },
  { name: '파리', country: '프랑스', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris', color: '#ff9e7a',
    desc: '센강을 따라 이어지는 예술과 미식의 수도. 매 시 정각 에펠탑이 반짝입니다.' },
  { name: '레이캬비크', country: '아이슬란드', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik', color: '#8ff7ff',
    desc: '오로라가 춤추는 세계 최북단의 수도. 화산과 빙하가 가까이 있습니다.' },
  { name: '뉴욕', country: '미국', lat: 40.7128, lon: -74.006, tz: 'America/New_York', color: '#7ca8ff',
    desc: '잠들지 않는 도시. 맨해튼의 스카이라인과 센트럴 파크가 세계의 무대가 됩니다.' },
  { name: '샌프란시스코', country: '미국', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles', color: '#ff7a7a',
    desc: '안개 속 금문교와 언덕길 전차, 그리고 기술 혁신의 중심지.' },
  { name: '리우데자네이루', country: '브라질', lat: -22.9068, lon: -43.1729, tz: 'America/Sao_Paulo', color: '#9dff8f',
    desc: '코르코바두 언덕의 거대 예수상이 내려다보는 해변과 삼바의 도시.' },
  { name: '마추픽추', country: '페루', lat: -13.1631, lon: -72.545, tz: 'America/Lima', color: '#ffe08f',
    desc: '안데스 산맥 구름 위에 숨겨진 잉카 제국의 공중 도시.' },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GLOBE_RADIUS = 1;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CONFIG = {
  overviewDistance: 3.2,
  focusDistance: 2.45,
  autoRotateSpeed: reducedMotion ? 0.25 : 0.55,
  resumeDelay: 3500, // ms of idleness before auto-rotation resumes
  flightDuration: reducedMotion ? 400 : 1700,
};

// Portrait screens need the camera further back so the globe fits horizontally.
const distanceScale = () => (camera.aspect < 1 ? 1 + (1 - camera.aspect) * 0.9 : 1);

// ---------------------------------------------------------------------------
// Renderer / scene / camera
// ---------------------------------------------------------------------------

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.9, 12); // starts far away for the intro flight
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.45;
controls.zoomSpeed = 0.6;
controls.enablePan = false;
controls.minDistance = 1.45;
controls.maxDistance = 7;
controls.autoRotateSpeed = CONFIG.autoRotateSpeed;
controls.enabled = false; // enabled after the intro flight

// ---------------------------------------------------------------------------
// Lighting — soft ambient fill plus a key light that travels with the camera,
// so the side of the globe facing the viewer is always gently lit.
// ---------------------------------------------------------------------------

scene.add(new THREE.AmbientLight(0xb8c8ff, 0.55));
scene.add(new THREE.HemisphereLight(0x9cc8ff, 0x0b1020, 0.6));

const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.9);
keyLight.position.set(-3.5, 2.5, 3);
camera.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x6aa8ff, 0.7);
rimLight.position.set(4, -1, -2);
camera.add(rimLight);

// ---------------------------------------------------------------------------
// Globe
// ---------------------------------------------------------------------------

const loader = document.getElementById('loader');
const manager = new THREE.LoadingManager();
manager.onLoad = () => {
  loader.classList.add('is-done');
  startIntro();
};

const texLoader = new THREE.TextureLoader(manager);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const loadTexture = (url, srgb = false) => {
  const tex = texLoader.load(url);
  tex.anisotropy = Math.min(8, maxAniso);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const globe = new THREE.Group();
scene.add(globe);

const earthMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: loadTexture('./assets/textures/earth-day.jpg', true),
  bumpMap: loadTexture('./assets/textures/earth-bump.jpg'),
  bumpScale: 0.02,
  specularMap: loadTexture('./assets/textures/earth-specular.jpg'),
  specular: new THREE.Color(0x3a4a66),
  shininess: 18,
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128), earthMaterial);
globe.add(earth);

const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 96, 96),
  new THREE.MeshPhongMaterial({
    color: 0xffffff,
    alphaMap: loadTexture('./assets/textures/earth-clouds.jpg'),
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  }),
);
globe.add(clouds);

// Fresnel rim on the globe's surface — the thin bright edge of the atmosphere.
const rimGlow = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_RADIUS * 1.014, 96, 96),
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0x6fb8ff) } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        float f = 1.0 - max(dot(normalize(vNormal), normalize(-vViewPos)), 0.0);
        float intensity = pow(f, 4.0) * 0.55;
        gl_FragColor = vec4(uColor * intensity, intensity);
      }`,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  }),
);
globe.add(rimGlow);

// Outer halo — rendered from the back faces of a larger sphere so it only
// shows around the limb and fades smoothly into space.
const halo = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_RADIUS * 1.18, 96, 96),
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0x4a8fe8) } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        float f = -dot(normalize(vNormal), normalize(-vViewPos));
        float intensity = pow(clamp(f / 0.55, 0.0, 1.0), 3.0) * 0.75;
        gl_FragColor = vec4(uColor * intensity, intensity);
      }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  }),
);
scene.add(halo);

// ---------------------------------------------------------------------------
// Starfield
// ---------------------------------------------------------------------------

function makeGlowTexture(stops) {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const starTexture = makeGlowTexture([
  [0, 'rgba(255,255,255,1)'],
  [0.25, 'rgba(255,255,255,0.6)'],
  [1, 'rgba(255,255,255,0)'],
]);

function makeStars(count, radiusMin, radiusMax, size, opacity) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tint = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const r = radiusMin + Math.random() * (radiusMax - radiusMin);
    const v = new THREE.Vector3().randomDirection().multiplyScalar(r);
    positions.set([v.x, v.y, v.z], i * 3);
    tint.setHSL(0.55 + Math.random() * 0.12, 0.5, 0.75 + Math.random() * 0.25);
    colors.set([tint.r, tint.g, tint.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
}

const starsFar = makeStars(2200, 60, 110, 0.55, 0.75);
const starsNear = makeStars(250, 30, 55, 0.6, 0.9);
scene.add(starsFar, starsNear);

// Faint dust drifting around the globe for a little depth.
const dust = makeStars(260, 2.2, 6, 0.035, 0.35);
scene.add(dust);

// ---------------------------------------------------------------------------
// Markers
// ---------------------------------------------------------------------------

function latLonToVector3(lat, lon, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

const markerGlowTexture = makeGlowTexture([
  [0, 'rgba(255,255,255,1)'],
  [0.15, 'rgba(255,255,255,0.85)'],
  [0.4, 'rgba(255,255,255,0.25)'],
  [1, 'rgba(255,255,255,0)'],
]);

const beamMaterialBase = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 0.75 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      float a = pow(1.0 - vUv.y, 1.6) * uOpacity;
      gl_FragColor = vec4(uColor, a);
    }`,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const coreGeometry = new THREE.SphereGeometry(0.011, 16, 16);
const ringGeometry = new THREE.RingGeometry(0.018, 0.023, 48);
const beamGeometry = new THREE.CylinderGeometry(0.0025, 0.0025, 0.12, 8, 1, true);
beamGeometry.rotateX(Math.PI / 2); // align with +Z (the outward normal)
beamGeometry.translate(0, 0, 0.06);
// Cylinder UV.y runs along its height; after rotation it still does, base → tip.
const hitGeometry = new THREE.SphereGeometry(0.045, 8, 8);

const markers = LOCATIONS.map((loc, index) => {
  const color = new THREE.Color(loc.color);
  const surface = latLonToVector3(loc.lat, loc.lon);
  const normal = surface.clone().normalize();

  const group = new THREE.Group();
  group.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS * 1.004));
  group.lookAt(normal.clone().multiplyScalar(5)); // +Z points away from the globe
  globe.add(group);

  const core = new THREE.Mesh(coreGeometry, new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color(0xffffff), 0.5) }));
  group.add(core);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: markerGlowTexture,
    color,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  glow.scale.setScalar(0.1);
  glow.position.z = 0.006;
  group.add(glow);

  const rings = [0, 0.5].map((phase) => {
    const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }));
    ring.position.z = 0.002;
    ring.userData.phase = phase;
    group.add(ring);
    return ring;
  });

  const beamMaterial = beamMaterialBase.clone();
  beamMaterial.uniforms.uColor.value = color;
  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  group.add(beam);

  const hit = new THREE.Mesh(hitGeometry, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  hit.userData.index = index;
  group.add(hit);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = loc.name;
  label.addEventListener('click', () => selectLocation(index));
  label.addEventListener('pointerenter', () => setHover(index));
  label.addEventListener('pointerleave', () => setHover(-1));
  document.getElementById('labels').appendChild(label);

  return {
    loc, index, group, core, glow, rings, beam, hit, label, normal,
    emphasis: 0, // 0 → idle, 1 → hovered/selected (eased)
    seed: Math.random() * Math.PI * 2,
  };
});

const hitTargets = markers.map((m) => m.hit);

// ---------------------------------------------------------------------------
// UI: list, card, auto-rotate pill
// ---------------------------------------------------------------------------

const ui = {
  list: document.getElementById('placeList'),
  panel: document.getElementById('panel'),
  panelToggle: document.getElementById('panelToggle'),
  card: document.getElementById('card'),
  cardTitle: document.getElementById('cardTitle'),
  cardCountry: document.getElementById('cardCountry'),
  cardDesc: document.getElementById('cardDesc'),
  cardTime: document.getElementById('cardTime'),
  cardCoords: document.getElementById('cardCoords'),
  rotateToggle: document.getElementById('rotateToggle'),
  rotateLabel: document.getElementById('rotateLabel'),
};

const formatCoord = (v, pos, neg) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`;

const listItems = LOCATIONS.map((loc, index) => {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.className = 'place';
  btn.style.setProperty('--c', loc.color);
  btn.innerHTML = `
    <span class="place__swatch" aria-hidden="true"></span>
    <span class="place__text">
      <span class="place__name"></span>
      <span class="place__sub"></span>
    </span>`;
  btn.querySelector('.place__name').textContent = loc.name;
  btn.querySelector('.place__sub').textContent = `${loc.country} · ${formatCoord(loc.lat, 'N', 'S')}`;
  btn.addEventListener('click', () => selectLocation(index));
  btn.addEventListener('pointerenter', () => setHover(index));
  btn.addEventListener('pointerleave', () => setHover(-1));
  li.appendChild(btn);
  ui.list.appendChild(li);
  return btn;
});

ui.panelToggle.addEventListener('click', () => {
  const collapsed = ui.panel.classList.toggle('is-collapsed');
  ui.panelToggle.setAttribute('aria-expanded', String(!collapsed));
});

document.getElementById('cardClose').addEventListener('click', () => clearSelection());
document.getElementById('prevBtn').addEventListener('click', () => stepSelection(-1));
document.getElementById('nextBtn').addEventListener('click', () => stepSelection(1));

function localTime(tz) {
  try {
    return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date());
  } catch {
    return '—';
  }
}

function renderCard(loc) {
  ui.cardTitle.textContent = loc.name;
  ui.cardCountry.textContent = loc.country;
  ui.cardDesc.textContent = loc.desc;
  ui.cardTime.textContent = localTime(loc.tz);
  ui.cardCoords.textContent = `${formatCoord(loc.lat, 'N', 'S')}, ${formatCoord(loc.lon, 'E', 'W')}`;
}

setInterval(() => {
  if (state.selected >= 0) ui.cardTime.textContent = localTime(LOCATIONS[state.selected].tz);
}, 15000);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  selected: -1,
  hovered: -1,
  autoRotateEnabled: true, // the user's preference (pill toggle)
  interacting: false,
  resumeTimer: 0,
  flight: null,
};

function updateAutoRotate() {
  const running = state.autoRotateEnabled && !state.interacting && state.selected < 0 && !state.flight && !state.resumeTimer;
  controls.autoRotate = running;
  const label = !state.autoRotateEnabled ? '자동 회전 꺼짐' : running ? '자동 회전' : '자동 회전 일시정지';
  ui.rotateLabel.textContent = label;
  ui.rotateToggle.dataset.state = !state.autoRotateEnabled ? 'off' : running ? 'on' : 'paused';
  ui.rotateToggle.setAttribute('aria-pressed', String(state.autoRotateEnabled));
}

function scheduleResume(delay = CONFIG.resumeDelay) {
  clearTimeout(state.resumeTimer);
  state.resumeTimer = setTimeout(() => {
    state.resumeTimer = 0;
    updateAutoRotate();
  }, delay);
  updateAutoRotate();
}

ui.rotateToggle.addEventListener('click', () => {
  state.autoRotateEnabled = !state.autoRotateEnabled;
  clearTimeout(state.resumeTimer);
  state.resumeTimer = 0;
  updateAutoRotate();
});

controls.addEventListener('start', () => {
  state.interacting = true;
  clearTimeout(state.resumeTimer);
  state.resumeTimer = 0;
  canvas.classList.add('is-dragging');
  updateAutoRotate();
});

controls.addEventListener('end', () => {
  state.interacting = false;
  canvas.classList.remove('is-dragging');
  scheduleResume();
});

// ---------------------------------------------------------------------------
// Camera flights
// ---------------------------------------------------------------------------

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function flyTo(direction, distance, duration = CONFIG.flightDuration, onDone) {
  const startDir = camera.position.clone().normalize();
  const endDir = direction.clone().normalize();
  const startDist = camera.position.length();
  const angle = startDir.angleTo(endDir);
  state.flight = {
    start: performance.now(),
    duration: duration * (0.65 + 0.35 * Math.min(1, angle / Math.PI)),
    startDir,
    rotation: new THREE.Quaternion().setFromUnitVectors(startDir, endDir),
    startDist,
    endDist: distance,
    // Pull back a little mid-flight on long journeys, like a gentle arc.
    lift: Math.min(0.9, angle * 0.32) * (reducedMotion ? 0 : 1),
    onDone,
  };
  controls.enabled = false;
  updateAutoRotate();
}

const _q = new THREE.Quaternion();
const _identity = new THREE.Quaternion();

function updateFlight(now) {
  const f = state.flight;
  if (!f) return;
  const t = Math.min(1, (now - f.start) / f.duration);
  const e = easeInOutCubic(t);
  _q.slerpQuaternions(_identity, f.rotation, e);
  const dist = THREE.MathUtils.lerp(f.startDist, f.endDist, e) + Math.sin(Math.PI * e) * f.lift;
  camera.position.copy(f.startDir).applyQuaternion(_q).multiplyScalar(dist);
  camera.lookAt(controls.target);
  if (t >= 1) {
    state.flight = null;
    controls.enabled = true;
    f.onDone?.();
    updateAutoRotate();
  }
}

// Aim the camera so a marker sits slightly above centre, leaving room for the
// card / bottom sheet on small screens.
function focusDirection(marker) {
  const dir = marker.normal.clone();
  dir.y = Math.max(-0.97, Math.min(0.97, dir.y)); // stay clear of the poles
  return dir.normalize();
}

function selectLocation(index) {
  if (index < 0 || index >= markers.length) return;
  const marker = markers[index];
  state.selected = index;
  clearTimeout(state.resumeTimer);
  state.resumeTimer = 0;

  markers.forEach((m, i) => m.label.classList.toggle('is-active', i === index));
  listItems.forEach((b, i) => b.classList.toggle('is-active', i === index));
  listItems[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });

  renderCard(marker.loc);
  ui.card.hidden = false;
  requestAnimationFrame(() => ui.card.classList.add('is-visible'));
  document.body.classList.add('has-selection');

  flyTo(focusDirection(marker), CONFIG.focusDistance * distanceScale());
}

function clearSelection() {
  if (state.selected < 0) return;
  state.selected = -1;
  markers.forEach((m) => m.label.classList.remove('is-active'));
  listItems.forEach((b) => b.classList.remove('is-active'));
  ui.card.classList.remove('is-visible');
  document.body.classList.remove('has-selection');
  setTimeout(() => { if (state.selected < 0) ui.card.hidden = true; }, 500);

  const dir = camera.position.clone().normalize();
  dir.y = THREE.MathUtils.lerp(dir.y, 0.22, 0.6);
  flyTo(dir.normalize(), CONFIG.overviewDistance * distanceScale(), CONFIG.flightDuration * 0.8, () => scheduleResume(1200));
}

function stepSelection(delta) {
  const base = state.selected < 0 ? (delta > 0 ? -1 : 0) : state.selected;
  selectLocation((base + delta + markers.length) % markers.length);
}

function setHover(index) {
  state.hovered = index;
  markers.forEach((m, i) => m.label.classList.toggle('is-hover', i === index));
}

// ---------------------------------------------------------------------------
// Pointer picking (click vs. drag)
// ---------------------------------------------------------------------------

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downAt = null;

function pick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  // Include the earth so markers on the far side are occluded.
  const hits = raycaster.intersectObjects([earth, ...hitTargets], false);
  const first = hits[0];
  return first && first.object !== earth ? first.object.userData.index : -1;
}

canvas.addEventListener('pointerdown', (e) => {
  downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
});

canvas.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  const quick = performance.now() - downAt.t < 500;
  downAt = null;
  if (moved > 6 || !quick) return;
  const index = pick(e.clientX, e.clientY);
  if (index >= 0) selectLocation(index);
});

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || downAt) return;
  const index = pick(e.clientX, e.clientY);
  if (index !== state.hovered) setHover(index);
  canvas.classList.toggle('is-hovering', index >= 0);
});

canvas.addEventListener('pointerleave', () => {
  setHover(-1);
  canvas.classList.remove('is-hovering');
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') clearSelection();
  else if (e.key === 'ArrowRight') stepSelection(1);
  else if (e.key === 'ArrowLeft') stepSelection(-1);
});

// ---------------------------------------------------------------------------
// Intro, resize, render loop
// ---------------------------------------------------------------------------

let introStarted = false;
function startIntro() {
  if (introStarted) return;
  introStarted = true;
  // Open on a view of East Asia, slightly from above.
  const dir = latLonToVector3(24, 118).normalize();
  flyTo(dir, CONFIG.overviewDistance * distanceScale(), reducedMotion ? 400 : 2600, () => scheduleResume(600));
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
onResize();

const _world = new THREE.Vector3();
const _proj = new THREE.Vector3();
const _camDir = new THREE.Vector3();

function updateMarkers(time, dt) {
  const camDist = camera.position.length();
  _camDir.copy(camera.position).normalize();
  // A surface point is visible when its normal faces the camera beyond the horizon.
  const horizon = GLOBE_RADIUS / camDist;
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (const m of markers) {
    const target = m.index === state.selected || m.index === state.hovered ? 1 : 0;
    m.emphasis += (target - m.emphasis) * Math.min(1, dt * 8);

    // Fade markers out as they slip behind the horizon so their glow
    // doesn't flare past the globe's edge.
    const facing = m.normal.dot(_camDir);
    const fade = THREE.MathUtils.smoothstep(facing, horizon - 0.08, horizon + 0.06);

    const breathe = 0.5 + 0.5 * Math.sin(time * 2.2 + m.seed);
    m.glow.scale.setScalar(0.08 + breathe * 0.022 + m.emphasis * 0.04);
    m.glow.material.opacity = (0.8 + m.emphasis * 0.2) * fade;
    m.core.scale.setScalar(1 + m.emphasis * 0.4);
    m.beam.scale.z = 1 + m.emphasis * 0.6;
    m.beam.material.uniforms.uOpacity.value = (0.55 + m.emphasis * 0.4) * fade;

    for (const ring of m.rings) {
      const p = (time * 0.55 + ring.userData.phase + m.seed) % 1;
      ring.scale.setScalar(1 + p * (2.4 + m.emphasis * 0.8));
      ring.material.opacity = (1 - p) * (0.5 + m.emphasis * 0.35) * fade;
    }

    // Label placement + fade near the horizon.
    const vis = THREE.MathUtils.smoothstep(facing, horizon + 0.02, horizon + 0.22);
    if (vis <= 0.01) {
      m.label.style.opacity = '0';
      m.label.style.pointerEvents = 'none';
      continue;
    }
    m.group.getWorldPosition(_world);
    _proj.copy(_world).project(camera);
    const x = (_proj.x * 0.5 + 0.5) * w;
    const y = (-_proj.y * 0.5 + 0.5) * h;
    const lift = 14 + m.emphasis * 8;
    m.label.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${(y - lift).toFixed(1)}px)`;
    const baseOpacity = camDist < 2.6 || m.emphasis > 0.05 ? 1 : 0.75;
    m.label.style.opacity = String(vis * Math.max(baseOpacity, m.emphasis));
    m.label.style.pointerEvents = vis > 0.4 ? 'auto' : 'none';
  }
}

const clock = new THREE.Clock();

function animate(now) {
  const dt = Math.min(clock.getDelta(), 0.1);
  const time = clock.elapsedTime;

  clouds.rotation.y += dt * 0.008;
  starsFar.rotation.y += dt * 0.002;
  starsNear.rotation.y += dt * 0.004;
  dust.rotation.y -= dt * 0.01;
  dust.rotation.x = Math.sin(time * 0.05) * 0.1;

  if (state.flight) {
    controls.update(); // drain any leftover damping before we override the camera
    updateFlight(now);
  } else {
    controls.update();
  }

  updateMarkers(time, dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateAutoRotate();
requestAnimationFrame(animate);
