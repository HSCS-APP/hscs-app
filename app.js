(function () {
  const $ = (id) => document.getElementById(id);
  const scenario = document.body.dataset.scenario || 'core';

  const SCENARIO_INTELLIGENCE = window.SCENARIO_INTELLIGENCE;

  function n(v){ return parseFloat(v || 0); }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function computeScore(inputs){
    let base = inputs.esc + inputs.cap + inputs.dep + inputs.prd + inputs.dec;
    let penalty = 0;

    if(inputs.latency > 4) penalty += 2;
    if(inputs.visibility < 50) penalty += 2;
    if(inputs.dependencyPct > 60) penalty += 2;

    return clamp(Math.round(base - penalty), 5, 25);
  }

  function computeGRR(score){
    if(score >= 21) return "A";
    if(score >= 16) return "B";
    if(score >= 11) return "C";
    return "D";
  }

  function computeTRM(inputs){
    if(inputs.dependencyPct > 60) return {txt:"High", cls:"orange"};
    if(inputs.dependencyPct > 40) return {txt:"Moderate", cls:"amber"};
    return {txt:"Low", cls:"green"};
  }

  function update(){
    const inputs = {
      esc: n($('esc')?.value),
      cap: n($('cap')?.value),
      dep: n($('dep')?.value),
      prd: n($('prd')?.value),
      dec: n($('dec')?.value),
      visibility: n($('visibility')?.value),
      latency: n($('latency')?.value),
      dependencyPct: n($('dependencyPct')?.value)
    };

    const score = computeScore(inputs);
    const grr = computeGRR(score);
    const trm = computeTRM(inputs);

    if($('scoreOut')) $('scoreOut').textContent = score;
    if($('grrPill')) $('grrPill').textContent = "GRR-" + grr;
    if($('trmOut')) $('trmOut').textContent = trm.txt;

    const context = SCENARIO_INTELLIGENCE[scenario];

    if($('interpretation')){
      $('interpretation').innerHTML = `
        <strong>Executive Determination</strong><br>
        Governance performance assessed as GRR-${grr} with ${trm.txt} transmission risk.<br><br>
        <strong>Scenario Lens</strong><br>
        ${context.focus} with key risk: ${context.keyRisk}.
      `;
    }
  }

  ['esc','cap','dep','prd','dec','visibility','latency','dependencyPct'].forEach(id => {
    const el = $(id);
    if(el){
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    }
  });

  update();
})();
