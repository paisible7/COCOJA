import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { marked } from 'marked'
import hljs from 'highlight.js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, (m) => map[m] ?? m)
}

// ─── Markdown rendering with syntax highlighting ─────────────

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderer = new marked.Renderer()

// Custom code block renderer with copy button placeholder
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const label = lang || 'code'
  const highlighted = hljs.highlight(text, { language }).value
  return `<div class="code-block-wrapper group/code">
    <div class="code-block-header">
      <span class="code-block-lang">${escapeHTML(label)}</span>
      <button class="copy-code-btn" data-code="${escapeHTML(text)}" title="Copier le code" type="button">
        <span class="copy-icon">📋</span>
        <span class="copy-text">Copier</span>
      </button>
    </div>
    <pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>
  </div>`
}

// Inline code
renderer.codespan = function ({ text }: { text: string }) {
  return `<code class="inline-code">${text}</code>`
}

marked.use({ renderer })

export function renderMarkdown(text: string): string {
  try {
    return marked.parse(text) as string
  } catch {
    return escapeHTML(text)
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}
