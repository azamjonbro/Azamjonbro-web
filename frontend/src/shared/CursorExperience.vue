<template>
  <div v-if="isEnabled" class="hidden md:block pointer-events-none">
    <!-- Center Dot -->
    <div 
      ref="dotRef" 
      class="custom-cursor-dot" 
      :style="{ display: visible ? 'block' : 'none' }"
    ></div>
    <!-- Outer Follower Ring -->
    <div 
      ref="followerRef" 
      class="custom-cursor-follower"
      :style="{ display: visible ? 'flex' : 'none' }"
    >
      <span v-if="hoverLabel" class="opacity-0 cursor-label text-[7px] uppercase font-bold tracking-widest text-white leading-none scale-50">{{ hoverLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";

const isEnabled = ref(false);
const visible = ref(false);
const hoverLabel = ref("");

const dotRef = ref<HTMLElement | null>(null);
const followerRef = ref<HTMLElement | null>(null);

let mouseX = 0;
let mouseY = 0;

function handleMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  visible.value = true;

  // Render cursor dot immediately
  if (dotRef.value) {
    gsap.to(dotRef.value, {
      x: mouseX,
      y: mouseY,
      duration: 0,
      overwrite: "auto"
    });
  }

  // Render follower ring with small inertia lag
  if (followerRef.value) {
    gsap.to(followerRef.value, {
      x: mouseX,
      y: mouseY,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto"
    });
  }
}

function handleMouseLeaveWindow() {
  visible.value = false;
}

function handleMouseEnterWindow() {
  visible.value = true;
}

function handleMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const interactiveEl = target.closest("a, button, [role='button'], .glass-card, [data-cursor-label]");
  
  if (interactiveEl && followerRef.value) {
    const label = interactiveEl.getAttribute("data-cursor-label") || "";
    hoverLabel.value = label;

    // Scale follower ring
    gsap.to(followerRef.value, {
      width: label ? 54 : 44,
      height: label ? 54 : 44,
      backgroundColor: "rgba(99, 102, 241, 0.15)",
      borderColor: "#6366f1",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto"
    });

    if (label) {
      // Fade in text inside the ring
      setTimeout(() => {
        const textSpan = followerRef.value?.querySelector(".cursor-label");
        if (textSpan) {
          gsap.to(textSpan, {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "power1.out"
          });
        }
      }, 50);
    }
  }
}

function handleMouseOut(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const interactiveEl = target.closest("a, button, [role='button'], .glass-card, [data-cursor-label]");
  
  if (interactiveEl && followerRef.value) {
    hoverLabel.value = "";
    gsap.to(followerRef.value, {
      width: 32,
      height: 32,
      backgroundColor: "rgba(99, 102, 241, 0)",
      borderColor: "rgba(99, 102, 241, 0.5)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto"
    });
  }
}

onMounted(() => {
  // Disable custom cursor on touch/mobile devices or low-performance clients
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  isEnabled.value = !isTouchDevice;

  if (isEnabled.value) {
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
  }
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseleave", handleMouseLeaveWindow);
  document.removeEventListener("mouseenter", handleMouseEnterWindow);
  window.removeEventListener("mouseover", handleMouseOver);
  window.removeEventListener("mouseout", handleMouseOut);
});
</script>
