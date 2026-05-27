// ===== Reference Format Templates =====
const REF_TEMPLATES = {
  journal: [
    { id: 'authors', label: '作者（多人用逗号分隔）', placeholder: '张三, 李四, Wang Wu' },
    { id: 'title', label: '文章标题', placeholder: '人工智能在教育领域的应用研究' },
    { id: 'journal', label: '期刊名称', placeholder: '计算机学报' },
    { id: 'year', label: '年份', placeholder: '2024' },
    { id: 'volume', label: '卷号', placeholder: '47' },
    { id: 'issue', label: '期号', placeholder: '3' },
    { id: 'pages', label: '页码', placeholder: '123-135' },
    { id: 'doi', label: 'DOI（选填）', placeholder: '10.xxxx/xxxxx' },
  ],
  book: [
    { id: 'authors', label: '作者', placeholder: '张三, 李四' },
    { id: 'title', label: '书名', placeholder: '深度学习' },
    { id: 'publisher', label: '出版社', placeholder: '清华大学出版社' },
    { id: 'year', label: '出版年份', placeholder: '2023' },
    { id: 'city', label: '出版城市', placeholder: '北京' },
    { id: 'pages', label: '引用页码（选填）', placeholder: '45-67' },
  ],
  thesis: [
    { id: 'authors', label: '作者', placeholder: '张三' },
    { id: 'title', label: '论文题目', placeholder: '基于深度学习的图像识别研究' },
    { id: 'school', label: '学校', placeholder: '清华大学' },
    { id: 'year', label: '年份', placeholder: '2024' },
    { id: 'level', label: '级别', placeholder: '硕士', type: 'select', options: ['本科', '硕士', '博士'] },
  ],
  web: [
    { id: 'authors', label: '作者（选填）', placeholder: '张三' },
    { id: 'title', label: '网页标题', placeholder: '中国人工智能发展报告 2024' },
    { id: 'url', label: '网址', placeholder: 'https://example.com/report' },
    { id: 'website', label: '网站名称', placeholder: '新华网' },
    { id: 'publishDate', label: '发布日期', placeholder: '2024-03-15' },
    { id: 'accessDate', label: '访问日期', placeholder: '2024-05-27' },
  ],
  conference: [
    { id: 'authors', label: '作者', placeholder: '张三, 李四' },
    { id: 'title', label: '论文标题', placeholder: '大语言模型的最新进展' },
    { id: 'conference', label: '会议名称', placeholder: 'ACL 2024' },
    { id: 'year', label: '年份', placeholder: '2024' },
    { id: 'pages', label: '页码', placeholder: '112-120' },
    { id: 'location', label: '会议地点', placeholder: 'Bangkok, Thailand' },
  ],
};

// ===== Reference Formatters =====
function formatRefGB7714(type, data) {
  const a = data.authors || '';
  const t = data.title || '';
  const y = data.year || '';

  switch (type) {
    case 'journal':
      return `[1] ${a}. ${t}[J]. ${data.journal||''}, ${y}, ${data.volume||''}(${data.issue||''}): ${data.pages||''}.`;
    case 'book':
      return `[1] ${a}. ${t}[M]. ${data.city||''}: ${data.publisher||''}, ${y}.`;
    case 'thesis':
      return `[1] ${a}. ${t}[D]. ${data.school||''}, ${y}.`;
    case 'web':
      return `[1] ${a}. ${t}[EB/OL]. (${data.publishDate||y}) [${data.accessDate||''}]. ${data.url||''}.`;
    case 'conference':
      return `[1] ${a}. ${t}[C]//${data.conference||''}. ${data.location||''}, ${y}: ${data.pages||''}.`;
    default: return '';
  }
}

