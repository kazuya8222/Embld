'use client'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import BlogImage from '@/components/blog/BlogImage';
import 'highlight.js/styles/github.css';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-0 pb-3 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-2 border-b border-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-gray-900 mb-2 mt-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-bold text-gray-900 mb-2 mt-3">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-bold text-gray-700 mb-2 mt-3">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 leading-7 mb-4">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="text-gray-900 font-bold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-gray-700 italic">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="text-gray-700 list-disc ml-6 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="text-gray-700 list-decimal ml-6 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4 bg-gray-50 py-2">
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }: any) => {
            const isInline = typeof props.className === 'string' && !props.className.includes('language-');
            if (isInline) {
              return (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800 font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4 text-sm">
                <code className="font-mono text-gray-800" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <BlogImage
              src={src}
              alt={alt || 'Blog image'}
              className="w-full h-auto rounded-lg my-4"
              width={800}
              height={400}
            />
          ),
          hr: () => (
            <hr className="my-8 border-t border-gray-200" />
          ),
        }}
      >
        {content || 'ここにプレビューが表示されます。\n\n左側のMarkdownエディターにテキストを入力すると、リアルタイムで更新されます。'}
      </ReactMarkdown>
    </div>
  );
}