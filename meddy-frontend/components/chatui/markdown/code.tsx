import { cn } from "@/utils/cn";
import SyntaxHighlighter from './syntax-highlighter'

export default function Code({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  
  return !inline && match ? (
    <SyntaxHighlighter
      language={match[1]}
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
}