function formatRefAPA(type, data) {
  const a = formatAPAAuthors(data.authors || '');
  const t = data.title || '';
  const y = data.year || '';

  switch (type) {
    case 'journal':
      return `${a} (${y}). ${t}. *${data.journal||''}*, *${data.volume||''}*(${data.issue||''}), ${data.pages||''}.${data.doi ? ' https://doi.org/' + data.doi : ''}`;
    case 'book':
      return `${a} (${y}). *${t}*. ${data.publisher||''}.`;
    case 'thesis':
      return `${a} (${y}). *${t}* [Doctoral dissertation/Master's thesis, ${data.school||''}].`;
    case 'web':
      return `${a} (${y}). ${t}. ${data.website||''}. ${data.url||''}`;
    case 'conference':
      return `${a} (${y}). ${t}. In *${data.conference||''}* (pp. ${data.pages||''}). ${data.location||''}.`;
    default: return '';
  }
}

function formatRefMLA(type, data) {
  const a = formatMLAAuthors(data.authors || '');
  const t = `"${data.title || ''}"`;
  const y = data.year || '';

  switch (type) {
    case 'journal':
      return `${a}. ${t} *${data.journal||''}*, vol. ${data.volume||''}, no. ${data.issue||''}, ${y}, pp. ${data.pages||''}.`;
    case 'book':
      return `${a}. *${t}*. ${data.publisher||''}, ${y}.`;
    case 'thesis':
      return `${a}. ${t} ${data.level||'Master\'s'} thesis, ${data.school||''}, ${y}.`;
    case 'web':
      return `${a}. ${t} *${data.website||''}*, ${data.publishDate||y}. Web. ${data.accessDate||''}.`;
    case 'conference':
      return `${a}. ${t} *${data.conference||''}*, ${y}, pp. ${data.pages||''}.`;
    default: return '';
  }
}

function formatRefIEEE(type, data) {
  const a = data.authors || '';
  const t = data.title || '';
  const y = data.year || '';

  switch (type) {
    case 'journal':
      return `${a}, "${t}," *${data.journal||''}*, vol. ${data.volume||''}, no. ${data.issue||''}, pp. ${data.pages||''}, ${y}.`;
    case 'book':
      return `${a}, *${t}*. ${data.city||''}: ${data.publisher||''}, ${y}.`;
    case 'thesis':
      return `${a}, "${t}," ${data.level||'Master\'s'} thesis, ${data.school||''}, ${y}.`;
    case 'web':
      return `${a}, "${t}," ${data.website||''}, ${data.publishDate||y}. [Online]. Available: ${data.url||''}. [Accessed: ${data.accessDate||''}].`;
    case 'conference':
      return `${a}, "${t}," in *${data.conference||''}*, ${data.location||''}, ${y}, pp. ${data.pages||''}.`;
    default: return '';
  }
}

function formatRefChicago(type, data) {
  const a = data.authors || '';
  const t = data.title || '';
  const y = data.year || '';

  switch (type) {
    case 'journal':
      return `${a}. "${t}." *${data.journal||''}* ${data.volume||''}, no. ${data.issue||''} (${y}): ${data.pages||''}.`;
    case 'book':
      return `${a}. *${t}*. ${data.city||''}: ${data.publisher||''}, ${y}.`;
    case 'thesis':
      return `${a}. "${t}." ${data.level||'Master\'s'} thesis, ${data.school||''}, ${y}.`;
    case 'web':
      return `${a}. "${t}." ${data.website||''}. ${data.publishDate||y}. ${data.url||''}.`;
    case 'conference':
      return `${a}. "${t}." Paper presented at ${data.conference||''}, ${data.location||''}, ${y}.`;
    default: return '';
  }
}

function formatAPAAuthors(authors) {
  return authors.split(/[,，]/).map(a => {
    a = a.trim();
    if (!a) return '';
    const parts = a.split(/\s+/);
    if (parts.length >= 2) return parts[parts.length-1] + ', ' + parts.slice(0,-1).map(p => p[0] + '.').join(' ');
    return a;
  }).filter(Boolean).join(', & ');
}

