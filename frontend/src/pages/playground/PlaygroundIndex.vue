<template>
  <div class="space-y-8 py-4">
    <!-- Header banner -->
    <div class="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-brand-error/5 blur-3xl rounded-full -z-10 w-[40%]"></div>
      <div class="space-y-2">
        <span class="text-xs text-brand-error font-bold uppercase tracking-widest">Safe Educational Sandbox</span>
        <h1 class="text-3xl font-extrabold text-white">Cybersecurity Playground</h1>
        <p class="text-sm text-slate-400 max-w-2xl">
          Learn critical web application security vulnerabilities through interactive, sandboxed simulators. No configurations required.
        </p>
      </div>
      <span class="px-3 py-1 text-xs font-semibold bg-brand-error/20 border border-brand-error/30 text-brand-error rounded-full shadow-md">
        DEFENSIVE LOGS ACTIVE
      </span>
    </div>

    <!-- Playground Workspace Tabs -->
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Tabs Selector Sidebar -->
      <aside class="w-full lg:w-64 glass-panel p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-none">
        <button 
          v-for="tab in LABS" 
          :key="tab.id"
          @click="activeLabId = tab.id"
          class="flex-shrink-0 text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-3"
          :class="activeLabId === tab.id ? 'bg-brand-error/15 text-brand-error border-l-2 border-brand-error font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'"
        >
          <span class="text-lg">{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
        </button>
      </aside>

      <!-- Interactive Lab Workspace -->
      <section class="flex-grow glass-panel p-6 sm:p-8 min-h-[500px] relative">
        
        <!-- 1. SQL Injection Simulator -->
        <div v-if="activeLabId === 'sqli'" class="space-y-6">
          <div class="space-y-2 border-b border-brand-border pb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-error">💉</span> SQL Injection Simulator
            </h2>
            <p class="text-xs text-slate-400">
              Vulnerability: Raw query concatenation. By entering SQL commands, you can bypass auth queries.
            </p>
          </div>

          <!-- Interactive SVG Pipeline Query Execution -->
          <div class="bg-slate-950 p-4 rounded-xl border border-brand-border/40 relative">
            <div class="flex justify-between items-center text-[10px] text-slate-500 mb-2 font-mono">
              <span>QUERY PIPELINE TELEMETRY</span>
              <span :class="sqliInjected ? 'text-brand-error font-bold animate-pulse' : 'text-brand-primary'">
                {{ sqliInjected ? 'ALERT: RAW SQL INJECTED' : 'READY TO ROUTE' }}
              </span>
            </div>
            
            <div class="h-16 w-full relative flex items-center justify-between border-b border-white/[0.03] pb-4">
              <!-- Client node -->
              <div class="flex flex-col items-center">
                <span class="text-lg">💻</span>
                <span class="text-[8px] text-slate-500 font-mono">CLIENT</span>
              </div>

              <!-- Connection Pipeline -->
              <div class="flex-grow mx-4 h-1 bg-slate-900 rounded-full relative overflow-hidden">
                <div 
                  ref="sqlSignalRef" 
                  class="absolute top-0 left-0 w-4 h-full bg-brand-error rounded-full opacity-0"
                ></div>
              </div>

              <!-- Gateway Firewall -->
              <div class="flex flex-col items-center mr-4">
                <div class="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-xs" :class="sqliInjected ? 'bg-brand-error/20 border-brand-error text-brand-error' : 'bg-slate-900'">
                  🛡️
                </div>
                <span class="text-[8px] text-slate-500 font-mono">GATE</span>
              </div>

              <!-- Database Drum -->
              <div class="flex flex-col items-center">
                <span class="text-lg" :class="{ 'animate-bounce': sqliProcessing }">🛢️</span>
                <span class="text-[8px] text-slate-500 font-mono">DATABASE</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Target Account Email Input</label>
              <div class="flex gap-2">
                <input 
                  v-model="sqliQuery" 
                  type="text" 
                  placeholder="admin@azamjonbro.uz' OR '1'='1" 
                  class="flex-grow bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-error font-mono"
                />
                <button @click="runSqli" :disabled="loading" class="px-5 py-2 bg-brand-error text-xs font-bold text-white rounded-lg hover:bg-brand-error/90 disabled:opacity-50 transition-all">
                  Execute Query
                </button>
              </div>
              <p class="text-[10px] text-slate-500 mt-1">Hint: Try entering <code class="text-brand-error font-mono">' OR '1'='1</code> to expose all user rows.</p>
            </div>

            <!-- Simulated backend statements -->
            <div v-if="sqliResult" class="space-y-4 bg-slate-950 p-4 rounded-xl border border-brand-border">
              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Compiled SQL Statement (Backend)</span>
                <code class="text-xs font-mono text-brand-error block break-all">{{ sqliResult.simulatedQuery }}</code>
              </div>

              <div class="space-y-1 pt-2 border-t border-brand-border">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Recommended Safe Parameterized Query</span>
                <code class="text-xs font-mono text-brand-success block break-all">{{ sqliResult.safeQuery }}</code>
              </div>

              <div v-if="sqliResult.isVulnerable" class="text-xs text-brand-error font-semibold bg-brand-error/10 border border-brand-error/20 p-3 rounded-lg">
                ⚠️ {{ sqliResult.explanation }}
              </div>

              <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Returned Database Rows</span>
                <div class="overflow-x-auto">
                  <table class="w-full text-[11px] font-mono text-slate-300">
                    <thead>
                      <tr class="border-b border-brand-border text-slate-500">
                        <th class="text-left pb-1">ID</th>
                        <th class="text-left pb-1">EMAIL</th>
                        <th class="text-left pb-1">ROLE</th>
                        <th class="text-left pb-1">CREDIT_CARD</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in sqliResult.data" :key="row.id" class="border-b border-brand-border/40 hover:bg-slate-900/40 db-row-item">
                        <td class="py-1.5">{{ row.id }}</td>
                        <td class="py-1.5 text-cyan-400">{{ row.email }}</td>
                        <td class="py-1.5 text-brand-secondary">{{ row.role }}</td>
                        <td class="py-1.5 text-brand-error">{{ row.credit_card }}</td>
                      </tr>
                      <tr v-if="sqliResult.data.length === 0">
                        <td colspan="4" class="text-center py-4 text-slate-600">No database rows returned (query returned empty set).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Linux Sandbox Shell -->
        <div v-if="activeLabId === 'linux'" class="space-y-6">
          <div class="space-y-2 border-b border-brand-border pb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-error">🐚</span> Sandboxed Linux Terminal
            </h2>
            <p class="text-xs text-slate-400">
              Interactive terminal: Emulates isolated shell directory listings and flags extraction. Type <code class="text-brand-error">help</code> to list files.
            </p>
          </div>

          <!-- Glowing CLI Screen -->
          <div class="bg-black border border-brand-border rounded-xl p-4 font-mono text-xs shadow-2xl space-y-4">
            <div class="h-64 overflow-y-auto space-y-2 custom-terminal scrollbar-none" ref="terminalOutputRef">
              <div class="text-brand-success opacity-85">Welcome to AzamjonBro Cybersecurity Lab Terminal (v1.2)</div>
              <div class="text-slate-500">Type 'help' to review directory permissions and commands.</div>
              
              <div v-for="(log, index) in terminalHistory" :key="index" class="space-y-1">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <span class="text-brand-error">guest@azamjonbro-lab:~$</span>
                  <span>{{ log.cmd }}</span>
                </div>
                <div class="text-slate-300 whitespace-pre-wrap leading-relaxed">{{ log.output }}</div>
              </div>
            </div>

            <!-- Terminal prompt line -->
            <div class="flex items-center gap-1.5 border-t border-brand-border/40 pt-3">
              <span class="text-brand-error font-bold">guest@azamjonbro-lab:~$</span>
              <input 
                v-model="terminalInput" 
                type="text" 
                @keyup.enter="sendTerminalCmd"
                placeholder="Enter command (e.g. ls, cat secret.txt)..." 
                class="flex-grow bg-transparent text-white outline-none border-none font-mono text-xs caret-brand-error"
                ref="terminalInputRef"
              />
            </div>
          </div>
        </div>

        <!-- 3. XSS Simulator -->
        <div v-if="activeLabId === 'xss'" class="space-y-6">
          <div class="space-y-2 border-b border-brand-border pb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-error">🛡️</span> Cross-Site Scripting (XSS) Lab
            </h2>
            <p class="text-xs text-slate-400">
              Vulnerability: Outputting untrusted client parameters directly to the HTML document without escaping script tags.
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Enter XSS Injection Script</label>
              <div class="flex gap-2">
                <input 
                  v-model="xssPayload" 
                  type="text" 
                  placeholder="&lt;script&gt;alert('Vulnerable!')&lt;/script&gt;" 
                  class="flex-grow bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-error font-mono"
                />
                <button @click="runXss" :disabled="loading" class="px-5 py-2 bg-brand-error text-xs font-bold text-white rounded-lg hover:bg-brand-error/90 disabled:opacity-50">
                  Submit Payload
                </button>
              </div>
            </div>

            <div v-if="xssResult" class="space-y-4 bg-slate-950 p-4 rounded-xl border border-brand-border">
              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Simulated Browser Rendering Output (Raw HTML)</span>
                <div class="bg-slate-900 border border-slate-800 p-3 rounded text-xs font-mono text-brand-error overflow-hidden relative">
                  {{ xssResult.isVulnerable ? "🚨 SCRIPT EVALUATED IN CLIENT SESSION: alert('XSS')" : "No script executed." }}
                </div>
              </div>

              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Safe HTML Escaped Equivalents</span>
                <code class="text-xs font-mono text-brand-success block break-all">{{ xssResult.escaped }}</code>
              </div>

              <div class="text-xs text-brand-error font-semibold bg-brand-error/10 border border-brand-error/20 p-3 rounded-lg">
                ⚠️ {{ xssResult.explanation }}
              </div>

              <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Vue.js Mitigations Template</span>
                <pre class="text-[11px] font-mono text-slate-400 overflow-x-auto">{{ xssResult.mitigationCode }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Auth Flow & JWT Visualizer -->
        <div v-if="activeLabId === 'auth'" class="space-y-6">
          <div class="space-y-2 border-b border-brand-border pb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-error">⛓️</span> Authentication Flow & JWT Visualizer
            </h2>
            <p class="text-xs text-slate-400">
              Interactive structural tree: Review how the browser holds access tokens and negotiates sessions via HttpOnly Cookies.
            </p>
          </div>

          <!-- Flowchart layout -->
          <div class="space-y-8 bg-slate-950 p-6 rounded-2xl border border-brand-border relative">
            <div class="flex justify-end">
              <button 
                @click="animateAuthExchange" 
                class="px-4 py-2 bg-brand-primary text-[10px] uppercase font-bold text-white rounded-lg hover:bg-brand-primary/90 transition-all flex items-center gap-2"
              >
                ⚡ Animate Token Exchange
              </button>
            </div>

            <!-- SVG Sequence Diagram -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <!-- Client -->
              <div class="glass-panel p-4 text-center space-y-2 border-brand-primary/30 client-node-box">
                <span class="text-xs font-bold text-brand-primary block uppercase">1. Client Browser</span>
                <p class="text-[10px] text-slate-400">Logs in with credentials. Stores Access Token in Memory, requests refresh sessions.</p>
                <div class="h-6 w-full flex items-center justify-center text-xs gap-1 mt-2">
                  <span class="token-icon opacity-0">🔑</span>
                  <span class="token-type text-[8px] font-mono opacity-0 text-brand-primary">JWT_TOKEN</span>
                </div>
              </div>

              <!-- Nginx proxy -->
              <div class="glass-panel p-4 text-center space-y-2 border-brand-secondary/30 proxy-node-box">
                <span class="text-xs font-bold text-brand-secondary block uppercase">2. Reverse Proxy Nginx</span>
                <p class="text-[10px] text-slate-400">Validates CORS parameters. Throttles rate bounds, forwards token headers to APIs.</p>
                <div class="h-6 w-full flex items-center justify-center text-xs gap-1 mt-2">
                  <span class="proxy-lock opacity-0">🔒</span>
                </div>
              </div>

              <!-- Database API -->
              <div class="glass-panel p-4 text-center space-y-2 border-brand-success/30 api-node-box">
                <span class="text-xs font-bold text-brand-success block uppercase">3. Node.js API Database</span>
                <p class="text-[10px] text-slate-400">Decodes JWT signature. Validates sessions, blacklists invalid tokens in Redis.</p>
                <div class="h-6 w-full flex items-center justify-center text-xs gap-1 mt-2">
                  <span class="api-ok opacity-0 text-brand-success">✅ OK</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
              <span class="font-bold text-white text-xs block">Vulnerability Insight: Token Revocation Defect</span>
              <p class="text-slate-400 leading-relaxed">
                Standard stateless JWTs cannot be revoked until they expire. To secure production architectures, AzamjonBro Lab tracks logged-out token blacklists inside **Redis Cache stores** checking every incoming access ticket for revocation records.
              </p>
            </div>
          </div>
        </div>

        <!-- 5. Data Encryption Lab (NEW Tab) -->
        <div v-if="activeLabId === 'encryption'" class="space-y-6">
          <div class="space-y-2 border-b border-brand-border pb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-error">🔐</span> Data Encryption & Key Exchange
            </h2>
            <p class="text-xs text-slate-400">
              Interactive visual: Learn cipher character transformations and Diffie-Hellman asymmetric key paint mixing.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Alice / Bob Key Mixing -->
            <div class="glass-panel p-5 space-y-4">
              <span class="text-xs font-bold text-white uppercase tracking-wider block">Diffie-Hellman Color Mixing (Asymmetric Cryptography)</span>
              
              <div class="flex items-center justify-between gap-2 border-b border-white/[0.03] pb-4">
                <div class="text-center space-y-1">
                  <span class="text-[10px] text-slate-400 block font-bold">ALICE'S SECRET</span>
                  <div class="w-8 h-8 rounded-full bg-red-500 mx-auto border-2 border-slate-900 shadow-md"></div>
                </div>
                
                <span class="text-xs text-slate-500 font-bold">+</span>
                
                <div class="text-center space-y-1">
                  <span class="text-[10px] text-slate-400 block font-bold">PUBLIC BASE</span>
                  <div class="w-8 h-8 rounded-full bg-yellow-400 mx-auto border-2 border-slate-900 shadow-md"></div>
                </div>

                <span class="text-xs text-slate-500 font-bold">+</span>

                <div class="text-center space-y-1">
                  <span class="text-[10px] text-slate-400 block font-bold">BOB'S SECRET</span>
                  <div class="w-8 h-8 rounded-full bg-blue-500 mx-auto border-2 border-slate-900 shadow-md"></div>
                </div>
              </div>

              <div class="flex items-center justify-center gap-4 py-2">
                <button 
                  @click="animateKeyExchange" 
                  class="px-4 py-1.5 bg-brand-secondary text-[10px] uppercase font-bold text-white rounded-lg hover:bg-brand-secondary/90 transition-colors"
                >
                  Mix Colors
                </button>
              </div>

              <!-- Shared secret result -->
              <div class="bg-slate-950 p-4 rounded-xl border border-brand-border flex items-center justify-between text-xs">
                <div class="space-y-1">
                  <span class="text-[9px] text-slate-500 font-bold block">SHARED SECRET KEY MATCH</span>
                  <p class="text-slate-300">Both arrive at the same color secret without sharing keys.</p>
                </div>
                <div 
                  ref="mixedColorRef" 
                  class="w-12 h-12 rounded-full border-2 border-white/20 transition-all duration-1000 bg-slate-900"
                ></div>
              </div>
            </div>

            <!-- Plain -> Cipher Text Glitch Mutation -->
            <div class="glass-panel p-5 space-y-4">
              <span class="text-xs font-bold text-white uppercase tracking-wider block">Plaintext to Cipher Transformation</span>
              <div>
                <label class="text-[10px] text-slate-500 uppercase block mb-1">Plaintext Input</label>
                <input 
                  v-model="plainText" 
                  @input="encryptText" 
                  type="text" 
                  class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary font-mono"
                  placeholder="Enter secrets..."
                />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] text-slate-500 uppercase block">Ciphertext Output (AES-256 Mocked)</label>
                <div class="bg-slate-950/80 p-3 rounded-lg border border-brand-border/40 font-mono text-xs text-brand-success break-all min-h-[38px] flex items-center">
                  {{ cipherText }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. Request Inspector -->
        <div v-if="activeLabId === 'inspector'" class="space-y-6">
          <div class="space-y-2 border-b border-brand-border pb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-error">🔍</span> HTTP Request Inspector
            </h2>
            <p class="text-xs text-slate-400">
              Mirror logs: View all request headers, user agents, cookies, and IP signatures sent from your browser to the backend.
            </p>
          </div>

          <button @click="inspectRequest" :disabled="loading" class="px-5 py-2.5 bg-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
            Inspect My Connection
          </button>

          <div v-if="inspectorData" class="space-y-2 bg-slate-950 p-4 rounded-xl border border-brand-border">
            <span class="text-[10px] font-bold text-slate-500 uppercase">Incoming Request Profile (JSON)</span>
            <pre class="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">{{ inspectorData }}</pre>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import api from "../../services/api";
import { gsap } from "gsap";

const LABS = [
  { id: "sqli", name: "SQL Injection Simulator", icon: "💉" },
  { id: "linux", name: "Sandboxed Linux terminal", icon: "🐚" },
  { id: "xss", name: "XSS Vulnerability Lab", icon: "🛡️" },
  { id: "auth", name: "Auth Flow & JWT", icon: "⛓️" },
  { id: "encryption", name: "Data Encryption Lab", icon: "🔐" },
  { id: "inspector", name: "HTTP Request Inspector", icon: "🔍" }
];

const activeLabId = ref("sqli");
const loading = ref(false);

// 1. SQL Injection
const sqliQuery = ref("");
const sqliResult = ref<any>(null);
const sqlSignalRef = ref<HTMLElement | null>(null);
const sqliProcessing = ref(false);
const sqliInjected = ref(false);

async function runSqli() {
  if (!sqliQuery.value) return;
  loading.value = true;
  sqliProcessing.value = true;
  sqliInjected.value = sqliQuery.value.toLowerCase().includes("or") || sqliQuery.value.includes("'");

  // Animate Query light pulse traveling inside pipeline
  if (sqlSignalRef.value) {
    gsap.set(sqlSignalRef.value, { opacity: 1, left: "0%" });
    await gsap.to(sqlSignalRef.value, {
      left: "100%",
      duration: 0.8,
      ease: "power2.inOut"
    });
    gsap.set(sqlSignalRef.value, { opacity: 0 });
  }

  try {
    const res = await api.post("/playground/sqli", { query: sqliQuery.value });
    sqliResult.value = res.data.data;
    
    // Stagger returned rows
    await nextTick();
    gsap.from(".db-row-item", {
      opacity: 0,
      y: 10,
      stagger: 0.05,
      duration: 0.4,
      ease: "power1.out"
    });
  } catch (e: any) {
    console.error("SQLi error:", e);
  } finally {
    loading.value = false;
    sqliProcessing.value = false;
  }
}

// 2. Linux Terminal Sandbox
const terminalInput = ref("");
const terminalHistory = ref<Array<{ cmd: string; output: string }>>([]);
const terminalOutputRef = ref<HTMLDivElement | null>(null);

async function sendTerminalCmd() {
  const cmdText = terminalInput.value.trim();
  if (!cmdText) return;

  terminalInput.value = "";
  try {
    const res = await api.post("/playground/sandbox", { command: cmdText });
    const out = res.data.data.output;

    if (out === "CLEAR_SCREEN") {
      terminalHistory.value = [];
    } else {
      terminalHistory.value.push({
        cmd: cmdText,
        output: out
      });
    }

    await nextTick();
    if (terminalOutputRef.value) {
      terminalOutputRef.value.scrollTop = terminalOutputRef.value.scrollHeight;
    }
  } catch (e: any) {
    terminalHistory.value.push({
      cmd: cmdText,
      output: `Terminal socket connection error: ${e.message}`
    });
  }
}

// 3. XSS Simulator
const xssPayload = ref("");
const xssResult = ref<any>(null);
async function runXss() {
  if (!xssPayload.value) return;
  loading.value = true;
  try {
    const res = await api.post("/playground/xss", { payload: xssPayload.value });
    xssResult.value = res.data.data;
  } catch (e: any) {
    console.error("XSS simulation error:", e);
  } finally {
    loading.value = false;
  }
}

// 4. Auth Flow Animated Timeline
function animateAuthExchange() {
  const tl = gsap.timeline();

  // Reset elements
  gsap.set([".token-icon", ".token-type", ".proxy-lock", ".api-ok"], { opacity: 0, scale: 0.5 });
  
  // 1. Client Browser creates token key
  tl.to(".token-icon", { opacity: 1, scale: 1.2, duration: 0.4, ease: "back.out(2)" })
    .to(".token-type", { opacity: 1, duration: 0.3 })
    
    // 2. Token travels to Proxy
    .to(".token-icon", {
      x: window.innerWidth > 768 ? 160 : 0,
      y: window.innerWidth > 768 ? 0 : 120,
      duration: 0.8,
      ease: "power2.inOut"
    })
    
    // 3. Proxy locks / inspects CORS
    .to(".proxy-lock", { opacity: 1, scale: 1.2, duration: 0.4 })
    
    // 4. Travels to Node API
    .to(".token-icon", {
      x: window.innerWidth > 768 ? 320 : 0,
      y: window.innerWidth > 768 ? 0 : 240,
      duration: 0.8,
      ease: "power2.inOut"
    })
    
    // 5. Database returns OK
    .to(".api-ok", { opacity: 1, scale: 1.2, duration: 0.4, ease: "back.out(1.5)" })
    
    // 6. Reset position
    .to(".token-icon", {
      x: 0,
      y: 0,
      delay: 1.5,
      duration: 0.4,
      opacity: 0
    });
}

// 5. Encryption Tab
const plainText = ref("");
const cipherText = ref("");
const mixedColorRef = ref<HTMLElement | null>(null);

function encryptText() {
  if (!plainText.value) {
    cipherText.value = "";
    return;
  }
  
  // Mock AES-256 character translation glitch
  let text = plainText.value;
  let code = btoa(unescape(encodeURIComponent(text)));
  // Replace characters with standard AES block mock
  cipherText.value = "U2FsdGVkX1" + code.slice(0, 32);
}

function animateKeyExchange() {
  if (mixedColorRef.value) {
    // Alice's Red + Bob's Blue public key mix creates purple shared secret
    gsap.to(mixedColorRef.value, {
      backgroundColor: "#a855f7",
      boxShadow: "0 0 16px #a855f7",
      duration: 1.2,
      ease: "power2.out"
    });
  }
}

// 6. Request Inspector
const inspectorData = ref("");
async function inspectRequest() {
  loading.value = true;
  try {
    const res = await api.post("/playground/inspect", { testKey: "labValue" });
    inspectorData.value = JSON.stringify(res.data.data, null, 2);
  } catch (e: any) {
    inspectorData.value = `Failed to fetch connection information: ${e.message}`;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  terminalHistory.value.push({
    cmd: "help",
    output: "AzamjonBro Sandbox Shell, v1.0.0-beta\nAvailable commands:\n  help        Display this help text\n  ls          List files in current folder\n  cat [file]  Print file contents\n  whoami      Display current terminal user\n  pwd         Print working directory\n  ping [ip]   Simulate a network latency probe\n  clear       Reset terminal layout"
  });
});
</script>

<style scoped>
.custom-terminal::-webkit-scrollbar {
  display: none;
}
.custom-terminal {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
