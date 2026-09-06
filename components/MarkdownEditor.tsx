"use client";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            ✏️ Edit Markdown
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Edit your Markdown content below
          </p>
        </div>

        <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Markdown
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`# Mathematics Formulae

## Algebra

(a + b)² = a² + 2ab + b²

## Trigonometry

sin²θ + cos²θ = 1

## Example

This is a **bold** text.

- Formula 1
- Formula 2
- Formula 3`}
        spellCheck={false}
        className="min-h-[600px] w-full resize-none bg-slate-50 p-5 font-mono text-sm leading-6 text-slate-900 outline-none dark:bg-slate-950 dark:text-slate-100"
      />
    </section>
  );
}