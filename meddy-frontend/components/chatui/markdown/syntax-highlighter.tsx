

// 导入需要支持的语言
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import { useState } from 'react';
import { PrismAsyncLight } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Check, Copy } from 'lucide-react';

// 注册语言支持
PrismAsyncLight.registerLanguage("js", javascript);
PrismAsyncLight.registerLanguage("javascript", javascript);
PrismAsyncLight.registerLanguage("jsx", tsx);
PrismAsyncLight.registerLanguage("ts", typescript);
PrismAsyncLight.registerLanguage("typescript", typescript);
PrismAsyncLight.registerLanguage("tsx", tsx);
PrismAsyncLight.registerLanguage("python", python);
PrismAsyncLight.registerLanguage("java", java);
PrismAsyncLight.registerLanguage("css", css);
PrismAsyncLight.registerLanguage("json", json);
PrismAsyncLight.registerLanguage("bash", bash);
PrismAsyncLight.registerLanguage("sql", sql);

interface SyntaxHighlighterProps {
  language: string;
  children: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="code-block">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f2937] rounded-t-lg border-b border-[#374151]">
        <span className="text-sm text-gray-400">
          {language.toUpperCase()}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <PrismAsyncLight
        style={coldarkDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          fontSize: '0.9rem',
        }}
      >
        {children}
      </PrismAsyncLight>
    </div>
  );
};

export default SyntaxHighlighter;