function formatMLAAuthors(authors) {
  const arr = authors.split(/[,，]/).map(a => a.trim()).filter(Boolean);
  if (arr.length === 0) return '';
  if (arr.length === 1) {
    const parts = arr[0].split(/\s+/);
    if (parts.length >= 2) return parts[parts.length-1] + ', ' + parts.slice(0,-1).join(' ');
    return arr[0];
  }
  const first = arr[0].split(/\s+/);
  const formatted = first.length >= 2 ? first[first.length-1] + ', ' + first.slice(0,-1).join(' ') : arr[0];
  return formatted + ', et al.';
}

function getFormatter(format) {
  switch (format) {
    case 'gbt7714': return formatRefGB7714;
    case 'apa': return formatRefAPA;
    case 'mla': return formatRefMLA;
    case 'ieee': return formatRefIEEE;
    case 'chicago': return formatRefChicago;
    default: return formatRefGB7714;
  }
}

// ===== Format Conversion =====
function mdToHtml(md) {
  let html = md;
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Bold/Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><(h[1-3]|ul|ol|li)/g, '<$1');
  html = html.replace(/<\/(h[1-3]|ul|ol|li)><\/p>/g, '</$1>');
  return html;
}

function htmlToMd(html) {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  return md.trim();
}

function textToHtml(text) {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  return '<p>' + html + '</p>';
}

// ===== Tex/Latex Conversion =====
function texToHtml(tex) {
  let html = tex;
  // Sections
  html = html.replace(/\\chapter\{([^}]+)\}/g, '<h1>$1</h1>');
  html = html.replace(/\\section\{([^}]+)\}/g, '<h2>$1</h2>');
  html = html.replace(/\\subsection\{([^}]+)\}/g, '<h3>$1</h3>');
  html = html.replace(/\\subsubsection\{([^}]+)\}/g, '<h4>$1</h4>');
  // Text formatting
  html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
  html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
  html = html.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');
  html = html.replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
  // Lists
  html = html.replace(/\\begin\{itemize\}/g, '<ul>');
  html = html.replace(/\\end\{itemize\}/g, '</ul>');
  html = html.replace(/\\begin\{enumerate\}/g, '<ol>');
  html = html.replace(/\\end\{enumerate\}/g, '</ol>');
  html = html.replace(/\\item\s*/g, '<li>');
  // Math (simplified)
  html = html.replace(/\$\$([^$]+)\$\$/g, '<div class="math">$$1</div>');
  html = html.replace(/\$([^$]+)\$/g, '<span class="math">$1</span>');
  // Abstract
  html = html.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, '<div class="abstract"><h3>摘要</h3>$1</div>');
  // Remove remaining commands
  html = html.replace(/\\cite\{[^}]+\}/g, '[引用]');
  html = html.replace(/\\ref\{[^}]+\}/g, '[引用]');
  html = html.replace(/\\label\{[^}]+\}/g, '');
  html = html.replace(/\\begin\{[^}]+\}/g, '');
  html = html.replace(/\\end\{[^}]+\}/g, '');
  html = html.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');
  html = html.replace(/\\[a-zA-Z]+/g, '');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  return html;
}

function htmlToTex(html) {
  let tex = html;
  tex = tex.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\\section{$1}\n\n');
  tex = tex.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\\subsection{$1}\n\n');
  tex = tex.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\\subsubsection{$1}\n\n');
  tex = tex.replace(/<strong>(.*?)<\/strong>/gi, '\\textbf{$1}');
  tex = tex.replace(/<em>(.*?)<\/em>/gi, '\\textit{$1}');
  tex = tex.replace(/<li>(.*?)<\/li>/gi, '\\item $1\n');
  tex = tex.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  tex = tex.replace(/<br\s*\/?>/gi, '\n');
  tex = tex.replace(/<[^>]+>/g, '');
  return tex.trim();
}

// ===== Docx Generation (simplified) =====
function generateDocxContent(html) {
  // For a real implementation, use docx.js library
  // This generates a downloadable HTML that Word can open
  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:SimSun,serif;font-size:12pt;line-height:1.5}h1{font-family:SimHei;text-align:center;font-size:22pt}h2{font-family:SimHei;font-size:16pt}h3{font-family:SimHei;font-size:14pt}p{text-indent:2em}</style></head><body>${html}</body></html>`;
}
