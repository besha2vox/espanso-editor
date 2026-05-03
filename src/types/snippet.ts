import { z } from "zod";

export const SnippetSchema = z.object({
    trigger: z.string().min(1, { error: "Trigger cannot be empty" }),
    replace: z.string().min(1, { error: "Replace text cannot be empty" }),
});

export type Snippet = z.infer<typeof SnippetSchema>;

export function sanitizeSnippet(raw: Snippet): Snippet {
    return {
        trigger: raw.trigger.trim(),
        replace: raw.replace.replace(/^\s+/, "").replace(/\s{2,}$/, (m) => m[m.length - 1]),
    };
}
