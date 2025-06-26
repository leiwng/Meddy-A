'use client'

import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import { FC, memo, useState } from 'react'
import { CheckIcon, CopyIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'
import Markdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import rehypeRaw from 'rehype-raw'
import { visit } from 'unist-util-visit'
import Code from './code'
import Pre from './pre'
import IMG from './img'

function remarkUnwrapImages() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (
        node.children.length === 1 &&
        node.children[0].type === 'image'
      ) {
        parent.children.splice(index, 1, node.children[0]);
      }
    });
  };
}

export function remarkThink() {
  return (tree) => {
    visit(tree, 'html', (node) => {
      // console.log('node', node);
      // 匹配 <think> 标签
      if (node.value.indexOf('<think>') !== -1) {
        node.value = node.value.replace(
          /<think>(.*?)/g,
          '<div class="thinking-wrapper"><div class="think-line"></div>$1',
        )
      }
      if (node.value.indexOf('</think>') !== -1) {
        node.value = node.value.replace(/<\/think>/g, '</div>')
      }

      // Match <execute> tags
      if (node.value.indexOf('<execute>') !== -1) {
        node.value = node.value.replace(
          /<execute>(.*?)/g,
          '<div class="execute-wrapper"><div class="execute-indicator"></div>$1',
        )
      }
      if (node.value.indexOf('</execute>') !== -1) {
        node.value = node.value.replace(/<\/execute>/g, '</div>')
      }
    })
  }
}

const MarkdownTextImpl = ({ children }) => {
  return (
    <Markdown
      remarkPlugins={[remarkUnwrapImages, remarkThink, remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        h1: ({ node: _node, className, ...props }) => (
          <h1
            className={cn(
              'mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h2: ({ node: _node, className, ...props }) => (
          <h2
            className={cn(
              'mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h3: ({ node: _node, className, ...props }) => (
          <h3
            className={cn(
              'mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h4: ({ node: _node, className, ...props }) => (
          <h4
            className={cn(
              'mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h5: ({ node: _node, className, ...props }) => (
          <h5
            className={cn(
              'my-4 text-lg font-semibold first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h6: ({ node: _node, className, ...props }) => (
          <h6
            className={cn('my-4 font-semibold first:mt-0 last:mb-0', className)}
            {...props}
          />
        ),
        p: ({ node: _node, className, ...props }) => (
          <p
            className={cn(
              // "mb-5 mt-5 leading-7 first:mt-0 last:mb-0",
              className,
            )}
            {...props}
          />
        ),
        a: ({ node: _node, className, ...props }) => (
          <a
            target='_blank'
            className={cn(
              'text-primary text-blue-400 font-medium underline underline-offset-4 inline-flex items-baseline relative pr-[1.1em]',
              className,
            )}
            {...props}>
            {props.children}
            <ExternalLink className='w-3 h-3 absolute top-1 right-1' />
          </a>
        ),
        blockquote: ({ node: _node, className, ...props }) => (
          <blockquote
            className={cn('border-l-2 pl-6 italic', className)}
            {...props}
          />
        ),
        ul: ({ node: _node, className, ...props }) => (
          <ul
            className={cn('my-5 ml-6 list-disc [&>li]:mt-2', className)}
            {...props}
          />
        ),
        ol: ({ node: _node, className, ...props }) => (
          <ol
            className={cn('my-5 ml-6 list-decimal [&>li]:mt-2', className)}
            {...props}
          />
        ),
        hr: ({ node: _node, className, ...props }) => (
          <hr className={cn('my-5 border-b', className)} {...props} />
        ),
        table: ({ node: _node, className, ...props }) => (
          <table
            className={cn(
              'my-5 w-full border-separate border-spacing-0 overflow-y-auto',
              className,
            )}
            {...props}
          />
        ),
        th: ({ node: _node, className, ...props }) => (
          <th
            className={cn(
              'bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
              className,
            )}
            {...props}
          />
        ),
        td: ({ node: _node, className, ...props }) => (
          <td
            className={cn(
              'border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right',
              className,
            )}
            {...props}
          />
        ),
        tr: ({ node: _node, className, ...props }) => (
          <tr
            className={cn(
              'm-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
              className,
            )}
            {...props}
          />
        ),
        sup: ({ node: _node, className, ...props }) => (
          <sup
            className={cn('[&>a]:text-xs [&>a]:no-underline', className)}
            {...props}
          />
        ),
        // pre: Pre,
        code: Code,
        img: IMG,
      }}>
      {children}
    </Markdown>
  )
}

export const MarkdownText = memo(MarkdownTextImpl)
