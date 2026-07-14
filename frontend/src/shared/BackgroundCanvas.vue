<template>
  <div>
    <!-- Interactive Background Stars Canvas -->
    <canvas ref="canvasRef" class="fixed inset-0 w-full h-full -z-50 pointer-events-none opacity-40 transition-opacity duration-1000"></canvas>
    
    <!-- Subtle parallax developer grid layer -->
    <div 
      ref="gridRef"
      class="fixed inset-0 w-[110vw] h-[110vh] -left-[5vw] -top-[5vw] pointer-events-none -z-50 opacity-[0.03] transition-transform duration-300 ease-out bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:5rem_5rem]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particlePoints: THREE.Points;
let animationFrameId: number;

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let isMobile = false;

function handleMouseMove(event: MouseEvent) {
  if (isMobile) return;
  
  mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
  mouseY = (event.clientY - window.innerHeight / 2) * 0.05;

  // Parallax the CSS Grid layer slightly
  if (gridRef.value) {
    const gx = -(event.clientX - window.innerWidth / 2) * 0.015;
    const gy = -(event.clientY - window.innerHeight / 2) * 0.015;
    gridRef.value.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
  }
}

function handleResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {
  if (!canvasRef.value) return;

  // Detect low-performance / mobile bounds
  isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;

  // 1. Setup Scene and Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  // 2. Setup Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: !isMobile // disable anti-alias on mobile for max FPS
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

  // 3. Create Particles
  const particleCount = isMobile ? 120 : 350;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Curated indigo/violet palette
  const color1 = new THREE.Color("#6366f1");
  const color2 = new THREE.Color("#a855f7");

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;

    const ratio = Math.random();
    const mixedColor = new THREE.Color().lerpColors(color1, color2, ratio);
    colors[i] = mixedColor.r;
    colors[i + 1] = mixedColor.g;
    colors[i + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Create subtle circular texture
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
  }

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: isMobile ? 1.8 : 2.5,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particlePoints = new THREE.Points(geometry, material);
  scene.add(particlePoints);

  // 4. Register Listeners
  if (!isMobile) {
    window.addEventListener("mousemove", handleMouseMove);
  }
  window.addEventListener("resize", handleResize);

  // 5. Animation Loop
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    // Dynamic slow rotation
    particlePoints.rotation.y += isMobile ? 0.0003 : 0.0005;
    particlePoints.rotation.x += isMobile ? 0.0001 : 0.0002;

    if (!isMobile) {
      // Mouse tracking inertia
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      particlePoints.position.x = targetX * 0.12;
      particlePoints.position.y = -targetY * 0.12;
    }

    renderer.render(scene, camera);
  };

  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("resize", handleResize);
  if (renderer) renderer.dispose();
});
</script>
