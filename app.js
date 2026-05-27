// ===== App State =====
let currentRefType = 'journal';
let currentRefFormat = 'gbt7714';
let currentPreset = 'gb';
let refList = [];
let currentFile = null;
let currentFileContent = '';
let currentFileExt = '';

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderRefForm('journal');
  setupDragDrop();
});

// ===== Navigation =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  const navLink = document.querySelector(`[data-nav="${page}"]`);
  if (navLink) navLink.classList.add('active');
  window.scrollTo(0, 0);
}

// ===== Drag & Drop =====
function setupDragDrop() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFileObj(e.dataTransfer.files[0]);
  });
  zone.addEventListener('click', () => document.getElementById('fileInput').click());
}

function handleFile(input) {
  if (input.files.length) handleFileObj(input.files[0]);
}

function handleFileObj(file) {
  currentFile = file;
  currentFileExt = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();
  reader.onload = e => {
    currentFileContent = e.target.result;
    showConvertOptions();
  };
  if (currentFileExt === 'pdf') {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

function showConvertOptions() {
  document.getElementById('convertOptions').style.display = 'block';
  const info = document.getElementById('fileInfo');
  const size = (currentFile.size / 1024).toFixed(1);
  info.innerHTML = `<strong>${currentFile.name}</strong> (${size} KB) - ${getFormatName(currentFileExt)}`;

  const targets = getTargetFormats(currentFileExt);
  const container = document.getElementById('formatButtons');
  container.innerHTML = '';
  targets.forEach(fmt => {
    const btn = document.createElement('button');
    btn.className = 'fmt-btn' + (fmt === targets[0] ? ' active' : '');
    btn.textContent = getFormatName(fmt);
    btn.dataset.format = fmt;
    btn.onclick = () => {
      container.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
    container.appendChild(btn);
  });
}

function getTargetFormats(ext) {
  const map = {
    md: ['html', 'txt', 'docx', 'tex'],
    txt: ['md', 'html', 'docx', 'tex'],
    html: ['md', 'txt', 'docx', 'tex'],
    tex: ['md', 'html', 'txt', 'docx'],
    docx: ['md', 'html', 'txt'],
    pdf: ['txt', 'md'],
  };
  return map[ext] || ['txt'];
}

function getFormatName(ext) {
  return { md: 'Markdown', html: 'HTML', txt: '纯文本', docx: 'Word 文档', tex: 'LaTeX', pdf: 'PDF' }[ext] || ext.toUpperCase();
}

function startConvert() {
  const targetBtn = document.querySelector('#formatButtons .fmt-btn.active');
  if (!targetBtn) return showToast('请选择目标格式');
  const target = targetBtn.dataset.format;
  let result = '';

  const source = currentFileExt;
  const content = currentFileContent;

  // Convert chain: source -> html -> target
  let html = '';
  switch (source) {
    case 'md': html = mdToHtml(content); break;
    case 'html': html = content; break;
    case 'tex': html = texToHtml(content); break;
    case 'txt': html = textToHtml(content); break;
    case 'docx': html = content; break; // simplified
    case 'pdf': html = textToHtml(content); break;
    default: html = textToHtml(content);
  }

  switch (target) {
    case 'md': result = htmlToMd(html); break;
    case 'html': result = html; break;
    case 'txt': result = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(); break;
    case 'tex': result = htmlToTex(html); break;
    case 'docx': result = generateDocxContent(html); break;
    default: result = html;
  }

  document.getElementById('convertResult').style.display = 'block';
  document.getElementById('outputPreview').innerHTML = `<pre>${escapeHtml(result.substring(0, 2000))}${result.length > 2000 ? '\n...(内容已截断，下载查看完整内容)' : ''}</pre>`;
  window._convertResult = { content: result, target, filename: currentFile.name.replace(/\.[^.]+$/, '.' + target) };
  showToast('转换完成！');
}

function downloadResult() {
  if (!window._convertResult) return;
  const { content, target, filename } = window._convertResult;
  const mimeTypes = { html: 'text/html', md: 'text/markdown', txt: 'text/plain', tex: 'application/x-tex', docx: 'application/msword' };
  const blob = new Blob([content], { type: mimeTypes[target] || 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function copyResult() {
  if (!window._convertResult) return;
  navigator.clipboard.writeText(window._convertResult.content).then(() => showToast('已复制'));
}

// ===== Reference =====
function selectRefType(type, el) {
  currentRefType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderRefForm(type);
}

function selectFormat(fmt, el) {
  currentRefFormat = fmt;
  document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function renderRefForm(type) {
  const fields = REF_TEMPLATES[type];
  const form = document.getElementById('refForm');
  form.innerHTML = '';
  fields.forEach(f => {
    const group = document.createElement('div');
    group.className = 'form-group';
    if (f.type === 'select') {
      group.innerHTML = `<label>${f.label}</label><select id="ref_${f.id}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
    } else {
      group.innerHTML = `<label>${f.label}</label><input type="text" id="ref_${f.id}" placeholder="${f.placeholder}">`;
    }
    form.appendChild(group);
  });
}

function getRefData() {
  const fields = REF_TEMPLATES[currentRefType];
  const data = {};
  fields.forEach(f => {
    const el = document.getElementById(`ref_${f.id}`);
    data[f.id] = el ? el.value.trim() : '';
  });
  return data;
}

function generateRef() {
  const data = getRefData();
  const formatter = getFormatter(currentRefFormat);
  const result = formatter(currentRefType, data);
  const out = document.getElementById('refOutput');
  out.innerHTML = escapeHtml(result) + '<button class="copy-btn" onclick="copyOutput(\'refOutput\')">复制</button>';
}

function addToList() {
  const data = getRefData();
  const formatter = getFormatter(currentRefFormat);
  const text = formatter(currentRefType, data);
  if (!text) return showToast('请先填写信息并生成');
  refList.push({ type: currentRefType, data, text });
  renderRefList();
  showToast('已添加到列表');
}

function renderRefList() {
  const container = document.getElementById('refList');
  document.getElementById('refCount').textContent = `(${refList.length})`;
  container.innerHTML = refList.map((item, i) => `
    <div class="ref-item">
      <span class="ref-text">${escapeHtml(item.text)}</span>
      <span class="ref-delete" onclick="deleteRef(${i})">&times;</span>
    </div>
  `).join('');
}

function deleteRef(i) {
  refList.splice(i, 1);
  renderRefList();
}

function exportRefList(format) {
  if (!refList.length) return showToast('列表为空');
  const formatter = getFormatter(format);
  const lines = refList.map((item, i) => {
    const formatted = formatter(item.type, item.data);
    return formatted.replace('[1]', `[${i + 1}]`);
  });
  const text = lines.join('\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('已复制全部参考文献'));
}

function clearRefList() {
  refList = [];
  renderRefList();
}

// ===== Paper Formatting =====
function selectPreset(preset, el) {
  currentPreset = preset;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

const PRESETS = {
  gb: { fontFamily: 'SimSun', fontSize: '12', lineHeight: '1.5', titleFont: 'SimHei', titleSize: '22' },
  thesis: { fontFamily: 'SimSun', fontSize: '12', lineHeight: '1.5', titleFont: 'SimHei', titleSize: '22' },
  master: { fontFamily: 'SimSun', fontSize: '12', lineHeight: '1.5', titleFont: 'SimHei', titleSize: '22' },
  journal: { fontFamily: 'Times New Roman', fontSize: '10.5', lineHeight: '1.5', titleFont: 'Times New Roman', titleSize: '14' },
};

function formatPaper() {
  const input = document.getElementById('templateInput').value;
  if (!input.trim()) return showToast('请先粘贴论文内容');

  const fontFamily = document.getElementById('fontFamily').value;
  const fontSize = document.getElementById('fontSize').value;
  const lineHeight = document.getElementById('lineHeight').value;
  const preview = document.getElementById('paperPreview');

  let html = mdToHtml(input);
  // If no markdown detected, treat as plain text
  if (!input.includes('#') && !input.includes('**')) {
    html = textToHtml(input);
  }

  preview.style.fontFamily = `"${fontFamily}", "Times New Roman", serif`;
  preview.style.fontSize = fontSize + 'pt';
  preview.style.lineHeight = lineHeight;
  preview.innerHTML = html;
  showToast('排版完成');
}

function exportFormatted(format) {
  const preview = document.getElementById('paperPreview');
  const content = preview.innerHTML;
  if (!content) return showToast('请先排版');

  if (format === 'html') {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>论文</title><style>body{font-family:SimSun,serif;font-size:12pt;line-height:1.5;padding:40px}h1{font-family:SimHei;text-align:center}h2{font-family:SimHei}h3{font-family:SimHei}p{text-indent:2em}</style></head><body>${content}</body></html>`;
    downloadText(fullHtml, '论文排版.html', 'text/html');
  } else {
    const text = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
    downloadText(text, '论文内容.txt', 'text/plain');
  }
}

// ===== Tools =====
function checkSimilarity() {
  const t1 = document.getElementById('checkText1').value;
  const t2 = document.getElementById('checkText2').value;
  if (!t1 || !t2) return showToast('请输入两段文本');

  const words1 = new Set(t1.split(/\s+/));
  const words2 = new Set(t2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  const jaccard = (intersection.size / union.size * 100).toFixed(1);

  // LCS-based similarity
  const lcs = LCSLength(t1.split(/\s+/), t2.split(/\s+/));
  const lcsRatio = (lcs / Math.max(t1.split(/\s+/).length, t2.split(/\s+/).length) * 100).toFixed(1);

  document.getElementById('checkOutput').innerHTML =
    `Jaccard 相似度: ${jaccard}%\nLCS 相似度: ${lcsRatio}%\n共同词汇: ${intersection.size} 个\n综合评估: ${parseFloat(jaccard) > 60 ? '⚠️ 高度相似' : parseFloat(jaccard) > 30 ? '⚡ 部分相似' : '✅ 差异较大'}`;
}

function LCSLength(a, b) {
  const m = a.length, n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

function countWords() {
  const text = document.getElementById('countInput').value;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const lines = text ? text.split('\n').length : 0;
  const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
  const english = (text.match(/[a-zA-Z]+/g) || []).length;

  document.getElementById('countStats').innerHTML = `
    <div class="stat-item"><div class="value">${chars}</div><div class="label">总字符</div></div>
    <div class="stat-item"><div class="value">${charsNoSpace}</div><div class="label">不含空格</div></div>
    <div class="stat-item"><div class="value">${cjk}</div><div class="label">中文字数</div></div>
    <div class="stat-item"><div class="value">${english}</div><div class="label">英文单词</div></div>
    <div class="stat-item"><div class="value">${lines}</div><div class="label">行数</div></div>
    <div class="stat-item"><div class="value">${Math.ceil(cjk / 400)}</div><div class="label">预计页数</div></div>
  `;
}

function genSummary(lang) {
  const text = document.getElementById('summaryInput').value;
  if (!text) return showToast('请先粘贴论文正文');

  // Extract key sentences (first and last of each paragraph)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  const sentences = [];
  paragraphs.forEach(p => {
    const s = p.replace(/\n/g, ' ').split(/[。！？.!?]+/).filter(s => s.trim().length > 10);
    if (s.length > 0) sentences.push(s[0].trim());
    if (s.length > 2) sentences.push(s[s.length - 1].trim());
  });

  let summary = sentences.slice(0, 6).join('。') + '。';
  if (lang === 'en') {
    summary = 'This paper presents research findings. ' +
      sentences.slice(0, 4).map(s => s.replace(/[。！？]/g, '')).join('. ') + '.';
  }

  setOutput('summaryOutput', summary);
}

function translate(direction) {
  const text = document.getElementById('transInput').value;
  if (!text) return showToast('请先输入内容');

  // Simple dictionary-based translation for common academic terms
  const dict = {
    '研究': 'research', '方法': 'method', '结果': 'result', '结论': 'conclusion',
    '实验': 'experiment', '分析': 'analysis', '数据': 'data', '模型': 'model',
    '算法': 'algorithm', '系统': 'system', '设计': 'design', '问题': 'problem',
    '方案': 'solution', '性能': 'performance', '效率': 'efficiency', '优化': 'optimization',
    '深度学习': 'deep learning', '机器学习': 'machine learning', '人工智能': 'artificial intelligence',
    '神经网络': 'neural network', '自然语言处理': 'natural language processing',
    '计算机视觉': 'computer vision', '大数据': 'big data', '云计算': 'cloud computing',
  };

  let result = text;
  if (direction === 'en') {
    Object.entries(dict).forEach(([cn, en]) => { result = result.replace(new RegExp(cn, 'g'), en); });
  } else {
    Object.entries(dict).forEach(([cn, en]) => { result = result.replace(new RegExp(en, 'gi'), cn); });
  }

  setOutput('transOutput', result + '\n\n(注：此为基础翻译，建议人工校对)');
}

function extractKeywords() {
  const text = document.getElementById('keywordInput').value;
  if (!text) return showToast('请先输入内容');

  // Simple TF-based keyword extraction
  const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or', 'not', 'no', 'so', 'if', 'then', 'than', 'too', 'very', 'just', 'about', 'up', 'out', 'it', 'its', 'this', 'that', 'these', 'those']);

  const words = text.replace(/[^一-龥a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const keywords = sorted.map(([w, c]) => w).join('、');
  setOutput('keywordOutput', `关键词：${keywords}\n\n词频统计：\n${sorted.map(([w, c]) => `${w}: ${c}`).join('\n')}`);
}

function convertDate(format) {
  const input = document.getElementById('dateInput').value;
  if (!input) return showToast('请输入日期');

  let d = new Date(input);
  if (isNaN(d.getTime())) {
    // Try parsing Chinese format
    const m = input.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (m) d = new Date(+m[1], +m[2]-1, +m[3]);
  }
  if (isNaN(d.getTime())) return showToast('无法识别的日期格式');

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let result;
  switch (format) {
    case 'cn': result = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; break;
    case 'en': result = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; break;
    case 'gb': result = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; break;
  }
  setOutput('dateOutput', result);
}

// ===== Utility =====
function setOutput(id, html) {
  const el = document.getElementById(id);
  el.innerHTML = escapeHtml(html) + '<button class="copy-btn" onclick="copyOutput(\'' + id + '\')">复制</button>';
}

function copyOutput(id) {
  const el = document.getElementById(id);
  const text = el.innerText.replace('复制', '').trim();
  navigator.clipboard.writeText(text).then(() => showToast('已复制'));
}

function downloadText(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Premium =====
function showPremium() { document.getElementById('premiumModal').classList.add('active'); }
function closePremium(e) { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); }
function handlePay(plan) { showToast('支付功能接入中...'); }
