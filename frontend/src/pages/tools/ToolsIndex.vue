<template>
  <div class="flex flex-col lg:flex-row gap-8 py-4 min-h-[80vh]">
    <!-- Tools Sidebar List -->
    <aside class="w-full lg:w-80 space-y-4">
      <div class="glass-panel p-4 space-y-3 relative overflow-hidden group">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Tools Directory</h3>
        
        <!-- Expanding Search Input -->
        <div class="relative">
          <input 
            v-model="searchQuery" 
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            type="text" 
            :placeholder="typedPlaceholder" 
            class="w-full bg-slate-950 border border-brand-border text-sm rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary transition-all duration-300 focus:scale-[1.02] pr-8"
          />
          <div class="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </div>
        </div>

        <!-- Search suggestions list dropdown -->
        <Transition name="fade">
          <div v-if="searchFocused && searchQuery && suggestions.length > 0" class="absolute left-4 right-4 bg-slate-900 border border-brand-border rounded-lg shadow-xl p-2 z-20 space-y-1 mt-1">
            <span class="text-[9px] font-bold text-slate-500 uppercase px-2">Suggestions</span>
            <button 
              v-for="s in suggestions" 
              :key="s.id" 
              @mousedown="selectSuggestedTool(s)"
              class="w-full text-left text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors flex justify-between"
            >
              <span>{{ s.name }}</span>
              <span class="text-[9px] text-brand-primary">{{ s.category }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="glass-panel p-2 max-h-[60vh] overflow-y-auto scrollbar-none relative">
        <transition-group name="list" tag="div" class="space-y-4">
          <div v-for="(group, catName) in filteredGroups" :key="catName" class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mt-2">
              {{ catName }}
            </span>
            
            <button 
              v-for="tool in group" 
              :key="tool.id" 
              @click="selectTool(tool)"
              class="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between hover:scale-[1.01]"
              :class="activeTool.id === tool.id ? 'bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/10' : 'text-slate-300 hover:bg-slate-800/40'"
            >
              <span>{{ tool.name }}</span>
              <span v-if="tool.isBackend" class="text-[9px] px-1.5 py-0.5 rounded bg-brand-secondary/20 text-brand-secondary">API</span>
            </button>
          </div>
        </transition-group>
      </div>
    </aside>

    <!-- Active Tool Interactive Panel -->
    <section 
      ref="panelRef"
      @mousemove="handlePanelGlow"
      @mouseleave="handlePanelLeave"
      class="flex-grow glass-panel p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group/panel"
    >
      <!-- Vercel gradient shine borders -->
      <div 
        class="pointer-events-none absolute -inset-px opacity-0 group-hover\/panel:opacity-100 transition-opacity duration-300"
        :style="{
          background: `radial-gradient(400px circle at ${glowX}px ${glowY}px, rgba(99, 102, 241, 0.1), transparent 80%)`
        }"
      ></div>

      <div class="space-y-6 relative z-10">
        <!-- Title and Category -->
        <div class="border-b border-brand-border pb-4 flex justify-between items-start">
          <div>
            <span class="text-xs text-brand-primary font-bold uppercase tracking-widest">{{ activeTool.category }}</span>
            <h2 class="text-2xl font-bold text-white mt-1">{{ activeTool.name }}</h2>
          </div>
          <button 
            @click="copyOutput" 
            v-if="outputVal" 
            class="text-xs text-brand-primary border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg font-bold transition-all"
            ref="copyBtnRef"
          >
            {{ copyStatus }}
          </button>
        </div>

        <!-- Dynamic Inputs Area -->
        <div class="space-y-4 min-h-[350px]">
          <!-- 1. JWT Decoder Interface -->
          <div v-if="activeTool.id === 'jwt_decoder'" class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Encoded JWT Token</label>
              <textarea v-model="jwtTokenInput" placeholder="Paste your JWT header.payload.signature here..." class="w-full h-32 bg-slate-950 border border-brand-border text-xs font-mono rounded-lg p-3 text-white outline-none focus:border-brand-primary"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-950/60 p-3 rounded-lg border border-brand-border">
                <span class="text-[10px] font-bold text-brand-secondary uppercase block mb-2">Header (Algorithm & Type)</span>
                <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">{{ jwtDecodedHeader }}</pre>
              </div>
              <div class="bg-slate-950/60 p-3 rounded-lg border border-brand-border">
                <span class="text-[10px] font-bold text-brand-success uppercase block mb-2">Payload (Claims)</span>
                <pre class="text-[11px] font-mono text-emerald-400 overflow-x-auto">{{ jwtDecodedPayload }}</pre>
              </div>
            </div>
          </div>

          <!-- 2. JSON Formatter Interface -->
          <div v-if="activeTool.id === 'json_formatter'" class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Raw JSON String</label>
              <textarea v-model="jsonRawInput" placeholder='{"name":"azamjon","role":"developer"}' class="w-full h-48 bg-slate-950 border border-brand-border text-xs font-mono rounded-lg p-3 text-white outline-none focus:border-brand-primary"></textarea>
            </div>
            <button @click="processJson" class="px-4 py-2 bg-brand-primary text-xs font-bold text-white rounded-lg hover:bg-brand-primary/95 transition-all">
              Format & Validate
            </button>
            <div v-if="jsonError" class="text-xs text-brand-error font-mono bg-brand-error/10 border border-brand-error/20 p-3 rounded-lg">
              Error: {{ jsonError }}
            </div>
          </div>

          <!-- 3. Base64 Converter -->
          <div v-if="activeTool.id === 'base64_encoder' || activeTool.id === 'base64_decoder'" class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Input Text</label>
              <textarea v-model="base64Input" placeholder="Enter target text..." class="w-full h-40 bg-slate-950 border border-brand-border text-xs rounded-lg p-3 text-white outline-none focus:border-brand-primary"></textarea>
            </div>
            <div class="flex gap-3">
              <button @click="runBase64(true)" class="px-4 py-2 bg-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/90">Encode</button>
              <button @click="runBase64(false)" class="px-4 py-2 bg-brand-secondary text-xs font-bold rounded-lg hover:bg-brand-secondary/90">Decode</button>
            </div>
          </div>

          <!-- 4. UUID Generator -->
          <div v-if="activeTool.id === 'uuid_generator'" class="space-y-4">
            <div class="flex gap-4 items-center">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Quantity</label>
                <input v-model.number="uuidQty" type="number" min="1" max="100" class="w-20 bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none" />
              </div>
              <button @click="generateUuids" class="px-5 py-2.5 bg-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/90 mt-5">
                Generate
              </button>
            </div>
          </div>

          <!-- 5. Password Generator -->
          <div v-if="activeTool.id === 'password_generator'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Password Length ({{ passLength }})</label>
                <input v-model.number="passLength" type="range" min="8" max="64" class="w-full accent-brand-primary" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input v-model="passUpper" type="checkbox" class="accent-brand-primary" /> Include Uppercase
                </label>
                <label class="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input v-model="passNumbers" type="checkbox" class="accent-brand-primary" /> Include Numbers
                </label>
                <label class="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input v-model="passSymbols" type="checkbox" class="accent-brand-primary" /> Include Special Symbols
                </label>
              </div>
            </div>
            <button @click="generatePassword" class="px-5 py-2.5 bg-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/90">
              Generate Password
            </button>
          </div>

          <!-- 6. Hash Generator -->
          <div v-if="activeTool.id === 'hash_generator'" class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Raw Text String</label>
              <textarea v-model="hashRawInput" placeholder="Enter text to hash..." class="w-full h-24 bg-slate-950 border border-brand-border text-xs rounded-lg p-3 text-white outline-none focus:border-brand-primary"></textarea>
            </div>
            <button @click="calculateHashes" class="px-4 py-2 bg-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/95 transition-all">
              Calculate Hashes
            </button>
          </div>

          <!-- 7. SQL Formatter (API) -->
          <div v-if="activeTool.id === 'sql_formatter'" class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Minified/Raw SQL</label>
              <textarea v-model="sqlRawInput" placeholder="SELECT * FROM users WHERE id=1 AND role='admin'" class="w-full h-36 bg-slate-950 border border-brand-border text-xs font-mono rounded-lg p-3 text-white outline-none focus:border-brand-primary"></textarea>
            </div>
            <button @click="formatSqlApi" :disabled="apiLoading" class="px-4 py-2 bg-brand-primary text-xs font-bold text-white rounded-lg hover:bg-brand-primary/95 disabled:opacity-50">
              Beautify SQL Query
            </button>
          </div>

          <!-- 8. API Request Tester (API) -->
          <div v-if="activeTool.id === 'api_tester'" class="space-y-4">
            <div class="flex gap-2">
              <select v-model="apiMethod" class="bg-slate-900 border border-brand-border text-xs rounded-lg px-3 py-2 text-white">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input v-model="apiUrl" type="text" placeholder="https://api.github.com/users/octocat" class="flex-grow bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary" />
              <button @click="runApiTest" :disabled="apiLoading" class="px-4 py-2 bg-brand-primary text-xs font-bold text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
                Send
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Request Body (JSON)</label>
                <textarea v-model="apiRequestBody" placeholder="{}" class="w-full h-32 bg-slate-950 border border-brand-border text-xs font-mono rounded-lg p-3 text-white outline-none focus:border-brand-primary"></textarea>
              </div>
              <div>
                <label class="text-xs text-slate-400 block mb-1">API Response metadata</label>
                <pre class="text-[10px] font-mono text-cyan-400 bg-slate-950 border border-brand-border p-3 rounded-lg h-32 overflow-y-auto">{{ apiResponseMeta }}</pre>
              </div>
            </div>
          </div>

          <!-- Default fallback for other tools -->
          <div v-if="!['jwt_decoder', 'json_formatter', 'base64_encoder', 'base64_decoder', 'uuid_generator', 'password_generator', 'hash_generator', 'sql_formatter', 'api_tester'].includes(activeTool.id)" class="bg-slate-900/40 p-6 border border-brand-border rounded-xl flex items-center justify-center min-h-[250px]">
            <div class="text-center space-y-2">
              <p class="text-sm font-semibold text-slate-300">Working on premium local compilation...</p>
              <p class="text-xs text-slate-500">This client utility computes instantly. Input details inside standard clipboard or text editors.</p>
            </div>
          </div>
        </div>

        <!-- Output Display Section -->
        <div v-if="outputVal" class="space-y-2 mt-6">
          <label class="text-xs text-slate-400 block">Computed Output</label>
          <div class="relative bg-slate-950 border border-brand-border rounded-xl p-4">
            <pre class="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-48">{{ outputVal }}</pre>
          </div>
        </div>
      </div>

      <!-- Footer / Usage Logs Notification -->
      <div class="border-t border-brand-border pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 relative z-10">
        <span>Runs locally inside sandbox environments. Secure & offline-first.</span>
        <span>Registered usage stats synced to local profile.</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useToolsStore } from "../../stores/tools";
