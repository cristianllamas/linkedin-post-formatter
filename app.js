(() => {
  'use strict';
  const STORAGE_KEY = 'cristian-linkedin-post-formatter-v1';
  const editor = document.querySelector('#editor');
  const preview = document.querySelector('#preview');
  const count = document.querySelector('#characterCount');
  const lines = document.querySelector('#lineCount');
  const savedLabel = document.querySelector('#savedLabel');
  const copyStatus = document.querySelector('#copyStatus');
  const emojiPopover = document.querySelector('#emojiPopover');
  const emojiList = document.querySelector('#emojiList');
  const emojiSearch = document.querySelector('#emojiSearch');

  const emojis = [
    ['😀','grinning'],['😂','laugh tears'],['😍','love eyes'],['🤔','thinking'],['🙌','praise'],['👏','clap'],['💡','idea lightbulb'],['🔥','fire'],['✨','sparkles'],['🚀','rocket growth'],['🎯','target focus'],['✅','check done'],['❌','cross no'],['⚠️','warning'],['💬','comment speech'],['❤️','heart'],['💙','blue heart'],['🙏','thanks'],['👀','eyes'],['👉','point'],['👇','down'],['☝️','up'],['💪','strong'],['🌱','growth'],['🌍','world'],['🤝','partnership'],['📌','pin'],['📣','announce'],['🧠','brain learning'],['🎉','celebrate']
  ];
  const maps = {
    bold: { a:0x1d41a, A:0x1d400, zero:0x1d7ce },
    italic: { a:0x1d44e, A:0x1d434 },
    strike: { a:0, A:0 }
  };
  const letter = (char, type) => {
    const code = char.codePointAt(0);
    if ((type === 'strike' || type === 'underline') && /[\p{L}\p{N}]/u.test(char)) return char + (type === 'strike' ? '\u0336' : '\u0332');
    const m = maps[type];
    if (!m) return char;
    if (code >= 48 && code <= 57 && m.zero) return String.fromCodePoint(m.zero + code - 48);
    if (code >= 65 && code <= 90 && m.A) return String.fromCodePoint(m.A + code - 65);
    if (code >= 97 && code <= 122 && m.a) return String.fromCodePoint(m.a + code - 97);
    return char;
  };
  const transform = (value, type) => Array.from(value).map(c => letter(c,type)).join('');
  const replaceSelection = (replacement) => {
    const start = editor.selectionStart; const end = editor.selectionEnd;
    editor.setRangeText(replacement, start, end, 'select'); editor.focus(); saveAndRender();
  };
  const selectedOrLine = () => {
    const start = editor.selectionStart; const end = editor.selectionEnd;
    if (start !== end) return {start,end,text:editor.value.slice(start,end)};
    const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
    const next = editor.value.indexOf('\n', start); const lineEnd = next < 0 ? editor.value.length : next;
    return {start:lineStart,end:lineEnd,text:editor.value.slice(lineStart,lineEnd)};
  };
  const toggleList = (ordered) => {
    const {start,end,text} = selectedOrLine();
    const prefix = ordered ? /^\d+\.\s/ : /^[-•]\s/;
    const updated = text.split('\n').map((line,i) => {
      if (prefix.test(line)) return line.replace(prefix,'');
      return ordered ? `${i + 1}. ${line}` : `• ${line}`;
    }).join('\n');
    editor.setRangeText(updated,start,end,'select'); saveAndRender();
  };
  const escape = (s) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const renderPreview = (value) => {
    if (!value.trim()) { preview.innerHTML = '<p class="empty-state">Your preview will appear here.</p>'; return; }
    const blocks = value.split(/\n{2,}/);
    preview.innerHTML = blocks.map(block => {
      const rows = block.split('\n');
      if (rows.every(r => /^•\s/.test(r))) return `<ul>${rows.map(r=>`<li>${escape(r.slice(2))}</li>`).join('')}</ul>`;
      if (rows.every(r => /^\d+\.\s/.test(r))) return `<ol>${rows.map(r=>`<li>${escape(r.replace(/^\d+\.\s/,''))}</li>`).join('')}</ol>`;
      return `<p>${rows.map(escape).join('<br>')}</p>`;
    }).join('');
  };
  function saveAndRender() {
    const value = editor.value; localStorage.setItem(STORAGE_KEY,value); renderPreview(value);
    count.textContent = `${value.length.toLocaleString()} character${value.length === 1 ? '' : 's'}`;
    const lineCount = value ? value.split('\n').length : 0; lines.textContent = `${lineCount} line${lineCount === 1 ? '' : 's'}`;
    savedLabel.textContent = 'Autosaved';
  }
  const renderEmojis = () => {
    const q = emojiSearch.value.trim().toLowerCase();
    emojiList.innerHTML = emojis.filter(([,name])=>!q || name.includes(q)).map(([emoji,name])=>`<button class="emoji-item" title="${name}" data-emoji="${emoji}">${emoji}</button>`).join('') || '<small>No emojis found.</small>';
  };
  document.querySelectorAll('[data-format]').forEach(button => button.addEventListener('click', () => { const {text} = selectedOrLine(); if (text) replaceSelection(transform(text,button.dataset.format)); }));
  document.querySelector('#bulletButton').addEventListener('click', () => toggleList(false));
  document.querySelector('#numberButton').addEventListener('click', () => toggleList(true));
  document.querySelector('#emojiButton').addEventListener('click', () => { emojiPopover.hidden = !emojiPopover.hidden; if (!emojiPopover.hidden) { emojiSearch.focus(); renderEmojis(); } });
  emojiSearch.addEventListener('input', renderEmojis);
  emojiList.addEventListener('click', e => { if (e.target.dataset.emoji) { replaceSelection(e.target.dataset.emoji); emojiPopover.hidden = true; } });
  document.addEventListener('click', e => { if (!emojiPopover.contains(e.target) && e.target.id !== 'emojiButton') emojiPopover.hidden = true; });
  editor.addEventListener('input', saveAndRender);
  document.querySelector('#copyButton').addEventListener('click', async () => { try { await navigator.clipboard.writeText(editor.value); copyStatus.textContent='Copied to clipboard'; setTimeout(()=>copyStatus.textContent='',2200); } catch { copyStatus.textContent='Copy failed — select the text manually'; } });
  document.querySelector('#clearButton').addEventListener('click', () => { if (editor.value && !window.confirm('Clear the saved post?')) return; editor.value=''; localStorage.removeItem(STORAGE_KEY); saveAndRender(); savedLabel.textContent='No saved post'; });
  editor.value = localStorage.getItem(STORAGE_KEY) || '';
  saveAndRender();
})();
