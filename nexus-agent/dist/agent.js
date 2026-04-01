"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgent = runAgent;
const tools_js_1 = require("./tools.js");
const SYSTEM = `You are a precise task-automation agent.
You can answer open-ended questions and also use tools for deterministic operations.
When useful, call tools for calculations, formatting, list operations, or date/time.
Keep answers correct, direct, and concise.`;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
async function callGemini(userTask, toolContext) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Add it to your environment to enable open-ended AI answers.");
    }
    const content = toolContext
        ? `User task: ${userTask}\n\nTool result context:\n${toolContext}\n\nRespond to the user with the best final answer.`
        : userTask;
    const res = await fetch(`${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: SYSTEM }]
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: content }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 700,
                temperature: 0.5
            }
        })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${text}`);
    }
    const data = (await res.json());
    const textParts = (data.candidates ?? [])
        .flatMap((candidate) => candidate.content?.parts ?? [])
        .map((part) => part.text ?? "")
        .filter(Boolean);
    const text = textParts.join("\n").trim();
    if (text)
        return text;
    const finishReason = data.candidates?.[0]?.finishReason ?? "UNKNOWN";
    throw new Error(`Gemini returned empty content (finishReason=${finishReason}).`);
}
function parseTask(task) {
    const lower = task.toLowerCase();
    if (lower.includes('calculate') || /\d/.test(task) && /[\+\-\*\/]/.test(task)) {
        const expression = task.replace(/calculate/i, '').trim();
        return { tool: 'calculator', input: { expression } };
    }
    if (lower.includes('word count')) {
        const text = task.split(':')[1]?.trim().replace(/"/g, '') || '';
        return { tool: 'text_transform', input: { text, operation: 'word_count' } };
    }
    if (lower.includes('list')) {
        if (lower.includes('add:') && (lower.includes('deduplicate') || lower.includes('sort'))) {
            const list_name = task.match(/list "([^"]+)"/i)?.[1] || 'default';
            const itemsRaw = task.split(/add:/i)[1]?.split(/[—-]/)[0] ?? '';
            const items = itemsRaw.split(',').map((s) => s.trim()).filter(Boolean);
            return { tool: 'list_manager', input: { action: 'replace', list_name, items } };
        }
        // Simple parsing for list actions
        if (lower.includes('create')) {
            const list_name = task.match(/list "(\w+)"/)?.[1] || 'default';
            return { tool: 'list_manager', input: { action: 'create', list_name } };
        }
        if (lower.includes('add')) {
            const list_name = task.match(/list "(\w+)"/)?.[1] || 'default';
            const items = task.split('add:')[1]?.split('—')[0]?.split(',').map(s => s.trim()) || [];
            // For simplicity, add one item
            const item = items[0] || '';
            return { tool: 'list_manager', input: { action: 'add', list_name, item } };
        }
        if (lower.includes('deduplicate') && lower.includes('sort')) {
            const list_name = task.match(/list "(\w+)"/)?.[1] || 'default';
            return { tool: 'list_manager', input: { action: 'deduplicate', list_name } };
            // Note: sort separately if needed
        }
    }
    if (lower.includes('format') && lower.includes('table')) {
        const dataMatch = task.match(/\[.*\]/);
        if (dataMatch) {
            try {
                const data = JSON.parse(dataMatch[0]);
                return { tool: 'data_formatter', input: { data, format: 'markdown_table' } };
            }
            catch { }
        }
    }
    if (lower.includes('day') || lower.includes('time') || lower.includes('date')) {
        let operation = 'now';
        if (lower.includes('day'))
            operation = 'day_of_week';
        return { tool: 'datetime_info', input: { operation } };
    }
    return null;
}
async function runAgent(task, onStep) {
    const steps = [];
    function emit(step) {
        steps.push(step);
        onStep?.(step);
    }
    emit({ type: "thinking", content: "Analyzing request and deciding whether tools are needed." });
    const parsed = parseTask(task);
    let toolContext = "";
    if (parsed) {
        const { tool, input } = parsed;
        emit({ type: "tool_call", content: JSON.stringify(input), toolName: tool, toolInput: input });
        const result = (0, tools_js_1.runTool)(tool, input);
        emit({ type: "tool_result", content: result, toolName: tool });
        toolContext = `Tool: ${tool}\nInput: ${JSON.stringify(input)}\nOutput: ${result}`;
    }
    emit({ type: "thinking", content: "Generating a complete response with Gemini." });
    try {
        const answer = await callGemini(task, toolContext || undefined);
        emit({ type: "final", content: answer });
        return { answer, steps };
    }
    catch (err) {
        const fallback = parsed && toolContext
            ? `Tool execution completed:\n\n${toolContext}\n\nSet GEMINI_API_KEY to enable full open-ended AI responses.`
            : "Set GEMINI_API_KEY to enable full open-ended AI responses. Without it, only basic deterministic tool tasks are available.";
        emit({ type: "final", content: `${fallback}\n\nDetails: ${String(err)}` });
        return { answer: fallback, steps };
    }
}