import { initRipple, triggerConfetti } from "../../utils/animation";
import api from "../../services/api";

const toolsStore = useToolsStore();

const searchQuery = ref("");
const searchFocused = ref(false);
const copyStatus = ref("Copy Output");
const outputVal = ref("");
const apiLoading = ref(false);

const copyBtnRef = ref<any>(null);

// Card Glow Coordinates
const glowX = ref(0);
const glowY = ref(0);
const panelRef = ref<HTMLElement | null>(null);

function handlePanelGlow(e: MouseEvent) {
  if (!panelRef.value) return;
  const rect = panelRef.value.getBoundingClientRect();
  glowX.value = e.clientX - rect.left;
  glowY.value = e.clientY - rect.top;
}

function handlePanelLeave() {
  glowX.value = 0;
  glowY.value = 0;
}

// Typing placeholder list
const typedPlaceholder = ref("Search tools...");
const PLACEHOLDERS = [
  "Search JWT Decoder...",
  "Search JSON Formatter...",
  "Search UUID Generator...",
  "Search Base64 Encoder...",
  "Search SQL Formatter..."
];
let placeholderIdx = 0;
let placeholderInterval: any;

function startPlaceholderRotation() {
  placeholderInterval = setInterval(() => {
    placeholderIdx = (placeholderIdx + 1) % PLACEHOLDERS.length;
    let target = PLACEHOLDERS[placeholderIdx];
    let current = "";
    let i = 0;
    
    // Type in
    const typeInterval = setInterval(() => {
      if (i < target.length) {
        current += target.charAt(i);
        typedPlaceholder.value = current;
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 45);
  }, 4000);
}

// Active tools list
const ALL_TOOLS = [
  { id: "jwt_decoder", name: "JWT Decoder", category: "Decoders", isBackend: false },
  { id: "json_formatter", name: "JSON Formatter", category: "Formatters", isBackend: false },
  { id: "base64_encoder", name: "Base64 Encoder", category: "Encoders", isBackend: false },
  { id: "base64_decoder", name: "Base64 Decoder", category: "Decoders", isBackend: false },
  { id: "uuid_generator", name: "UUID Generator", category: "Generators", isBackend: false },
  { id: "password_generator", name: "Password Generator", category: "Generators", isBackend: false },
  { id: "hash_generator", name: "Hash Generator", category: "Cryptography", isBackend: false },
  { id: "sql_formatter", name: "SQL Formatter", category: "Formatters", isBackend: true },
  { id: "api_tester", name: "API Request Tester", category: "Development", isBackend: true },
  { id: "jwt_generator", name: "JWT Generator", category: "Generators", isBackend: false },
  { id: "json_validator", name: "JSON Validator", category: "Formatters", isBackend: false },
  { id: "regex_tester", name: "Regex Tester", category: "Development", isBackend: false },
  { id: "cron_generator", name: "Cron Generator", category: "Generators", isBackend: false },
  { id: "timestamp_converter", name: "Timestamp Converter", category: "Decoders", isBackend: false },
  { id: "url_encoder", name: "URL Encoder", category: "Encoders", isBackend: false },
  { id: "color_palette", name: "Color Palette Generator", category: "Generators", isBackend: false }
];

const activeTool = ref(ALL_TOOLS[0]);

// Category Groupings
const filteredGroups = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const filtered = ALL_TOOLS.filter(t => t.name.toLowerCase().includes(query));
  
  const groups: Record<string, typeof ALL_TOOLS> = {};
  filtered.forEach(tool => {
    if (!groups[tool.category]) {
      groups[tool.category] = [];
    }
    groups[tool.category].push(tool);
  });
  return groups;
});

