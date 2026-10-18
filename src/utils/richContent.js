/**
 * Utility to process article/blog/case study content.
 * Handles:
 * 1. CKEditor HTML with classes and blocks
 * 2. Markdown syntax (headings, bold, lists, inline code, codeblocks, blockquotes)
 * 3. Sanitized fallback formatting
 */
export const formatRichContent = (content) => {
  if (!content) return '';

  let str = String(content).trim();

  // If already full HTML with tags (like <p>, <div>, <h1>, <ul>), return with standard wrapping
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(str);

  // If content contains markdown headings or formatting, or doesn't have standard HTML tags, convert markdown to HTML
  const hasMarkdown = /(^|\n)#{1,6}\s+|(\*\*|__)(.*?)\2|`([^`]+)`|(\n\s*[-*+]\s+)|```([\s\S]*?)```/.test(str);

  if (hasMarkdown || !hasHtmlTags) {
    // 1. Fenced Code blocks ```lang ... ```
    str = str.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const cleanCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="my-6 rounded-2xl bg-slate-900 text-slate-100 p-5 overflow-x-auto border border-slate-800 font-mono text-sm"><code>${cleanCode.trim()}</code></pre>`;
    });

    // 2. Headings
    str = str.replace(/^######\s+(.*$)/gim, '<h6 class="text-sm font-bold mt-4 mb-2">$1</h6>');
    str = str.replace(/^#####\s+(.*$)/gim, '<h5 class="text-base font-bold mt-5 mb-2">$1</h5>');
    str = str.replace(/^####\s+(.*$)/gim, '<h4 class="text-lg font-bold mt-6 mb-2">$1</h4>');
    str = str.replace(/^###\s+(.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">$1</h3>');
    str = str.replace(/^##\s+(.*$)/gim, '<h2 class="text-2xl font-black mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">$1</h2>');
    str = str.replace(/^#\s+(.*$)/gim, '<h1 class="text-3xl font-black mt-10 mb-5 text-slate-900 dark:text-white">$1</h1>');

    // 3. Blockquotes
    str = str.replace(/^\>\s+(.*$)/gim, '<blockquote class="border-l-4 border-teal-500 pl-4 py-2 italic my-4 text-slate-600 dark:text-slate-400 bg-teal-50/40 dark:bg-teal-950/20 rounded-r-xl">$1</blockquote>');

    // 4. Bold and Italic
    str = str.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    str = str.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // 5. Inline code
    str = str.replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold border border-teal-200 dark:border-teal-800">$1</code>');

    // 6. Unordered lists (- or *)
    str = str.replace(/(?:^|\n)[-*]\s+(.*)(?=(?:\n[-*]\s+.*)*)/g, (match) => {
      const items = match
        .trim()
        .split('\n')
        .map((line) => line.replace(/^[-*]\s+/, '').trim())
        .filter(Boolean)
        .map((item) => `<li class="flex items-start gap-2.5 my-1.5"><span class="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0"></span><span>${item}</span></li>`)
        .join('');
      return `<ul class="my-4 space-y-1">${items}</ul>`;
    });

    // 7. Ordered lists (1. 2.)
    str = str.replace(/(?:^|\n)\d+\.\s+(.*)(?=(?:\n\d+\.\s+.*)*)/g, (match) => {
      let counter = 1;
      const items = match
        .trim()
        .split('\n')
        .map((line) => line.replace(/^\d+\.\s+/, '').trim())
        .filter(Boolean)
        .map((item) => `<li class="flex items-start gap-2.5 my-1.5"><span class="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold shrink-0">${counter++}</span><span>${item}</span></li>`)
        .join('');
      return `<ol class="my-4 space-y-1">${items}</ol>`;
    });

    // 8. Paragraphs for remaining naked lines
    const blocks = str.split(/\n{2,}/);
    str = blocks
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (/^<(h[1-6]|ul|ol|blockquote|pre|table|div|p)/i.test(trimmed)) {
          return trimmed;
        }
        return `<p class="my-3 leading-relaxed">${trimmed.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('\n');
  }

  return str;
};
