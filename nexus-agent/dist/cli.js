"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const agent_js_1 = require("./agent.js");
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
function stepColor(step) {
    switch (step.type) {
        case "thinking": return BLUE;
        case "tool_call": return YELLOW;
        case "tool_result": return MAGENTA;
        case "final": return GREEN;
        default: return RESET;
    }
}
function stepLabel(step) {
    switch (step.type) {
        case "thinking": return "  Thinking";
        case "tool_call": return `  Tool -> ${step.toolName}`;
        case "tool_result": return `  Result <- ${step.toolName}`;
        case "final": return "  Answer";
        default: return "  .";
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
        if (!task) {
            rl.prompt();
            return;
        }
        if (task.toLowerCase() === "exit" || task.toLowerCase() === "quit") {
            console.log(`\n${DIM}Shutting down NEXUS. Goodbye!${RESET}\n`);
            rl.close();
            process.exit(0);
        }
        console.log(`\n${DIM}--- NEXUS processing ---${RESET}`);
        try {
            await (0, agent_js_1.runAgent)(task, (step) => {
                const color = stepColor(step);
                const label = stepLabel(step);
                if (step.type === "final") {
                    console.log(`\n${color}${BOLD}${label}${RESET}`);
                    console.log(`${color}${step.content}${RESET}\n`);
                }
                else {
                    console.log(`\n${color}${label}${RESET}`);
                    console.log(`${DIM}  ${step.content}${RESET}`);
                }
            });
        }
        catch (err) {
            console.error(`\n\x1b[31mError: ${err}${RESET}\n`);
        }
        console.log(`${DIM}----------------------------------------${RESET}\n`);
        rl.prompt();
    });
}
main();
