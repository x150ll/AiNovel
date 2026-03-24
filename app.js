/* =========================================
   حكايا — Novel Creator Platform
   Main Application Logic + Claude API
   ========================================= */

// ===== STATE =====
const state = {
  currentStep: 1,
  genres: [],
  style: 'fusha',
  thrill: 5,
  heroName: '',
  heroTraits: [],
  secondaryChars: [],
  novelStart: '',
  novelEnd: 'open',
  chapCount: 3,
  chapLength: 'medium',
  narrator: 'third',
  extras: [],
  extraNotes: '',
  novelTitle: '',
  generatedNovel: null,
};

// ===== CURSOR =====
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('button, a, .genre-card, .novel-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '50px'; ring.style.height = '50px';
    ring.style.opacity = '0.5';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '30px'; ring.style.height = '30px';
    ring.style.opacity = '1';
  });
});

// ===== NAV =====
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

document.getElementById('navToggle').addEventListener('click', function() {
  this.classList.toggle('active');
});

document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('login'));
document.getElementById('signupBtn').addEventListener('click', () => openAuthModal('signup'));

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('ar-EG');
    if (current >= target) clearInterval(timer);
  }, 16);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelector('.hero-stats') && observer.observe(document.querySelector('.hero-stats'));

// ===== SCROLL TO GENERATOR =====
function scrollToGenerator() {
  document.getElementById('generator').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== GENRE TOGGLE =====
function toggleGenre(el) {
  const genre = el.dataset.genre;
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    if (!state.genres.includes(genre)) state.genres.push(genre);
  } else {
    state.genres = state.genres.filter(g => g !== genre);
  }
}

// ===== STYLE SELECT =====
function selectStyle(el) {
  document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.style = el.dataset.style;
}

