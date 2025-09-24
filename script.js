(function(){
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  const STAGES = [
    {label:'Early', value:1},
    {label:'Advancing', value:2},
    {label:'Established', value:3}
  ];
  const DEFAULTS = ['Market','Product','Sales','Marketing','Talent','Finance','Operations','Data & Systems','Partnerships','Customer Success'];

  let functions = DEFAULTS.map(name => ({ name, stage: 1, notes: '' }));

  const root = document.getElementById('divine-halo');
  const facetList = $('#facetList', root);
  const notesOut  = $('#notesOut', root);
  const countsBadge = $('#countsBadge', root);
  const chartEl   = $('#haloChart', root);

  // Build a function block
  function makeFunctionRow(fn, idx){
    const row = document.createElement('div');
    row.className = 'halo-facet';
    row.innerHTML = `
      <header>
        <div class="halo-facet-title">Function ${idx+1}</div>
        <button class="halo-btn halo-btn-ghost" data-remove="${idx}">Remove</button>
      </header>

      <div class="halo-row">
        <div>
          <label>Function</label>
          <input type="text" value="${fn.name}" data-name="${idx}" placeholder="e.g., Market" />
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
          <input type="text" value="${fn.notes.replace(/"/g,'&quot;')}" data-notes="${idx}" placeholder="KPIs, milestones, blockers" />
        </div>
      </div>
    `;
    return row;
  }

  function renderAll(){
    facetList.innerHTML = '';
    functions.forEach((fn, i) => facetList.appendChild(makeFunctionRow(fn,i)));
    updateNotes(); updateCounts(); paintChart();
  }

  // Update only summary text (no rebuild)
  function updateNotes(){
    const out = functions
      .map(f => `<div><strong>${escapeHtml(f.name)}</strong>: ${escapeHtml(f.notes||'')}</div>`)
      .join('');
    notesOut.innerHTML = out || '<span class="halo-small halo-muted">Start typing notes for each function above — they’ll compile here.</span>';
  }

  // Counts badge
  function updateCounts(){
    const c = { 1:0, 2:0, 3:0 };
    functions.forEach(f => c[f.stage]++);
    countsBadge.textContent = `Counts — Early: ${c[1]} · Advancing: ${c[2]} · Established: ${c[3]}`;
  }

  // HALO chart
  let haloChart = null;
  function paintChart(){
    if (haloChart) haloChart.destroy();
    haloChart = new Chart(chartEl, {
      type: 'radar',
      data: {
        labels: functions.map(f => f.name),
        datasets: [{
          label: 'Divine H.A.L.O.',
          data: functions.map(f => f.stage),
          fill: true,
          backgroundColor: 'rgba(255, 191, 0, 0.25)',  // halo fill
          borderColor: '#ffbf00',                      // halo edge
          pointBackgroundColor: '#ffbf00',
          pointBorderColor: '#ffbf00',
          pointRadius: 3,
          tension: 0.3
        }]
      },
      options: {
        plugins: { legend: { display:false } },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 3,
            ticks: { display:false },          // hide 1–3 numbers
            grid:  { color: 'rgba(255, 191, 0, 0.35)', lineWidth: 2 },
            angleLines: { color: 'rgba(255, 191, 0, 0.20)' },
            pointLabels: { color:'#1a1e36', font:{ size:13, weight:'600' } }
          }
        },
        elements: {
          line: { borderJoinStyle:'round' }
        }
      }
    });
  }

  // Event wiring — update fields in place (no full re-render on every keypress)
  facetList.addEventListener('input', (e)=>{
    const t = e.target;
    if (t.hasAttribute('data-name')){
      const idx = +t.getAttribute('data-name');
      functions[idx].name = t.value || `Function ${idx+1}`;
      paintChart();  // update labels
      updateNotes();
    }
    if (t.hasAttribute('data-notes')){
      const idx = +t.getAttribute('data-notes');
      functions[idx].notes = t.value;
      updateNotes(); // just summary
    }
    if (t.hasAttribute('data-stage')){
      const idx = +t.getAttribute('data-stage');
      functions[idx].stage = +t.value;
      updateCounts(); paintChart();
    }
  });

  facetList.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-remove]');
    if (!btn) return;
    const idx = +btn.getAttribute('data-remove');
    functions.splice(idx,1);
    renderAll();
  });

  $('#addFacetBtn', root).addEventListener('click', ()=>{
    if (functions.length >= 10){ alert('You can track up to 10 functions.'); return; }
    functions.push({ name:`Function ${functions.length+1}`, stage:1, notes:'' });
    renderAll();
  });

  $('#resetBtn', root).addEventListener('click', ()=>{
    if (!confirm('Reset to default functions?')) return;
    functions = DEFAULTS.map(name => ({ name, stage:1, notes:'' }));
    renderAll();
  });

  $('#printBtn', root).addEventListener('click', ()=> window.print());

  $('#copySummaryBtn', root).addEventListener('click', ()=>{
    const stageLabel = v => ({1:'Early',2:'Advancing',3:'Established'})[v] || '';
    const lines = functions.map(f => `${f.name}: ${stageLabel(f.stage)}${f.notes?` — ${f.notes}`:''}`);
    const text = `Divine H.A.L.O. Snapshot\n` + lines.join('\n');
    navigator.clipboard.writeText(text).then(()=>{
      const btn = $('#copySummaryBtn', root);
      const prev = btn.textContent; btn.textContent = 'Copied!'; setTimeout(()=> btn.textContent = prev, 1200);
    });
  });

  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // initial paint
  renderAll();
})();
