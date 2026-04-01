// ── In-memory state ───────────────────────────────────────────────────────────
const _lists: Record<string, string[]> = {};

// ── Tool implementations ──────────────────────────────────────────────────────

function calculator(expression: string): string {
  try {
    if (/[a-zA-Z_]/.test(expression))
      return "Error: expression must contain only numbers and operators.";
    // eslint-disable-next-line no-eval
    const result = Function(`"use strict"; return (${expression})`)();
    return String(result);
  } catch (e) {
    return `Error: ${e}`;
  }
}

function text_transform(text: string, operation: string): string {
  switch (operation) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    case "reverse":
      return text.split("").reverse().join("");
    case "word_count":
      return `${text.trim().split(/\s+/).length} words`;
    case "summarise_bullets":
      return text
        .split(/[.!?]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `• ${s}`)
        .join("\n");
    default:
      return `Unknown operation: ${operation}`;
  }
}

function list_manager(action: string, list_name: string, item?: string): string {
  if (action === "create") {
    _lists[list_name] = [];
    return `List '${list_name}' created.`;
  }
  if (!_lists[list_name]) _lists[list_name] = [];
  const lst = _lists[list_name];

  switch (action) {
    case "replace": {
      const rawItems = (item ?? "").split("\n").map((v) => v.trim()).filter(Boolean);
      const dedupedSorted = [...new Set(rawItems)].sort((a, b) => a.localeCompare(b));
      _lists[list_name] = dedupedSorted;
      return `'${list_name}': [${dedupedSorted.join(", ")}]`;
    }
    case "add":
      lst.push(item!);
      return `Added '${item}' to '${list_name}'.`;
    case "remove": {
      const idx = lst.indexOf(item!);
      if (idx === -1) return `'${item}' not found in '${list_name}'.`;
      lst.splice(idx, 1);
      return `Removed '${item}' from '${list_name}'.`;
    }
    case "sort":
      lst.sort();
      return `'${list_name}' sorted: [${lst.join(", ")}]`;
    case "deduplicate": {
      _lists[list_name] = [...new Set(lst)];
      return `Deduplicated '${list_name}': [${_lists[list_name].join(", ")}]`;
    }
    case "show":
      return `'${list_name}': [${lst.join(", ")}]`;
    default:
      return `Unknown action: ${action}`;
  }
}

function data_formatter(data: Record<string, unknown>[], format: string): string {
  if (!data.length) return "No data provided.";
  const keys = Object.keys(data[0]);

  if (format === "json") return JSON.stringify(data, null, 2);

  if (format === "csv") {
    const rows = [keys.join(",")];
    for (const row of data) rows.push(keys.map((k) => String(row[k] ?? "")).join(","));
    return rows.join("\n");
  }

  if (format === "markdown_table") {
    const header = `| ${keys.join(" | ")} |`;
    const sep = `| ${keys.map(() => "---").join(" | ")} |`;
    const rows = data.map((row) => `| ${keys.map((k) => String(row[k] ?? "")).join(" | ")} |`);
    return [header, sep, ...rows].join("\n");
  }

  return `Unknown format: ${format}`;
}

function datetime_info(operation: string): string {
  const now = new Date();
  switch (operation) {
    case "now":
      return now.toLocaleString();
    case "date":
      return now.toLocaleDateString();
    case "time":
      return now.toLocaleTimeString();
    case "timestamp":
      return String(now.getTime());
    case "day_of_week":
      return now.toLocaleDateString("en-US", { weekday: "long" });
    default:
      return `Unknown operation: ${operation}`;
  }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export function runTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "calculator":
      return calculator(input.expression as string);
    case "text_transform":
      return text_transform(input.text as string, input.operation as string);
    case "list_manager":
      if (input.action === "replace" && Array.isArray(input.items)) {
        const serialized = (input.items as unknown[]).map((v) => String(v)).join("\n");
        return list_manager("replace", input.list_name as string, serialized);
      }
      return list_manager(
        input.action as string,
        input.list_name as string,
        input.item as string | undefined
      );
    case "data_formatter":
      return data_formatter(
        input.data as Record<string, unknown>[],
        input.format as string
      );
    case "datetime_info":
      return datetime_info(input.operation as string);
    default:
      return `Unknown tool: ${name}`;
  }
}
