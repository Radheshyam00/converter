"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  markdown: string;
}

export default function MarkdownPreview({
  markdown,
}: MarkdownPreviewProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          👁️ Markdown Preview
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Live preview of your document
        </p>
      </div>

      <div
        id="pdf-content"
        className="markdown-body min-h-[600px] bg-white p-8 text-slate-900"
      >
        {markdown.trim() ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        ) : (
          <div className="flex min-h-[500px] items-center justify-center text-center text-slate-400">
            <div>
              <div className="text-5xl">📄</div>

              <p className="mt-3">
                Upload or enter Markdown to see the preview
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}