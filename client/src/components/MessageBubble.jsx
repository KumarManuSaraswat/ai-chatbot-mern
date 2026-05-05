import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function MessageBubble({ msg }) {
  const [copiedBlock, setCopiedBlock] = useState(null);

  const handleCopy = async (text, id) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // basic fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedBlock(id);
      setTimeout(() => setCopiedBlock(null), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div
      className={`max-w-3xl px-4 py-3 rounded-2xl leading-7 shadow-sm overflow-hidden ${
        msg.role === "user"
          ? "bg-blue-600 text-white"
          : "bg-white/5 border border-white/10 text-zinc-100"
      }`}
    >
      {msg.role === "assistant" ? (
        <div className="max-w-none text-sm md:text-base">
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeText = String(children).replace(/\n$/, "");
                const blockId = codeText.slice(0, 30); // simple id per block

                if (!inline && match) {
                  return (
                    <div className="relative mt-3 mb-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(codeText, blockId)}
                        className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md bg-black/40 border border-white/20 hover:bg-black/70"
                      >
                        {copiedBlock === blockId ? "Copied!" : "Copy"}
                      </button>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "0.75rem",
                          padding: "1rem",
                          background: "#0f172a",
                        }}
                        {...props}
                      >
                        {codeText}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code
                    className="bg-black/30 px-1.5 py-0.5 rounded text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc ml-5 mb-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal ml-5 mb-2">{children}</ol>;
              },
              li({ children }) {
                return <li className="mb-1">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mb-3">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold mb-2">{children}</h3>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline break-all"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="whitespace-pre-wrap">{msg.content}</p>
      )}
    </div>
  );
}

export default MessageBubble;