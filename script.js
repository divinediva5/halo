(function(){
  const root = document.getElementById('divine-halo');
  const $ = (sel, r=root) => r.querySelector(sel);

  // Stages and defaults (6 functions with helpful placeholders)
  const STAGES = [
    {label:'Early', value:1},
    {label:'Advancing', value:2},
    {label:'Established', value:3}
  ];
  const DEFAULTS = [
    { name:'Customers & Community', placeholder:'i.e., clarity on ideal customer profiles and verticals' },
    { name:'Products & Services',   placeholder:'i.e., breadth/depth of product, how well it meets customer needs' },
    { name:'Sales & Growth',        placeholder:'i.e., channels, partner ecosystem, marketing, pricing, consistency' },
    { name:'People & Culture',      placeholder:'i.e., org structure, hiring pipeline, culture for scale' },
    { name:'Money & Resources',     placeholder:'i.e., financial stability, access to capital, reinvestment for growth' },
    { name:'Systems & Compliance',  placeholder:'i.e., processes, technology, and legal/industry standards' }
  ];

  // All stages default to Early (1)
  let functions = DEFAULTS.map(d => ({ name:d.name, stage:1, notes:'' , placeholder:d.placeholder }));

  const facetList = $('#facetList');
  const notesOut  = $('#notesOut');
  const countsBadge = $('#countsBadge');
  const chartEl   = $('#haloChart');

  /* ---------- UI ---------- */

  function makeFunctionRow(fn, idx){
    const row = document.createElement('div');
    row.className = 'halo-facet';
    row.innerHTML = `
      <div class="halo-row">
        <div>
          <label>Function</label>
          <input type="text" value="${fn.name}" data-name="${idx}" placeholder="e.g., Customers & Community" />
        </div>
        <div>
          <label>Stage</label>
          <select data-stage="${idx}">
            ${STAGES.map(s => `<option value="${s.value}" ${s.value===fn.stage?'selected':''}>${s.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="halo-row halo-row--note">
        <div>
          <label>Quick note (what you’re measuring)</label>
          <input type="text" value="${fn.notes.replace(/"/g,'&quot;')}" data-notes="${idx}" placeholder="${(fn.placeholder||'KPIs, milestones, blockers').replace(/"/g,'&quot;')}" />
        </div>
      </div>

      <div class="halo-stack" style="margin-top:8px">
        <button class="halo-btn halo-btn-ghost" data-remove="${idx}">Remove</button>
      </div>
    `;
    return row;
  }

  function renderAll(){
    facetList.innerHTML = '';
    functions.forEach((fn, i) => facetList.appendChild(makeFunctionRow(fn,i)));
    updateNotes(); updateCounts(); paintChart();
  }

  function updateNotes(){
    const stageLabel = v => ({1:'Early',2:'Advancing',3:'Established'})[v] || '';
    const out = functions
      .map(f => `<div><strong>${escapeHtml(f.name)}</strong>: ${stageLabel(f.stage)}${f.notes?` — ${escapeHtml(f.notes)}`:''}</div>`)
      .join('');
    notesOut.innerHTML = out || '<span class="halo-small halo-muted">Start typing notes for each function above — they’ll compile here.</span>';
  }

  function updateCounts(){
    const c = {1:0,2:0,3:0};
    functions.forEach(f => c[f.stage]++);
    countsBadge.textContent = `Early: ${c[1]} · Advancing: ${c[2]} · Established: ${c[3]}`;
  }

  /* ---------- Chart ---------- */

  // Return an ARRAY of lines (Chart.js multiline labels)
  function stackedLines(label){
    if (!label) return [""];
    let s = label;
    if (s.includes(' & ')) s = s.replace(' & ', ' &\n');
    if (s.length > 18){
      const mid = Math.floor(s.length/2);
      const cut = s.lastIndexOf(' ', mid);
      if (cut > 0) s = s.slice(0,cut) + '\n' + s.slice(cut+1);
    }
    return s.split('\n'); // <- array of lines
  }

  let haloChart = null;
  function paintChart(){
    if (haloChart) haloChart.destroy();

    const labels = functions.map(f => stackedLines(f.name));
    const data = functions.map(f => f.stage);

    haloChart = new Chart(chartEl, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Divine H.A.L.O.',
          data,
          fill: true,
          backgroundColor: 'rgba(255,191,0,0.25)',  // halo fill
          borderColor: '#ffbf00',                    // halo edge
          pointBackgroundColor: '#ffbf00',
          pointBorderColor: '#ffbf00',
          pointRadius: 0,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 18, right: 18 } }, // keep labels on-canvas
        plugins: { legend: { display:false } },
        scales: {
          r: {
            min: 0,
            max: 3,
            beginAtZero: true,
            ticks: { stepSize: 1, display: false },
            angleLines: { display: false },
            grid: {
              circular: true,
              color: (ctx) => ctx.index === 0 ? 'rgba(0,0,0,0)' : '#ffbf00',
              lineWidth: (ctx) => {
                const last = ctx.chart.scales.r.ticks.length - 1; // 0..3
                if (ctx.index === 0) return 0;               // hide 0
                return ctx.index === last ? 4 : 2;           // thicker outer ring
              }
            },
            pointLabels:{
              color:'#1a1e36',
              font: (ctx) => {
                const w = ctx.chart.width;
                return { size: w < 420 ? 11 : 13, weight:'600' };
              }
            }
          }
        }
      }
    });
  }

  /* ---------- Events ---------- */

  facetList.addEventListener('input', (e)=>{
    const t = e.target;
    if (t.hasAttribute('data-name')){
      const idx = +t.getAttribute('data-name');
      functions[idx].name = t.value || `Function ${idx+1}`;
      paintChart(); updateNotes();
    }
    if (t.hasAttribute('data-notes')){
      const idx = +t.getAttribute('data-notes');
      functions[idx].notes = t.value;
      updateNotes();
    }
    if (t.hasAttribute('data-stage')){
      const idx = +t.getAttribute('data-stage');
      functions[idx].stage = +t.value;
      updateCounts(); paintChart(); updateNotes();
    }
  });

  facetList.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-remove]');
    if (!btn) return;
    const idx = +btn.getAttribute('data-remove');
    functions.splice(idx,1);
    renderAll();
  });

  $('#addFacetBtn').addEventListener('click', ()=>{
    if (functions.length >= 10){ alert('You can track up to 10 functions.'); return; }
    functions.push({ name:`Function ${functions.length+1}`, stage:1, notes:'', placeholder:'KPIs, milestones, blockers' });
    renderAll();
  });

  $('#resetBtn').addEventListener('click', ()=>{
    if (!confirm('Reset to default functions?')) return;
    functions = DEFAULTS.map(d => ({ name:d.name, stage:1, notes:'', placeholder:d.placeholder }));
    renderAll();
  });

  $('#printBtn').addEventListener('click', ()=> window.print());

  function escapeHtml(s){ return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  // Initial paint
  renderAll();
})();
