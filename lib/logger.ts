// ==========================================
// Structured logger — never log secrets or raw auth payloads
// ==========================================

export type LogLevel = "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

const REDACTED_KEYS = /secret|password|authorization|bearer|service_role|api_key|signature|token/i;

function sanitizeFields(fields: LogFields): LogFields {
  const out: LogFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (REDACTED_KEYS.test(key)) {
      out[key] = "[REDACTED]";
      continue;
    }

    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…[truncated]`;
      continue;
    }

    out[key] = value;
  }

  return out;
}

function write(level: LogLevel, message: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    level,
    message,
    ts: new Date().toISOString(),
    ...sanitizeFields(fields),
  });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
};
