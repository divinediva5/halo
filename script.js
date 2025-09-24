(function(){
  function waitFor(sel, cb){
    const t0 = Date.now();
    const timer = setInterval(()=>{
      const el = document.querySelector(sel);
      if (el) { clearInterval(timer); cb(el); }
      if (Date.now() - t0 > 10000) clearInterval(timer);
    }, 120);
  }

  waitFor('#divine-halo #facetList', function(){
    const PRESET = ['Market','Product','Sales','Marketing','Talent','Finance','Operations','Data & Systems','Partnerships','Customer Success'];
    const STAGES = [{label:'Emerging',value:1},{label:'Expanding',value:2},{label:'Established',value:3}];
    let pillars = PRESET.map(name => ({ name, stage: 1, notes: '' }));

    const facetList = document.querySelector('#divine-halo #facetList');
    const notesOut  = document.querySelector('#divine-halo #notesOut');
    const chartEl   = document.querySelector('#divine-halo #haloChart');
    let haloChart   = null;

    function render(){
      facetList.innerHTML = '';
      pillars.forEach((p,i)=>{
        const row = document.createElement('div');
        row.className = 'halo-facet';
        row.innerHTML = `
          <header><div class="halo-facet-title">Pillar ${i+1}</div>
          <button class="halo-btn halo-btn-ghost" data-remove="${i}">Remove</button></header>
          <label>Pillar Name</label>
          <input type="text" data-name="${i}" value="${p.name}" placeholder="e.g., Market" />
          <div class="halo-row">
            <div>
              <label>Stage</label>
              <select data-stage="${i}">
                ${STAGES.map(s=>`<option value="${s.value}" ${s.value===p.stage?'selected':''}>${s.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label>Quick Note (what you’re measuring)</label>
              <input type="text" data-notes="${i}" value="${p.notes.replace(/"/g,'&quot;')}" placeholder="KPIs, milestones, blockers" />
            </div>
          </div>`;
        facetList.appendChild(row);
      });
      notesOut.innerHTML = pillars.map(p=>`<div><strong>${p.name}</strong>: ${p.notes||''}</div>`).join('') ||
        '<span class="halo-small halo-muted">Start typing notes for each pillar above — they’ll compile here.</span>';
    }

    function paintChart(){
      if (!chartEl) return;
      if (haloChart) { haloChart.destroy(); }
      haloChart = new Chart(chartEl, {
        type: 'radar',
        data: {
          labels: pillars.map(p=>p.name),
          datasets: [{
            label: 'Divine H.A.L.O.',
            data: pillars.map(p=>p.stage),
            fill: true, tension: 0.3,
            backgroundColor: 'rgba(122,167,255,0.25)',
            borderColor: 'rgba(122,167,255,0.9)',
            pointBackgroundColor: 'rgba(232,237,255,1)'
          }]
        },
        options: {
          plugins: { legend: { display:false } },
          scales: { r: { beginAtZero:true, min:0, max:3, ticks:{ stepSize:1 }, grid:{ color:'rgba(255,255,255,.12)' } } }
        }
      });
    }

    facetList.addEventListener('input', e=>{
      const t = e.target;
      if (t.dataset.name!==undefined)  pillars[+t.dataset.name].name = t.value || `Pillar ${+t.dataset.name+1}`;
      if (t.dataset.notes!==undefined) pillars[+t.dataset.notes].notes = t.value;
      if (t.dataset.stage!==undefined) pillars[+t.dataset.stage].stage = +t.value;
      render(); paintChart();
    });

    facetList.addEventListener('click', e=>{
      const btn = e.target.closest('button[data-remove]');
      if (!btn) return;
      pillars.splice(+btn.dataset.remove,1);
      render(); paintChart();
    });

    document.querySelector('#divine-halo #addFacetBtn').addEventListener('click', ()=>{
      if (pillars.length >= 10){ alert('You can track up to 10 pillars.'); return; }
      pillars.push({ name:`Pillar ${pillars.length+1}`, stage:1, notes:'' });
      render(); paintChart();
    });

    document.querySelector('#divine-halo #resetBtn').addEventListener('click', ()=>{
      if (!confirm('Reset to default pillars?')) return;
      pillars = PRESET.map(name=>({ name, stage:1, notes:'' }));
      render(); paintChart();
    });

    document.querySelector('#divine-halo #printBtn').addEventListener('click', ()=> window.print());
    document.querySelector('#divine-halo #copySummaryBtn').addEventListener('click', ()=>{
      const lines = pillars.map(p=>`${p.name}: ${['—','Emerging','Expanding','Established'][p.stage]}${p.notes?` — ${p.notes}`:''}`);
      navigator.clipboard.writeText(`Divine H.A.L.O. Snapshot\n`+lines.join('\n'));
    });

    render(); paintChart();
  });
})();