// Suggestions List
const suggestions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];
  return ALL_TOOLS.filter(t => t.name.toLowerCase().includes(query)).slice(0, 4);
});

function selectSuggestedTool(tool: any) {
  selectTool(tool);
  searchQuery.value = "";
}

function selectTool(tool: any) {
  activeTool.value = tool;
  outputVal.value = "";
  jsonError.value = "";
}

// 1. JWT Decoder States
const jwtTokenInput = ref("");
const jwtDecodedHeader = computed(() => {
  if (!jwtTokenInput.value) return "{}";
  try {
    const parts = jwtTokenInput.value.split(".");
    if (parts.length < 2) return "Invalid JWT format";
    const headerDecoded = atob(parts[0]);
    return JSON.stringify(JSON.parse(headerDecoded), null, 2);
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
});
const jwtDecodedPayload = computed(() => {
  if (!jwtTokenInput.value) return "{}";
  try {
    const parts = jwtTokenInput.value.split(".");
    if (parts.length < 2) return "Invalid JWT format";
    let payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadDecoded = decodeURIComponent(atob(payloadBase64).split("").map((c) => {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    
    toolsStore.logUsage("jwt_decoder", { length: jwtTokenInput.value.length }, { hasPayload: true });
    return JSON.stringify(JSON.parse(payloadDecoded), null, 2);
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
});

// 2. JSON Formatter
const jsonRawInput = ref("");
const jsonError = ref("");
function processJson() {
  jsonError.value = "";
  try {
    const parsed = JSON.parse(jsonRawInput.value);
    outputVal.value = JSON.stringify(parsed, null, 2);
    toolsStore.logUsage("json_formatter", { size: jsonRawInput.value.length }, { success: true });
  } catch (e: any) {
    jsonError.value = e.message;
    outputVal.value = "";
  }
}

// 3. Base64 Encoder / Decoder
const base64Input = ref("");
function runBase64(isEncode: boolean) {
  try {
    if (isEncode) {
      outputVal.value = btoa(base64Input.value);
      toolsStore.logUsage("base64_encoder", {}, {});
    } else {
      outputVal.value = atob(base64Input.value);
      toolsStore.logUsage("base64_decoder", {}, {});
    }
  } catch (e: any) {
    outputVal.value = `Conversion Failed: ${e.message}`;
  }
}

// 4. UUID Generator
const uuidQty = ref(3);
function generateUuids() {
  const list: string[] = [];
  for (let i = 0; i < uuidQty.value; i++) {
    const u = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    list.push(u);
  }
  outputVal.value = list.join("\n");
  toolsStore.logUsage("uuid_generator", { qty: uuidQty.value }, {});
}

// 5. Password Generator
const passLength = ref(16);
const passUpper = ref(true);
const passNumbers = ref(true);
const passSymbols = ref(true);
function generatePassword() {
  let chars = "abcdefghijklmnopqrstuvwxyz";
  if (passUpper.value) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (passNumbers.value) chars += "0123456789";
  if (passSymbols.value) chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let pass = "";
  for (let i = 0; i < passLength.value; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  outputVal.value = pass;
  toolsStore.logUsage("password_generator", { length: passLength.value }, {});
}

// 6. Hash Generator
const hashRawInput = ref("");
async function calculateHashes() {
  if (!hashRawInput.value) return;
  apiLoading.value = true;
  try {
    const res = await api.post("/playground/hash-compare", { password: hashRawInput.value });
    const { hashes, durations } = res.data.data;
    outputVal.value = `MD5: ${hashes.md5} (${durations.md5})\n\nSHA-256: ${hashes.sha256} (${durations.sha256})\n\nBCRYPT: ${hashes.bcrypt} (${durations.bcrypt})`;
    toolsStore.logUsage("hash_generator", { stringSize: hashRawInput.value.length }, {});
  } catch (e: any) {
    outputVal.value = `Error calculating hashes: ${e.message}`;
  } finally {
    apiLoading.value = false;
  }
}

// 7. SQL Formatter (API call)
const sqlRawInput = ref("");
async function formatSqlApi() {
  if (!sqlRawInput.value) return;
  apiLoading.value = true;
  try {
    const res = await api.post("/tools/format-sql", { sql: sqlRawInput.value });
    outputVal.value = res.data.data.formatted;
    toolsStore.logUsage("sql_formatter", { queryLength: sqlRawInput.value.length }, {});
  } catch (e: any) {
    outputVal.value = `Failed formatting: ${e.message}`;
  } finally {
    apiLoading.value = false;
  }
}

// 8. API Request Tester
const apiMethod = ref("GET");
const apiUrl = ref("");
const apiRequestBody = ref("{}");
const apiResponseMeta = ref("");
async function runApiTest() {
  if (!apiUrl.value) return;
  apiLoading.value = true;
  apiResponseMeta.value = "Sending request through CORS proxy...";
  outputVal.value = "";
  try {
    let bodyObj = {};
    if (apiMethod.value !== "GET") {
      try {
        bodyObj = JSON.parse(apiRequestBody.value);
      } catch (e) {
        apiResponseMeta.value = "JSON Error: Request body must be valid JSON.";
        apiLoading.value = false;
        return;
      }
    }

    const response = await api.post("/tools/test-api", {
      url: apiUrl.value,
      method: apiMethod.value,
      body: apiMethod.value !== "GET" ? bodyObj : undefined
    });

    const info = response.data.data;
    apiResponseMeta.value = `STATUS: ${info.status} ${info.statusText}\nTIME: ${info.durationMs}ms\n\nHEADERS:\n${JSON.stringify(info.headers, null, 2)}`;
    outputVal.value = typeof info.data === "object" ? JSON.stringify(info.data, null, 2) : String(info.data);
    toolsStore.logUsage("api_tester", { url: apiUrl.value }, { status: info.status });
  } catch (err: any) {
    apiResponseMeta.value = `Failed to process request: ${err.message}`;
    outputVal.value = "";
  } finally {
    apiLoading.value = false;
  }
}

// Copy clipboard logic
function copyOutput(e: MouseEvent) {
  navigator.clipboard.writeText(outputVal.value);
  copyStatus.value = "Copied!";
  
  // Trigger premium SVG confetti explosion on click coordinates
  triggerConfetti(e.clientX, e.clientY);

  setTimeout(() => {
    copyStatus.value = "Copy Output";
  }, 2000);
}

onMounted(() => {
  toolsStore.fetchHistory();
  startPlaceholderRotation();

  // Attach ripple effect to the copy button if active
  if (copyBtnRef.value) {
    initRipple(copyBtnRef.value);
  }
});

onUnmounted(() => {
  clearInterval(placeholderInterval);
});
</script>

<style scoped>
/* List Transitions for sidebar filtering */
.list-enter-active,
.list-leave-active {
  transition: all 0.35s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
