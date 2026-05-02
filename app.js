const API_URL = 'http://16.176.194.60:5000/analyze';

/* ===== PARTICLES ===== */
(function initParticles() {
  const container = document.getElementById('particles');
  const colors = ['#00d4ff', '#a855f7', '#ec4899'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 15 + 10}s;
      animation-delay:${Math.random() * 10}s;
      box-shadow: 0 0 ${size * 3}px currentColor;
    `;
    container.appendChild(p);
  }
})();

/* ===== FILE INPUT ===== */
const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const previewBox = document.getElementById('previewBox');
const uploadBox = document.getElementById('uploadBox');

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  loadPreview(file);
});

function loadPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewBox.style.display = 'block';
    uploadBox.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

/* ===== DRAG & DROP ===== */
const dropZone = document.querySelector('.drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    fileInput.files = e.dataTransfer.files;
    loadPreview(file);
  }
});

/* ===== RESET ===== */
function resetUpload() {
  fileInput.value = '';
  previewImg.src = '';
  previewBox.style.display = 'none';
  uploadBox.style.display = 'block';
}

/* ===== PAGE NAVIGATION ===== */
function showResultsPage() {
  document.getElementById('uploadPage').style.display = 'none';
  const resultsPage = document.getElementById('resultsPage');
  resultsPage.style.display = 'block';
  resultsPage.style.animation = 'fadeInUp 0.5s ease';
  // scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  document.getElementById('resultsPage').style.display = 'none';
  document.getElementById('uploadPage').style.display = 'block';
  resetUpload();
}

/* ===== LOADING STEPS ANIMATION ===== */
function animateLoadingSteps() {
  const steps = ['step1', 'step2', 'step3'];
  let idx = 0;

  function advance() {
    if (idx > 0) {
      const prev = document.getElementById(steps[idx - 1]);
      if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
    }
    if (idx < steps.length) {
      const curr = document.getElementById(steps[idx]);
      if (curr) curr.classList.add('active');
      idx++;
      return setTimeout(advance, 1200);
    }
  }
  advance();
}

/* ===== ANALYZE ===== */
async function analyzeImage() {
  const file = fileInput.files[0];
  if (!file) return;

  // Reset steps
  ['step1','step2','step3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active','done'); }
  });

  const loading = document.getElementById('loading');
  loading.style.display = 'flex';
  animateLoadingSteps();

  try {
    const base64 = await toBase64(file);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64.split(',')[1] })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    // Simulate minimum loading time for UX
    await new Promise(res => setTimeout(res, 800));

    loading.style.display = 'none';
    showResults(data);

  } catch (err) {
    loading.style.display = 'none';
    showError(err.message);
  }
}

/* ===== TO BASE64 ===== */
function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

/* ===== SHOW RESULTS ===== */
function showResults(data) {
  const resultImg = document.getElementById('resultImg');
  resultImg.src = previewImg.src;

  // Set timestamp
  const now = new Date();
  document.getElementById('reportTime').textContent =
    `Generated ${now.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })} · ${now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}`;

  // Sort & take top 5
  const all = data.all_results || [];
  const top5 = all
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  let html = '';
  top5.forEach((d, i) => {
    const pct = parseFloat(d.probability).toFixed(1);
    const riskClass = pct >= 60 ? 'risk-high' : pct >= 30 ? 'risk-medium' : 'risk-low';
    const delay = i * 80;
    html += `
      <div class="disease-item ${riskClass}" style="animation-delay:${delay}ms">
        <div class="disease-header">
          <div>
            <div class="disease-rank">#${i + 1} FINDING</div>
            <div class="disease-name">${escapeHtml(d.disease)}</div>
          </div>
          <span class="disease-pct">${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  });

  document.getElementById('resultsContent').innerHTML = html;
  showResultsPage();
}

/* ===== SHOW ERROR ===== */
function showError(msg) {
  // Show a non-blocking error on upload page
  const existing = document.getElementById('errorMsg');
  if (existing) existing.remove();

  const err = document.createElement('div');
  err.id = 'errorMsg';
  err.style.cssText = `
    margin: 16px 0; padding: 14px 18px; border-radius: 12px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3);
    color: #f87171; font-family: var(--font-ui); font-size: 13px;
    display: flex; align-items: center; gap: 10px;
  `;
  err.innerHTML = `<span>⚠️</span><span>Analysis failed: ${escapeHtml(msg)}</span>`;

  const uploadCard = document.querySelector('.upload-card');
  if (uploadCard) uploadCard.after(err);
}

/* ===== HELPER ===== */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ===== UI INTERACTIONS ===== */

/* GLASS HOVER LIGHT FOLLOW */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

/* BACKGROUND PARALLAX */
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;

  document.querySelectorAll('.orb').forEach((orb, i) => {
    orb.style.transform = `translate(${x * (i+1)}px, ${y * (i+1)}px)`;
  });
});