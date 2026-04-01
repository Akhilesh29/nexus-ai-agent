import * as readline from "readline";
import { runAgent, AgentStep } from "./agent.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const BLUE = "\x1b[34m";

function banner() {
  console.log(`
${GREEN}${BOLD}  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝${RESET}
${DIM}  Neural Execution & Unified Automation System · v1.0${RESET}
${GREEN}  Powered by Claude (Anthropic)${RESET}

${DIM}  Tools: calculator · text_transform · list_manager · data_formatter · datetime_info
  Type exit or quit to close.${RESET}
`);
}

function stepColor(step: AgentStep): string {
  switch (step.type) {
    case "thinking":    return BLUE;
    case "tool_call":   return YELLOW;
    case "tool_result": return MAGENTA;
    case "final":       return GREEN;
    default:            return RESET;
  }
}

function stepLabel(step: AgentStep): string {
  switch (step.type) {
    case "thinking":    return "  Thinking";
    case "tool_call":   return `  Tool -> ${step.toolName}`;
    case "tool_result": return `  Result <- ${step.toolName}`;
    case "final":       return "  Answer";
    default:            return "  .";
  }
}

async function main() {
  banner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${CYAN}${BOLD}nexus > ${RESET}`,
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const task = line.trim();
    if (!task) { rl.prompt(); return; }
    if (task.toLowerCase() === "exit" || task.toLowerCase() === "quit") {
      console.log(`\n${DIM}Shutting down NEXUS. Goodbye!${RESET}\n`);
      rl.close();
      process.exit(0);
    }

    console.log(`\n${DIM}--- NEXUS processing ---${RESET}`);

    try {
      await runAgent(task, (step) => {
        const color = stepColor(step);
        const label = stepLabel(step);
        if (step.type === "final") {
          console.log(`\n${color}${BOLD}${label}${RESET}`);
          console.log(`${color}${step.content}${RESET}\n`);
        } else {
          console.log(`\n${color}${label}${RESET}`);
          console.log(`${DIM}  ${step.content}${RESET}`);
        }
      });
    } catch (err) {
      console.error(`\n\x1b[31mError: ${err}${RESET}\n`);
    }

    console.log(`${DIM}----------------------------------------${RESET}\n`);
    rl.prompt();
  });
}

main();
