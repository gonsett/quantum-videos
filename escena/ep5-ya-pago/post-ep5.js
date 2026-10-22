// Ep. 5 «Ya pagó»: post propio del episodio. Dos ópticas: el recuerdo (anamórfico simulado, ámbar que se enfría
// pasada a pasada) y el presente (esférico limpio, verde azulado sutil). Más el rebobinado y el destello de «ahora».
// Va antes del OutputPass: trabaja en lineal HDR, el tonemapping y el sRGB vienen después. Todo depende solo de uniforms.
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const FRAG = /* glsl */`
uniform sampler2D tDiffuse;
uniform float uRec, uFrio, uReb, uFlare, uT;
uniform vec2 uRes;
varying vec2 vUv;

const float FLARE_Y = 0.58;   // el destello de «ahora» cruza a 0,42 del alto contado desde arriba

float h11(float x) { return fract(sin(x * 127.1 + 311.7) * 43758.5453); }
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 tx(vec2 uv) { return texture2D(tDiffuse, clamp(uv, 0.0, 1.0)).rgb; }

void main() {
  float rec = clamp(uRec, 0.0, 1.0), fr = clamp(uFrio, 0.0, 1.0), reb = clamp(uReb, 0.0, 1.0);
  float opt = rec * (1.0 - 0.6 * fr);            // fuerza de la óptica anamórfica: el frío la apaga a medias
  float asp = uRes.x / uRes.y, esc = uRes.y / 1920.0;
  vec2 uv = vUv;

  // ---- tirón de cinta: bandas horizontales que se corren (cambian 30 veces por segundo) ----
  if (reb > 0.001) {
    float q = floor(uT * 30.0);
    float b = floor(uv.y * mix(10.0, 46.0, h11(q * 3.1)));
    float tir = smoothstep(0.62, 1.0, h11(b * 1.73 + q * 17.9)) * (h11(b * 5.1 + q * 2.3) - 0.5) * 0.14;
    float lin = step(0.985, h11(floor(uv.y * uRes.y * 0.5) + q * 7.7)) * 0.02;   // rayitas finas sueltas
    uv.x += (tir + lin + 0.012 * sin(uv.y * 9.0 + uT * 40.0)) * reb;
  }

  // ---- barril (~2,5 %), escalado para que las esquinas caigan justo en el borde: sin negro ----
  vec2 p = vUv - 0.5; p.x *= asp;
  float r2 = dot(p, p) / (0.25 * (asp * asp + 1.0));   // 0 en el centro, 1 en la esquina
  float k = 0.025 * opt;
  vec2 suv = 0.5 + (uv - 0.5) * (1.0 + k * r2) / (1.0 + k);

  // ---- muestra: con rebobinado, desenfoque horizontal + croma separado ----
  vec3 c;
  if (reb > 0.001) {
    float ca = 0.007 * reb, sp = 0.045 * reb, ws = 0.0;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 9; i++) {
      float f = float(i) / 8.0 - 0.5, w = 1.0 - abs(f) * 1.2;
      vec2 o = suv + vec2(f * sp, 0.0);
      acc += vec3(tx(o + vec2(ca, 0.0)).r, tx(o).g, tx(o - vec2(ca, 0.0)).b) * w;
      ws += w;
    }
    c = acc / ws;
  } else c = tx(suv);

  // ---- anamórfico: halación cálida y destellos horizontales en las altas luces ----
  if (opt > 0.001) {
    vec2 px = 1.0 / uRes;
    vec3 hal = vec3(0.0);
    for (int i = 0; i < 12; i++) {               // 12 taps en dos anillos alternados
      float a = float(i) * 0.5236 + 0.3, rr = (mod(float(i), 2.0) < 0.5 ? 10.0 : 22.0) * esc;
      vec3 s = tx(suv + vec2(cos(a), sin(a)) * rr * px);
      hal += s * smoothstep(0.7, 1.4, lum(s));
    }
    c += hal / 12.0 * vec3(1.0, 0.4, 0.15) * 1.3 * opt;

    // streak ancho: taps más densos cerca del centro y corridos por un ruido fijo por píxel (sin fantasmas en fila)
    float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    vec3 st = vec3(0.0);
    for (int i = 0; i < 24; i++) {
      float t = (float(i) + ign) / 24.0, f = t * t;               // 0..1, cuadrático
      float sg = mod(float(i), 2.0) < 0.5 ? 1.0 : -1.0;
      vec3 s = tx(suv + vec2(sg * f * 0.34, 0.0));
      float g = max(lum(s) - 0.9, 0.0), w = exp(-f * 4.0);
      st += mix(vec3(1.0, 0.68, 0.32), vec3(0.3, 0.58, 1.0), smoothstep(0.02, 0.35, f)) * g * w;   // ámbar adentro, azul afuera
    }
    c += st * 0.11 * opt;
  }

  // ---- gradación ----
  float L = lum(c);
  vec3 pres = c * vec3(0.975, 1.0, 1.02);                          // presente: apenas verde azulado
  pres *= mix(vec3(1.0), vec3(0.93, 1.0, 1.06), (1.0 - smoothstep(0.0, 0.18, L)) * 0.7);   // sombras teal, sin aplastar
  vec3 amb = c * vec3(1.08, 0.98, 0.82) + vec3(0.014, 0.008, 0.002) * (1.0 - smoothstep(0.0, 0.35, L));   // ámbar y crema + lift cálido
  amb = max(mix(vec3(lum(amb)), amb, 1.18), 0.0);
  vec3 frioC = mix(vec3(lum(pres)), pres, 0.6) * vec3(0.96, 1.0, 1.05);   // el recuerdo que se enfría: gris azulado
  c = mix(pres, mix(amb, frioC, smoothstep(0.0, 1.0, fr)), rec);

  // ---- viñeta: leve en el presente, marcada en el recuerdo ----
  c *= 1.0 - mix(0.12, 0.5 * (1.0 - 0.5 * fr), rec) * smoothstep(0.25, 1.0, r2);

  // ---- rebobinado: destello que barre la pantalla de arriba abajo + brillo ----
  if (reb > 0.001) {
    float dy = (vUv.y - (1.15 - fract(uT * 1.6) * 1.3)) * uRes.y / esc;
    c += (vec3(0.75, 0.9, 1.0) * exp(-dy * dy / 18.0) * 1.6 + vec3(0.3, 0.55, 1.0) * exp(-dy * dy / 2400.0) * 0.3) * reb;
    c *= 1.0 + 0.18 * reb;
  }

  // ---- destello de «ahora»: línea de borde a borde, núcleo blanco cálido y halo azul-cian ----
  if (uFlare > 0.001) {
    float dy = (vUv.y - FLARE_Y) * uRes.y / esc, d2 = dy * dy;
    float borde = 0.55 + 0.45 * (1.0 - pow(abs(vUv.x - 0.5) * 2.0, 2.0));
    vec3 fl = vec3(1.0, 0.92, 0.78) * exp(-d2 / 8.0) * 3.0
            + vec3(0.25, 0.65, 1.0) * (exp(-d2 / 162.0) * 0.9 + exp(-d2 / 3200.0) * 0.18);
    c += fl * borde * uFlare;
  }

  gl_FragColor = vec4(max(c, 0.0), 1.0);
}`;

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export function crearPost({ THREE, composer, W, H }) {
  const pase = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uRec: { value: 0 }, uFrio: { value: 0 }, uReb: { value: 0 },
      uFlare: { value: 0 }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(W, H) } },
    vertexShader: VERT, fragmentShader: FRAG,
  });
  const u = pase.uniforms;   // ShaderPass clona los uniforms: hay que tocar los suyos
  pase.setSize = (w, h) => u.uRes.value.set(w, h);   // el composer lo llama con el pixel ratio aplicado
  // antes del OutputPass (lineal HDR); en vivo hay un FXAA detrás del OutputPass, así que se busca por nombre
  const iOut = composer.passes.findIndex((p) => p.constructor && p.constructor.name === 'OutputPass');
  composer.insertPass(pase, iOut >= 0 ? iOut : composer.passes.length - 1);

  const cl = (v) => Math.min(1, Math.max(0, +v || 0));
  function fijar({ recuerdo = 0, frio = 0, rebob = 0, flare = 0, t = 0 } = {}) {
    u.uRec.value = cl(recuerdo); u.uFrio.value = cl(frio); u.uReb.value = cl(rebob); u.uFlare.value = cl(flare); u.uT.value = +t || 0;
  }
  return { pase, fijar };
}
