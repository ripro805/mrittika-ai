import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, ExternalLink, Info, AlertTriangle, Lightbulb } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CodeBlock: React.FC<{ language?: string; children: string }> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-gray-800 bg-gray-900 text-gray-100 text-xs font-mono shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-gray-800 text-gray-300 text-[11px] border-b border-gray-700">
        <span className="uppercase font-semibold tracking-wider">{language || "Code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="অনুলিপি করুন"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">কপি হয়েছে</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>কপি করুন</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  return (
    <div className={`prose-chat text-sm leading-relaxed text-gray-800 font-bangla ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-black text-gray-900 mt-4 mb-2 pb-1.5 border-b border-gray-200 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-600 rounded-full inline-block shrink-0" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-3 mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block shrink-0" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-2.5 mb-1 text-emerald-950">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-bold text-gray-800 mt-2 mb-1">
              {children}
            </h4>
          ),

          // Paragraph
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-gray-800 font-bangla whitespace-normal">
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 pl-1.5 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 pl-5 list-decimal text-sm text-gray-800 marker:font-bold marker:text-emerald-700">
              {children}
            </ol>
          ),
          li: ({ children, node, ...props }) => {
            // Check if parent is an unordered list (ul) to add custom bullet point
            return (
              <li className="flex items-start gap-2 text-sm text-gray-800 leading-relaxed font-bangla" {...props}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0 inline-block" />
                <span className="flex-1">{children}</span>
              </li>
            );
          },

          // Bold & Emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-gray-950 text-[0.925rem]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),

          // Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-gray-200 shadow-2xs bg-white">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-emerald-50/90 border-b border-emerald-100 text-xs font-bold text-emerald-950">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-3.5 font-bold border-r border-emerald-100 last:border-r-0 whitespace-nowrap">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-emerald-50/30 transition-colors even:bg-gray-50/50">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="py-2.5 px-3.5 text-gray-800 border-r border-gray-100 last:border-r-0 font-bangla align-top">
              {children}
            </td>
          ),

          // Blockquotes (Callouts for agricultural warnings, tips, and notes)
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-3.5 pr-3 py-2.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl text-amber-950 text-xs sm:text-sm shadow-2xs font-bangla">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 not-italic">{children}</div>
              </div>
            </blockquote>
          ),

          // Code
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children);
            const isMultiLine = codeString.includes("\n");

            if (!isMultiLine && !match) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-semibold border border-emerald-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match ? match[1] : ""}>
                {codeString.replace(/\n$/, "")}
              </CodeBlock>
            );
          },

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2 inline-flex items-center gap-0.5 transition-colors"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3 inline shrink-0" />
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
