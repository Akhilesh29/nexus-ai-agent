const taskInput = document.getElementById("task-input") as HTMLTextAreaElement;
const runBtn = document.getElementById("run-btn") as HTMLButtonElement;
const messages = document.getElementById("messages") as HTMLDivElement;
const stepsList = document.getElementById("steps-list") as HTMLDivElement;
const stepCounter = document.getElementById("step-counter") as HTMLDivElement;
let stepCount = 0;

const params = new URLSearchParams(window.location.search);
const apiFromQuery = params.get("api");
if (apiFromQuery) localStorage.setItem("NEXUS_API_BASE", apiFromQuery.replace(/\/$/, ""));
const API_BASE = localStorage.getItem("NEXUS_API_BASE") || "";

taskInput.addEventListener("input", () => {
  taskInput.style.height = "46px";
  taskInput.style.height = Math.min(taskInput.scrollHeight, 120) + "px";
});
taskInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    void runTask();
  }
});

function useExample(el: HTMLElement) {
  taskInput.value = el.textContent ?? "";
  taskInput.focus();
}
(window as unknown as { useExample: (el: HTMLElement) => void }).useExample = useExample;

function esc(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function trunc(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "..." : str;
}
function safeFinalText(str: string) {
  return trunc(String(str || ""), 5000);
}

function appendMessage(role: "user" | "agent", text: string) {
  document.getElementById("empty-state")?.remove();
  document.getElementById("examples")?.remove();
  const isUser = role === "user";
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.innerHTML = `
      <div class="avatar ${isUser ? "user-av" : "agent-av"}">${isUser ? "YOU" : "NXS"}</div>
      <div class="bubble">${esc(text)}</div>
    `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div.querySelector(".bubble") as HTMLDivElement;
}

interface Step {
  type: "thinking" | "tool_call" | "tool_result" | "final" | "error" | "done";
  content?: string;
  toolName?: string;
}

function addStep(step: Step) {
  stepsList.querySelector(".empty")?.remove();
  stepCount++;
  stepCounter.textContent = `${stepCount} steps`;

  const icons: Record<string, string> = { thinking: "", tool_call: "", tool_result: "", final: "", error: "" };
  const labels = {
    thinking: "Reasoning",
    tool_call: `Tool -> ${step.toolName ?? ""}`,
    tool_result: `Result <- ${step.toolName ?? ""}`,
    final: "Final Answer",
    error: "Error"
  };
  const card = document.createElement("div");
  card.className = `step-card ${step.type}`;
  card.innerHTML = `
      <div class="step-label">${icons[step.type] ?? ""} ${labels[step.type as keyof typeof labels] ?? step.type}</div>
      <div class="step-content">${esc(trunc(step.content || "", 320))}</div>
    `;
  stepsList.appendChild(card);
  stepsList.scrollTop = stepsList.scrollHeight;
}

async function runTask() {
  const task = taskInput.value.trim();
  if (!task) return;

  taskInput.value = "";
  taskInput.style.height = "46px";
  runBtn.disabled = true;
  taskInput.disabled = true;

  stepsList.innerHTML = "";
  stepCount = 0;
  stepCounter.textContent = "";

  appendMessage("user", task);
  const agentBubble = appendMessage("agent", "");
  agentBubble.innerHTML = '<span class="spinner"></span>NEXUS processing...';

  let finalAnswer = "";
  let requestTimedOut = false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    requestTimedOut = true;
    controller.abort();
  }, 45000);

  try {
    const res = await fetch(`${API_BASE}/api/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
      signal: controller.signal
    });

    if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let doneReceived = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const step = JSON.parse(line.slice(6)) as Step;
        if (step.type === "done") {
          doneReceived = true;
          break;
        }
        if (step.type === "final") finalAnswer = step.content ?? "";
        addStep(step);
      }
      if (doneReceived) {
        await reader.cancel();
        break;
      }
    }
  } catch (err) {
    addStep({ type: "error", content: String(err) });
    finalAnswer = requestTimedOut
      ? "Request timed out. Backend took too long to respond. Please try again."
      : "Something went wrong. Check console logs.";
  } finally {
    clearTimeout(timeoutId);
    runBtn.disabled = false;
    taskInput.disabled = false;
    taskInput.focus();
  }

  agentBubble.textContent = safeFinalText(finalAnswer || "(No response)");
}

(window as unknown as { runTask: () => Promise<void> }).runTask = runTask;