// ===== SLIDER =====
function updateSlider(input, valId) {
  const val = input.value;
  state.thrill = parseInt(val);
  const arabicNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  document.getElementById(valId).textContent = val.toString().split('').map(d => arabicNums[d] || d).join('');
  const pct = ((val - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--val', pct + '%');
}

// ===== TRAIT TOGGLE =====
function toggleTrait(el) {
  el.classList.toggle('active');
  const trait = el.textContent;
  if (el.classList.contains('active')) {
    if (!state.heroTraits.includes(trait)) state.heroTraits.push(trait);
  } else {
    state.heroTraits = state.heroTraits.filter(t => t !== trait);
  }
}

// ===== ADD CHARACTER ROW =====
function addCharRow() {
  const container = document.getElementById('secondaryChars');
  const row = document.createElement('div');
  row.className = 'char-input-row';
  row.innerHTML = `
    <input type="text" class="form-input" placeholder="اسم الشخصية ودورها..." />
    <button class="btn-add-char" onclick="this.parentElement.remove()" style="background:rgba(255,80,80,0.1);border-color:rgba(255,80,80,0.3);color:#ff5050">−</button>
  `;
  container.appendChild(row);
}

// ===== ENDING SELECT =====
function selectEnding(el) {
  document.querySelectorAll('.ending-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.novelEnd = el.dataset.ending;
}

// ===== NUMBER COUNTER =====
const chapNum = { val: 3, min: 1, max: 20 };
function changeNum(id, delta) {
  const el = document.getElementById(id);
  chapNum.val = Math.max(chapNum.min, Math.min(chapNum.max, chapNum.val + delta));
  const arabicNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  el.textContent = chapNum.val.toString().split('').map(d => arabicNums[parseInt(d)]).join('');
  state.chapCount = chapNum.val;
}

// ===== NARRATOR SELECT =====
function selectNarrator(el) {
  document.querySelectorAll('.narrator-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.narrator = el.dataset.narrator;
}

// ===== EXTRA TOGGLE =====
function toggleExtra(el) {
  el.classList.toggle('active');
  const extra = el.dataset.extra;
  if (el.classList.contains('active')) {
    if (!state.extras.includes(extra)) state.extras.push(extra);
  } else {
    state.extras = state.extras.filter(e => e !== extra);
  }
}

// ===== STEP NAVIGATION =====
function nextStep(n) {
  // Gather current state
  state.novelTitle = document.getElementById('novelTitle')?.value || '';
  state.heroName = document.getElementById('heroName')?.value || '';
  state.novelStart = document.getElementById('novelStart')?.value || '';
  state.chapLength = document.getElementById('chapLength')?.value || 'medium';
  state.extraNotes = document.getElementById('extraNotes')?.value || '';

  // Collect secondary chars
  state.secondaryChars = Array.from(
    document.querySelectorAll('#secondaryChars input')
  ).map(i => i.value).filter(Boolean);

  if (n === 4) buildSummary();

  // Update steps
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${n}`).classList.add('active');
  state.currentStep = n;
  updateStepBar(n);

  // Scroll to generator
  document.querySelector('.generator-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepBar(current) {
  document.querySelectorAll('.step').forEach((step, i) => {
    const stepNum = i + 1;
    step.classList.remove('active', 'done');
    if (stepNum < current) step.classList.add('done');
    else if (stepNum === current) step.classList.add('active');
  });

  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('active', i + 1 < current);
  });
}

// ===== BUILD SUMMARY =====
const genreMap = {
  action: 'أكشن ومغامرة ⚔️',
  romance: 'رومانسية 💜',
  mystery: 'غموض وتشويق 🔍',
  fantasy: 'فانتازيا 🌙',
  war: 'حرب وتاريخ 🛡️',
  emotional: 'عاطفية اجتماعية 🌊',
  horror: 'رعب ونفسي 👁️',
  scifi: 'خيال علمي 🚀',
  comedy: 'كوميدية 😄',
  philosophical: 'فلسفية فكرية 🌿',
  crime: 'جريمة وإثارة 🗂️',
  spiritual: 'روحانية دينية ✨',
};

const styleMap = {
  fusha: 'فصحى راقية',
  ammiya: 'عامية محببة',
  mixed: 'مزيج فصيح-عامي',
  brief: 'مختصر ومكثف',
  detailed: 'تفصيلي غني',
};

const endingMap = {
  open: 'نهاية مفتوحة',
  happy: 'نهاية سعيدة',
  tragic: 'نهاية مأساوية',
  surprise: 'نهاية مفاجئة',
  ai: 'الذكاء الاصطناعي يختار',
};

const narratorMap = {
  third: 'الراوي العليم (هو/هي)',
  first: 'الراوي الأول (أنا)',
  second: 'الراوي الثاني (أنت)',
};

const chapLengthMap = {
  short: 'قصير (٣٠٠-٥٠٠ كلمة)',
  medium: 'متوسط (٦٠٠-١٠٠٠ كلمة)',
  long: 'طويل (١٢٠٠-٢٠٠٠ كلمة)',
};

function buildSummary() {
  const card = document.getElementById('summaryCard');
  const items = [
    { key: 'النوع', val: state.genres.map(g => genreMap[g] || g).join('، ') || 'لم يُحدد' },
    { key: 'الأسلوب', val: styleMap[state.style] || state.style },
    { key: 'مستوى التشويق', val: `${state.thrill}/10` },
    { key: 'البطل', val: state.heroName || 'تلقائي' },
    { key: 'السمات', val: state.heroTraits.join('، ') || 'بلا سمات محددة' },
    { key: 'النهاية', val: endingMap[state.novelEnd] || state.novelEnd },
    { key: 'الفصول', val: `${state.chapCount} فصول` },
    { key: 'طول الفصل', val: chapLengthMap[state.chapLength] || state.chapLength },
    { key: 'الراوي', val: narratorMap[state.narrator] || state.narrator },
    { key: 'إضافات', val: state.extras.length ? state.extras.join('، ') : 'لا توجد' },
  ];

  card.innerHTML = items.map(item => `
    <div class="summary-item">
      <span class="summary-key">${item.key}</span>
      <span class="summary-val">${item.val}</span>
    </div>
  `).join('');
}

// ===== BUILD PROMPT =====
function buildPrompt() {
  const genres = state.genres.map(g => genreMap[g] || g).join('، ');
  const style = styleMap[state.style];
  const narrator = narratorMap[state.narrator];
  const ending = endingMap[state.novelEnd];
  const chapLengthWords = { short: '٣٠٠-٥٠٠', medium: '٦٠٠-١٠٠٠', long: '١٢٠٠-٢٠٠٠' }[state.chapLength];

  let prompt = `أنت كاتب روائي عربي موهوب ومحترف. مهمتك كتابة رواية أدبية متكاملة باللغة العربية وفق المواصفات التالية:

═══ مواصفات الرواية ═══

📚 النوع الأدبي: ${genres || 'فانتازيا'}
✍️ أسلوب السرد: ${style}
🎭 شخصية الراوي: ${narrator}
⚡ مستوى التشويق: ${state.thrill}/10
`;

  if (state.novelTitle) prompt += `\n📖 عنوان الرواية: ${state.novelTitle}`;
  else prompt += `\n📖 العنوان: اختر عنواناً مناسباً وجذاباً`;

  if (state.heroName) prompt += `\n🦸 اسم البطل: ${state.heroName}`;
  if (state.heroTraits.length) prompt += `\n💫 صفات البطل: ${state.heroTraits.join('، ')}`;
  if (state.secondaryChars.length) prompt += `\n👥 الشخصيات الثانوية: ${state.secondaryChars.join(' | ')}`;
  if (state.novelStart) prompt += `\n🌅 بداية الرواية: ${state.novelStart}`;

  prompt += `\n🔚 نوع النهاية: ${ending}`;
  prompt += `\n📑 عدد الفصول: ${state.chapCount} فصول متكاملة`;
  prompt += `\n📝 طول كل فصل: حوالي ${chapLengthWords} كلمة`;

  if (state.extras.length) {
    const extraMap = {
      subplot: 'أضف حبكة فرعية موازية تثري السرد',
      twist: 'أضف منعطفاً مفاجئاً يغير مسار القصة',
      flashback: 'استخدم الفلاش باك للكشف عن أسرار الشخصيات',
      dialogue: 'اجعل الحوار بين الشخصيات غنياً ومعبراً',
      setting: 'صف البيئة والأماكن بتفصيل يجعل القارئ يشعر بأنه هناك',
      villain: 'اجعل للشرير دوافعه ومنطقه المعقد',
    };
    prompt += `\n⭐ إضافات مطلوبة:\n${state.extras.map(e => `   • ${extraMap[e] || e}`).join('\n')}`;
  }

  if (state.extraNotes) prompt += `\n💬 ملاحظات إضافية: ${state.extraNotes}`;

  prompt += `

═══ تعليمات الكتابة ═══

اكتب الرواية كاملة بجودة أدبية عالية. يجب أن:
1. يبدأ كل فصل بـ "الفصل الأول/الثاني/..." مع عنوان فرعي مبتكر
2. تكون اللغة سليمة ومعبرة حسب الأسلوب المحدد
3. تتسم الشخصيات بالعمق والواقعية
4. تتصاعد الأحداث بشكل منطقي ومشوق
5. تنتهي الرواية بنهاية مُرضية حسب النوع المحدد

اكتب الرواية الآن كاملة من البداية إلى النهاية بدون تعليق أو مقدمة منك:`;

  return prompt;
}

// ===== GENERATE NOVEL =====
async function generateNovel() {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) {
    showToast('يرجى إدخال مفتاح Claude API أولاً', 'error');
    return;
  }
  if (state.genres.length === 0) {
    showToast('يرجى اختيار نوع الرواية في الخطوة الأولى', 'warning');
    return;
  }

  localStorage.setItem('hikaya_api_key', btoa(apiKey));

  const btn = document.getElementById('generateBtn');
  btn.querySelector('.generate-text').style.display = 'none';
  btn.querySelector('.generate-loader').style.display = 'flex';
  btn.disabled = true;

  showGeneratingOverlay();

  try {
    const prompt = buildPrompt();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'خطأ في الاتصال بـ Claude API');
    }

    const data = await response.json();
    const novelText = data.content[0]?.text || '';

    if (!novelText) throw new Error('لم يتم توليد أي نص');

    state.generatedNovel = {
      text: novelText,
      title: state.novelTitle || extractTitle(novelText),
      genres: state.genres,
      style: state.style,
      chapCount: state.chapCount,
      createdAt: new Date().toISOString(),
    };

    hideGeneratingOverlay();
    displayNovel(state.generatedNovel);

  } catch (err) {
    hideGeneratingOverlay();
    showToast(`خطأ: ${err.message}`, 'error');
    console.error(err);
  } finally {
    btn.querySelector('.generate-text').style.display = 'inline';
    btn.querySelector('.generate-loader').style.display = 'none';
    btn.disabled = false;
  }
}

// ===== EXTRACT TITLE =====
function extractTitle(text) {
  const match = text.match(/^#+\s*(.+)|^(.+)\n[=─]+/m);
  if (match) return (match[1] || match[2]).trim().replace(/[#*]/g, '');
  const lines = text.split('\n').filter(l => l.trim());
  return lines[0].replace(/[#*]/g, '').trim() || 'روايتي الجديدة';
}

// ===== DISPLAY NOVEL =====
function displayNovel(novel) {
  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('resultTitle').textContent = novel.title;

  const metaEl = document.getElementById('resultMeta');
  metaEl.innerHTML = `
    <span>📚 ${novel.genres.map(g => genreMap[g] || g).join('، ')}</span>
    <span>✍️ ${styleMap[novel.style] || novel.style}</span>
    <span>📑 ${novel.chapCount} فصول</span>
    <span>⏰ ${new Date(novel.createdAt).toLocaleDateString('ar-SA')}</span>
  `;

  const chapters = parseChapters(novel.text);
  buildChaptersSidebar(chapters);
  renderNovelText(novel.text);

  document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== PARSE CHAPTERS =====
function parseChapters(text) {
  const chapters = [];
  const lines = text.split('\n');
  let current = null;

  for (const line of lines) {
    if (/^(الفصل|الباب|Chapter)\s+/i.test(line.trim()) || /^#{1,3}\s*(الفصل|الباب)/i.test(line.trim())) {
      if (current) chapters.push(current);
      current = { title: line.replace(/^#+\s*/, '').trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) chapters.push(current);
  if (chapters.length === 0) chapters.push({ title: 'الرواية', content: text });
  return chapters;
}

// ===== BUILD CHAPTERS SIDEBAR =====
function buildChaptersSidebar(chapters) {
  const sidebar = document.getElementById('chaptersSidebar');
  sidebar.innerHTML = chapters.map((ch, i) => `
    <div class="chapter-link ${i === 0 ? 'active' : ''}" onclick="scrollToChapter(${i}, this)">
      ${ch.title}
    </div>
  `).join('');
}

function scrollToChapter(index, el) {
  document.querySelectorAll('.chapter-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  const headings = document.querySelectorAll('#novelText h2');
  if (headings[index]) headings[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== RENDER NOVEL TEXT =====
function renderNovelText(text) {
  const el = document.getElementById('novelText');
  // Convert markdown-like to HTML
  let html = text
    .replace(/^#{1,3}\s*(.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .split('\n\n')
    .map(para => para.trim() ? `<p>${para.replace(/\n/g, '<br>')}</p>` : '')
    .join('');

  el.innerHTML = html;
}

// ===== GENERATING OVERLAY =====
function showGeneratingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'generatingOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(10,12,15,0.95);
    backdrop-filter: blur(12px); z-index: 9000;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 24px;
  `;
  overlay.innerHTML = `
    <div style="width:80px;height:80px;border:3px solid var(--bg-3);border-top-color:var(--teal);border-radius:50%;animation:spin 1s linear infinite;"></div>
    <div style="text-align:center;">
      <h3 style="font-family:var(--font-display);font-size:1.8rem;margin-bottom:12px;color:var(--text);">الذكاء الاصطناعي يكتب روايتك...</h3>
      <p style="color:var(--text-3);font-size:0.9rem;" id="generatingMsg">يبدع في رسم الشخصيات والأحداث</p>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `;
  document.body.appendChild(overlay);

  const msgs = [
    'يبدع في رسم الشخصيات والأحداث...',
    'يصوغ الفصل الأول بعناية...',
    'يبني الحبكة وتصاعد التوتر...',
    'يضفي اللمسات الأدبية الأخيرة...',
    'يراجع ويصقل الأسلوب...',
  ];
  let i = 0;
  const msgEl = overlay.querySelector('#generatingMsg');
  const interval = setInterval(() => {
    i = (i + 1) % msgs.length;
    if (msgEl) msgEl.textContent = msgs[i];
  }, 2500);
  overlay.dataset.interval = interval;
}

function hideGeneratingOverlay() {
  const overlay = document.getElementById('generatingOverlay');
  if (overlay) {
    clearInterval(overlay.dataset.interval);
    overlay.remove();
  }
}

// ===== NOVEL ACTIONS =====
function copyNovel() {
  if (!state.generatedNovel) return;
  navigator.clipboard.writeText(state.generatedNovel.text).then(() => {
    showToast('تم نسخ الرواية كاملة! 📋', 'success');
  });
}

function downloadNovel() {
  if (!state.generatedNovel) return;
  const blob = new Blob([state.generatedNovel.text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${state.generatedNovel.title || 'روايتي'}.txt`;
  a.click();
  showToast('تم تحميل الرواية! 📥', 'success');
}

function regenerateNovel() {
  if (confirm('هل تريد إنشاء رواية جديدة بنفس الإعدادات؟')) {
    generateNovel();
  }
}

function saveNovel() {
  if (!state.generatedNovel) return;
  const saved = JSON.parse(localStorage.getItem('hikaya_novels') || '[]');
  saved.unshift({
    ...state.generatedNovel,
    id: Date.now(),
  });
  localStorage.setItem('hikaya_novels', JSON.stringify(saved.slice(0, 50)));
  showToast('تم حفظ الرواية في مكتبتك! ✨', 'success');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
  const colors = { success: '#00b4a0', error: '#e05c5c', warning: '#f0a500' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--bg-2); border: 1px solid ${colors[type]};
    color: var(--text); padding: 14px 24px; border-radius: 100px;
    font-family: var(--font-ui); font-size: 0.9rem; font-weight: 500;
    z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    transition: all 0.3s; opacity: 0;
    display: flex; align-items: center; gap: 10px;
    white-space: nowrap;
  `;
  toast.innerHTML = `<span style="color:${colors[type]}">●</span> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== COMMUNITY NOVELS =====
const sampleNovels = [
  {
    id: 1,
    title: 'في ظل الصحراء',
    genre: 'action',
    cover: '⚔️',
    excerpt: 'كانت الرياح تحمل رائحة الموت في تلك الليلة، وكان سالم يعرف أن المعركة الحقيقية لم تبدأ بعد...',
    author: 'أحمد م.',
    rating: 4.8,
    coverBg: 'linear-gradient(135deg, #8B4513, #D2691E)',
  },
  {
    id: 2,
    title: 'قلب بين النجوم',
    genre: 'romance',
    cover: '💜',
    excerpt: 'التقت عيناهما في تلك اللحظة التي يصفها الشعراء بأنها بداية كل شيء ونهاية الفراغ...',
    author: 'سارة ع.',
    rating: 4.9,
    coverBg: 'linear-gradient(135deg, #4B0082, #9932CC)',
  },
  {
    id: 3,
    title: 'مملكة الأحلام',
    genre: 'fantasy',
    cover: '🌙',
    excerpt: 'عبرت البوابة الذهبية ولم تعرف أنها لن تعود إلى العالم الذي عرفته قبل تلك اللحظة...',
    author: 'محمد ف.',
    rating: 4.7,
    coverBg: 'linear-gradient(135deg, #00008B, #4169E1)',
  },
  {
    id: 4,
    title: 'السر المفقود',
    genre: 'mystery',
    cover: '🔍',
    excerpt: 'ثلاثة أشخاص، غرفة مغلقة، وجريمة لا يمكن تفسيرها. المحقق رامي لن يستريح حتى يجد الحقيقة...',
    author: 'نور ح.',
    rating: 4.6,
    coverBg: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  },
  {
    id: 5,
    title: 'أصداء الحرب',
    genre: 'action',
    cover: '🛡️',
    excerpt: 'بين دخان المدافع وأصوات الرصاص، كان يكتب رسائل لزوجته يعدها بالعودة... وعد يعرف أنه قد لا يستطيع الوفاء به...',
    author: 'عمر ب.',
    rating: 4.5,
    coverBg: 'linear-gradient(135deg, #556B2F, #8B7355)',
  },
  {
    id: 6,
    title: 'روح الليل',
    genre: 'fantasy',
    cover: '✨',
    excerpt: 'لم تكن تعرف أنها الوحيدة القادرة على إنقاذ العالمين، لم تكن تعرف حتى أن هناك عالمين...',
    author: 'ليلى م.',
    rating: 4.9,
    coverBg: 'linear-gradient(135deg, #2d1b33, #5b2d8e)',
  },
];

function renderNovels(filter = 'all') {
  const grid = document.getElementById('novelsGrid');
  const filtered = filter === 'all' ? sampleNovels : sampleNovels.filter(n => n.genre === filter);

  grid.innerHTML = filtered.map(novel => `
    <div class="novel-card" onclick="openNovelReader(${novel.id})" data-genre="${novel.genre}">
      <div class="novel-cover" style="background: ${novel.coverBg}">
        <span style="position:relative;z-index:2;font-size:3.5rem">${novel.cover}</span>
      </div>
      <div class="novel-card-body">
        <div class="novel-card-genre">${genreMap[novel.genre] || novel.genre}</div>
        <div class="novel-card-title">${novel.title}</div>
        <div class="novel-card-excerpt">${novel.excerpt}</div>
        <div class="novel-card-footer">
          <div class="novel-author">
            <div class="author-avatar">${novel.author[0]}</div>
            ${novel.author}
          </div>
          <div class="novel-rating">★ ${novel.rating}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterNovels(el, genre) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderNovels(genre);
}

function openNovelReader(id) {
  const novel = sampleNovels.find(n => n.id === id);
  if (!novel) return;
  const modal = document.getElementById('readerModal');
  document.getElementById('modalBody').innerHTML = `
    <div style="text-align:center;margin-bottom:30px;">
      <div style="font-size:0.75rem;color:var(--teal);font-weight:700;letter-spacing:0.1em;margin-bottom:12px;">${genreMap[novel.genre]}</div>
      <h2 style="font-family:var(--font-display);font-size:2rem;margin-bottom:8px;">${novel.title}</h2>
      <div style="font-size:0.82rem;color:var(--text-3);">بقلم ${novel.author} ★ ${novel.rating}</div>
    </div>
    <div style="font-family:var(--font-body);font-size:1.05rem;line-height:2;color:var(--text-2);">
      <p>${novel.excerpt}</p>
      <p style="text-indent:2em">هذا مقتطف من الرواية. لقراءة الرواية كاملة، أنشئ روايتك الخاصة أو تواصل مع الكاتب.</p>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('readerModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== AUTH MODAL =====
function openAuthModal(tab) {
  const modal = document.getElementById('authModal');
  modal.classList.add('open');
  switchAuth(tab);
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchAuth(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`${tab}Tab`).classList.add('active');
}

function loginWithGoogle() {
  showToast('جاري تسجيل الدخول عبر Google... (قريباً)', 'warning');
  closeAuthModal();
}

// ===== LOAD SAVED API KEY =====
window.addEventListener('load', () => {
  const saved = localStorage.getItem('hikaya_api_key');
  if (saved) {
    try {
      document.getElementById('apiKey').value = atob(saved);
    } catch(e) {}
  }
  renderNovels();

  // Animate on scroll
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.novel-card, .genre-card').forEach(el => {
    el.style.animationPlayState = 'paused';
    animateObserver.observe(el);
  });
});

// ===== KEYBOARD ====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeAuthModal();
  }
});
