<template>
  <div 
    v-if="isVisible" 
    ref="overlayRef"
    class="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[9999] overflow-hidden text-white"
  >
    <!-- Grid pattern background overlay -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03]"></div>

    <div class="space-y-8 flex flex-col items-center text-center relative z-10">
      <!-- Pulsing Brand Logo Icon -->
      <div 
        ref="logoRef" 
        class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-black text-2xl shadow-xl shadow-brand-primary/20 scale-0"
      >
        A
      </div>

      <!-- Progressive loading bar -->
      <div class="w-48 h-[2px] bg-slate-900 rounded-full overflow-hidden relative border border-white/[0.03]">
        <div ref="progressRef" class="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
      </div>

      <!-- Text: Build. Learn. Grow. -->
      <div class="flex items-center gap-2.5 text-lg font-bold tracking-wider">
        <span ref="t1Ref" class="opacity-0 translate-y-3 block">Build.</span>
        <span ref="t2Ref" class="opacity-0 translate-y-3 block">Learn.</span>
        <span ref="t3Ref" class="opacity-0 translate-y-3 block">Grow.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { gsap } from "gsap";

const isVisible = ref(true);
const logoRef = ref<HTMLElement | null>(null);
const progressRef = ref<HTMLElement | null>(null);
const t1Ref = ref<HTMLElement | null>(null);
const t2Ref = ref<HTMLElement | null>(null);
const t3Ref = ref<HTMLElement | null>(null);
const overlayRef = ref<HTMLElement | null>(null);

const emit = defineEmits(["loaded"]);

onMounted(() => {
  // Check if already preloaded in this session to prevent fatigue
  if (sessionStorage.getItem("preloaded") === "true") {
    isVisible.value = false;
    emit("loaded");
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      sessionStorage.setItem("preloaded", "true");
      // Fade out overlay
      gsap.to(overlayRef.value, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          isVisible.value = false;
          emit("loaded");
        }
      });
    }
  });

  // Animation timeline (total time is ~1.8 seconds)
  tl.to(logoRef.value, {
    scale: 1,
    rotation: 360,
    duration: 0.6,
    ease: "back.out(1.5)"
  })
  .to(progressRef.value, {
    width: "100%",
    duration: 0.8,
    ease: "power1.inOut"
  }, "-=0.2")
  .to([t1Ref.value, t2Ref.value, t3Ref.value], {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.4,
    ease: "power2.out"
  }, "-=0.5")
  .to(logoRef.value, {
    scale: 0.9,
    duration: 0.2,
    yoyo: true,
    repeat: 1
  }, "-=0.2");
});
</script>
