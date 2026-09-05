/**
 * Particle universe shaders. Eight target shapes live in vertex attributes;
 * the vertex stage blends between two of them with per-particle stagger and a
 * mid-transit turbulence so morphs feel organic rather than linear.
 */
export const particleVertex = /* glsl */ `
  attribute vec3 aShape0;
  attribute vec3 aShape1;
  attribute vec3 aShape2;
  attribute vec3 aShape3;
  attribute vec3 aShape4;
  attribute vec3 aShape5;
  attribute vec3 aShape6;
  attribute vec3 aShape7;
  attribute vec4 aSeed;

  uniform float uFrom;
  uniform float uTo;
  uniform float uMix;
  uniform float uTime;
  uniform float uScale;
  uniform float uSpin;
  uniform float uTurbulence;
  uniform float uDensity;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMotion;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform vec3 uAccent;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vCore;

  vec3 pick(float i) {
    if (i < 0.5) return aShape0;
    if (i < 1.5) return aShape1;
    if (i < 2.5) return aShape2;
    if (i < 3.5) return aShape3;
    if (i < 4.5) return aShape4;
    if (i < 5.5) return aShape5;
    if (i < 6.5) return aShape6;
    return aShape7;
  }

  void main() {
    // Density culling: particles whose seed exceeds the density are moved off-screen.
    if (aSeed.x > uDensity) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vAlpha = 0.0;
      vColor = vec3(0.0);
      vCore = 0.0;
      return;
    }

    vec3 a = pick(uFrom);
    vec3 b = pick(uTo);

    // Per-particle stagger: each particle departs within the first 30% of the mix.
    float stagger = clamp((uMix - aSeed.y * 0.3) / 0.7, 0.0, 1.0);
    float t = stagger * stagger * (3.0 - 2.0 * stagger);
    vec3 p = mix(a, b, t);

    // Transit turbulence peaks in the middle of the morph.
    float transit = sin(t * 3.14159265);
    vec3 scatter = (aSeed.xyz - 0.5) * 2.0;
    p += scatter * transit * 1.4 * uMotion;

    // Additional turbulence (404 destabilisation, transitions).
    p += uTurbulence * scatter * (0.6 + 0.4 * sin(uTime * 2.2 + aSeed.w * 6.2831));

    // Idle drift – small, slow, seed-offset so it never reads as a loop.
    float drift = 0.05 * uMotion;
    p += drift * vec3(
      sin(uTime * 0.55 + aSeed.w * 6.2831),
      cos(uTime * 0.47 + aSeed.x * 6.2831),
      sin(uTime * 0.39 + aSeed.y * 6.2831)
    );

    // Slow orbital rotation about Y.
    float ang = uTime * 0.045 * uSpin * uMotion;
    float c = cos(ang);
    float s = sin(ang);
    p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);

    p *= uScale;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Pointer repulsion in view space, scaled by depth so it reads consistently.
    float depthScale = -mv.z / 9.0;
    vec2 d = mv.xy - uPointer.xy * depthScale;
    float dist = length(d);
    float radius = 1.5 * depthScale;
    if (dist < radius && dist > 0.0001) {
      float push = (radius - dist) / radius;
      mv.xy += normalize(d) * push * push * 0.55 * uPointerStrength;
    }

    gl_Position = projectionMatrix * mv;

    float sizeVar = 0.55 + aSeed.w * 1.35;
    gl_PointSize = uSize * sizeVar * uPixelRatio * (8.5 / max(0.5, -mv.z));

    // Depth fade: far particles dim, very near particles dim slightly too.
    float depthFade = smoothstep(-22.0, -4.0, mv.z) * (1.0 - smoothstep(-3.0, -0.6, mv.z) * 0.7);
    vAlpha = depthFade * (0.35 + 0.65 * aSeed.z);
    vCore = step(0.86, aSeed.w);
    vColor = mix(vec3(0.92, 0.95, 1.0), uAccent, aSeed.y * 0.85);
  }
`;

export const particleFragment = /* glsl */ `
  precision highp float;

  uniform float uOpacity;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vCore;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.18, 0.0, d) * vCore;
    float alpha = (soft * 0.55 + core * 0.9) * vAlpha * uOpacity;
    gl_FragColor = vec4(vColor * (0.85 + core * 0.6), alpha);
  }
`;
