window.addEventListener('load',()=>document.body.classList.add('loaded'));

(function(){
const $ = (id) => document.getElementById(id);
const scenario = document.body.dataset.scenario || 'core';

const DOMAIN_WEIGHTS = { SA: 0.20, CCI: 0.25, CDR: 0.20, PGA: 0.15, ADR: 0.20 };

const scenarioConfig = {
  core: {
    reportTitle: 'Governance Stress Test Report',
    heroFinding: 'Ongoing monitoring lens',
    pageType: 'core'
  },
  investors: {
    reportTitle: 'Institutional Governance Stress Report',
    heroFinding: 'Delegated oversight lens',
    pageType: 'scenario'
  },
  assetmanagers: {
    reportTitle: 'Asset & Wealth Governance Report',
    heroFinding: 'Multi-product governance lens',
    pageType: 'scenario'
  },
  intermediaries: {
    reportTitle: 'Intermediary Governance Stress Report',
    heroFinding: 'Transition and execution lens',
    pageType: 'scenario'
  },
  infrastructure: {
    reportTitle: 'Infrastructure Governance Stress Report',
    heroFinding: 'System dependency lens',
    pageType: 'scenario'
  }
};

const cfg = scenarioConfig[scenario] || scenarioConfig.core;

const els = {
  esc:$('esc'), cap:$('cap'), dep:$('dep'), prd:$('prd'), dec:$('dec'),
  escVal:$('escVal'), capVal:$('capVal'), depVal:$('depVal'), prdVal:$('prdVal'), decVal:$('decVal'),
  assetComplexity:$('assetComplexity'), fragmentation:$('fragmentation'), transitionType:$('transitionType'),
  visibility:$('visibility'), latency:$('latency'), dependencyPct:$('dependencyPct'),
  scoreOut:$('scoreOut'), grrPill:$('grrPill'), trmOut:$('trmOut'), trmPill:$('trmPill'),
  interpretation:$('interpretation'),
  barEsc:$('barEsc'), barCap:$('barCap'), barDep:$('barDep'), barPrd:$('barPrd'), barDec:$('barDec'),
  barEscT:$('barEscT'), barCapT:$('barCapT'), barDepT:$('barDepT'), barPrdT:$('barPrdT'), barDecT:$('barDecT'),
  bandA:$('bandA'), bandB:$('bandB'), bandC:$('bandC'), bandD:$('bandD'),
  heroScore:$('heroScore'), heroGRR:$('heroGRR'), heroTRM:$('heroTRM'),
  heroLatency:$('heroLatency'), heroVisibility:$('heroVisibility'), heroDependency:$('heroDependency'), heroBreakpoint:$('heroBreakpoint'),
  baselineScore:$('baselineScore'), baselineGRR:$('baselineGRR'), baselineText:$('baselineText'),
  stressScore:$('stressScore'), stressGRR:$('stressGRR'), stressText:$('stressText'), deltaCallout:$('deltaCallout'),
  breakpointBox:$('breakpointBox'),
  reportTitle:$('reportTitle'), reportCurrentScore:$('reportCurrentScore'),
  reportCurrentGRR:$('reportCurrentGRR'), reportCurrentTRM:$('reportCurrentTRM'), reportCurrentText:$('reportCurrentText'),
  reportTargetScore:$('reportTargetScore'), reportTargetGRR:$('reportTargetGRR'), reportTargetTRM:$('reportTargetTRM'),
  reportTargetText:$('reportTargetText'), sheetGSAT:$('sheetGSAT'), sheetGRR:$('sheetGRR'), sheetTRM:$('sheetTRM'),
  reportBreakpoint:$('reportBreakpoint'), reportDeltaCallout:$('reportDeltaCallout'),
  monitorBreakpoint:$('monitorBreakpoint'), monitorDelta:$('monitorDelta')
};

function n(v){ return parseFloat(v || 0); }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function animateValue(el,start,end,duration=260){
  if(!el){ return; }
  if(start === end){ el.textContent = end; return; }
  let startTime = null;
  function step(ts){
    if(!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    el.textContent = Math.round(start + (end - start) * progress);
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function setBand(a){ ['A','B','C','D'].forEach(k => els['band'+k] && els['band'+k].classList.remove('active')); els['band'+a] && els['band'+a].classList.add('active'); }
function setBar(el,txt,val,delay=0){
  if(!el || !txt) return;
  setTimeout(()=>{
    el.style.width = (val * 20) + '%';
    txt.textContent = String(val);
  }, delay);
}
function pillClass(scoreLabel){
  if(scoreLabel === 'A' || scoreLabel === 'Strong') return 'green';
  if(scoreLabel === 'B' || scoreLabel === 'Adequate') return 'amber';
  if(scoreLabel === 'C' || scoreLabel === 'Vulnerable') return 'orange';
  return 'red';
}
function grrText(grr){
  return grr === 'A' ? 'GRR-A · Strong' : grr === 'B' ? 'GRR-B · Adequate' : grr === 'C' ? 'GRR-C · Vulnerable' : 'GRR-D · Deficient';
}

/* Appendix-aligned normalization helpers */
function scoreToNorm(score){ return clamp((score - 1) / 4 * 100, 0, 100); }
function latencyNorm(hours){
  if(hours < 0.5) return 100;
  if(hours <= 1) return 85;
  if(hours <= 2) return 65;
  if(hours <= 4) return 45;
  return 20;
}
function visibilityNorm(pct){
  if(pct >= 95) return 100;
  if(pct >= 85) return 90;
  if(pct >= 70) return 75;
  if(pct >= 55) return 60;
  if(pct >= 40) return 45;
  return 20;
}
function concentrationNorm(pct){
  if(pct < 30) return 100;
  if(pct < 40) return 85;
  if(pct < 50) return 70;
  if(pct < 60) return 45;
  return 20;
}
function stressModToNorm(modValue){
  // select values are 0 to -3; less severe should be higher score
  const v = Math.abs(n(modValue));
  return clamp(100 - v * 25, 20, 100);
}
function domainToScore(D){
  if(D >= 85) return 5;
  if(D >= 70) return 4;
  if(D >= 55) return 3;
  if(D >= 40) return 2;
  return 1;
}
function weightedScore(indicators){
  let score = 0;
  for (const item of indicators) score += item.value * item.weight;
  return score;
}

function buildInputs(){
  const visibilityPct = n(els.visibility.value);
  const latencyHours = n(els.latency.value);
  const dependencyPct = n(els.dependencyPct.value);

  const exposureOwner = visibilityPct >= 50 && n(els.dec.value) >= 3;
  const decisionAligned = n(els.dec.value) >= 3;
  const productClearingAligned = n(els.prd.value) >= 3 && n(els.cap.value) >= 3;

  // For appendix-style metrics
  let visibilityState = 'Intraday';
  if(visibilityPct < 40) visibilityState = 'T+2';
  else if(visibilityPct < 70) visibilityState = 'T+1';

  return {
    escalation: n(els.esc.value),
    capital: n(els.cap.value),
    dependency: n(els.dep.value),
    product: n(els.prd.value),
    decision: n(els.dec.value),
    visibilityPct,
    visibilityState,
    latencyHours,
    dependencyPct,
    assetComplexity: n(els.assetComplexity.value),
    fragmentation: n(els.fragmentation.value),
    transitionType: n(els.transitionType.value),
    exposureOwner,
    decisionAligned,
    productClearingAligned
  };
}

function computeDomains(inputs){
  const SA_norm = weightedScore([
    { value: scoreToNorm(inputs.escalation), weight: 0.30 },
    { value: scoreToNorm(inputs.decision), weight: 0.30 },
    { value: latencyNorm(inputs.latencyHours), weight: 0.25 },
    { value: scoreToNorm(6 - inputs.dependency), weight: 0.15 }
  ]);
  const CCI_norm = weightedScore([
    { value: visibilityNorm(inputs.visibilityPct), weight: 0.35 },
    { value: scoreToNorm(inputs.capital), weight: 0.25 },
    { value: scoreToNorm(inputs.capital), weight: 0.25 },
    { value: stressModToNorm(inputs.transitionType), weight: 0.15 }
  ]);
  const CDR_norm = weightedScore([
    { value: concentrationNorm(inputs.dependencyPct), weight: 0.35 },
    { value: visibilityNorm(inputs.visibilityPct), weight: 0.25 },
    { value: stressModToNorm(inputs.fragmentation), weight: 0.20 },
    { value: scoreToNorm(inputs.dependency), weight: 0.20 }
  ]);
  const PGA_norm = weightedScore([
    { value: scoreToNorm(inputs.product), weight: 0.30 },
    { value: stressModToNorm(inputs.assetComplexity), weight: 0.30 },
    { value: stressModToNorm(inputs.transitionType), weight: 0.20 },
    { value: scoreToNorm(inputs.product), weight: 0.20 }
  ]);
  const ADR_norm = weightedScore([
    { value: scoreToNorm(inputs.decision), weight: 0.30 },
    { value: scoreToNorm(inputs.decision), weight: 0.30 },
    { value: scoreToNorm(inputs.escalation), weight: 0.20 },
    { value: scoreToNorm(inputs.decision), weight: 0.20 }
  ]);

  return {
    SA_norm, CCI_norm, CDR_norm, PGA_norm, ADR_norm,
    SA: domainToScore(SA_norm),
    CCI: domainToScore(CCI_norm),
    CDR: domainToScore(CDR_norm),
    PGA: domainToScore(PGA_norm),
    ADR: domainToScore(ADR_norm)
  };
}

function computeGSATRaw(domainScores){
  const raw = DOMAIN_WEIGHTS.SA * domainScores.SA
            + DOMAIN_WEIGHTS.CCI * domainScores.CCI
            + DOMAIN_WEIGHTS.CDR * domainScores.CDR
            + DOMAIN_WEIGHTS.PGA * domainScores.PGA
            + DOMAIN_WEIGHTS.ADR * domainScores.ADR;
  return raw * 5;
}

function computePenalty(inputs){
  let penalty = 0;
  const hits = [];
  if (!inputs.exposureOwner) { penalty += 0.30; hits.push('No integrated exposure owner'); }
  if (inputs.latencyHours > 4) { penalty += 0.25; hits.push('Escalation latency above 4 hours'); }
  if (inputs.visibilityState === 'T+2') { penalty += 0.25; hits.push('Exposure visibility worse than T+1'); }
  if (inputs.dependencyPct > 60) { penalty += 0.30; hits.push('Dependency concentration above 60%'); }
  if (!inputs.decisionAligned) { penalty += 0.20; hits.push('Misaligned decision rights'); }
  if (!inputs.productClearingAligned) { penalty += 0.20; hits.push('Product–clearing disconnect'); }
  return { penalty: Math.min(penalty, 1.0), hits };
}

function computeTRM(inputs){
  const C = clamp(inputs.dependencyPct / 100, 0, 1);
  const E = clamp(inputs.latencyHours / 4, 0, 1.5);
  const O = inputs.visibilityState === 'T+2' ? 1 : inputs.visibilityState === 'T+1' ? 0.65 : 0.2;
  const I = clamp((Math.abs(inputs.fragmentation) + Math.abs(inputs.transitionType)) / 4, 0, 1);
  const S = 1 - concentrationNorm(inputs.dependencyPct) / 100;
  const score = 0.25*C + 0.20*E + 0.20*O + 0.20*I + 0.15*S;
  return score * 4;
}
function classifyTRM(trmScore){
  if (trmScore < 1.0) return { txt:'Low', cls:'green', pill:'Contained propagation risk' };
  if (trmScore < 2.0) return { txt:'Moderate', cls:'amber', pill:'Material transmission pressure' };
  if (trmScore < 3.0) return { txt:'High', cls:'orange', pill:'Cross-system propagation' };
  return { txt:'Severe', cls:'red', pill:'Severe propagation pressure' };
}

function computeGRR(gsAdj, inputs){
  let grr = gsAdj >= 21 ? 'A' : gsAdj >= 16 ? 'B' : gsAdj >= 11 ? 'C' : 'D';
  if ((!inputs.exposureOwner || inputs.visibilityState === 'T+2' || inputs.dependencyPct > 60) && grr === 'A') grr = 'B';
  return grr;
}

function buildBreakpoint(inputs, penalties, grr, trm){
  const primary = penalties.hits[0];
  if (primary) return primary + '.';
  if (scenario === 'investors') return grr === 'A' ? 'Oversight remains stable across delegated structures.' : 'Delegated oversight gap becomes the primary breakpoint.';
  if (scenario === 'assetmanagers') return grr === 'A' ? 'Mandate and product governance remain aligned.' : 'Multi-product fragmentation becomes the primary breakpoint.';
  if (scenario === 'intermediaries') return grr === 'A' ? 'Clearing and escalation remain aligned under stress.' : 'Clearing dependency concentration becomes the primary breakpoint.';
  if (scenario === 'infrastructure') return grr === 'A' ? 'Platform governance remains stable under load.' : 'Platform concentration becomes the primary breakpoint.';
  return trm.txt === 'Severe' ? 'Critical governance failure under stress conditions.' : grr === 'A' ? 'No material breakpoint under current conditions.' : 'Escalation discipline begins to weaken under combined pressure.';
}

function buildInterpretation(inputs, penalties, gsAdj, grr, trm){
  const intro = gsAdj >= 21
    ? 'Governance performance is assessed as resilient under the simulated conditions.'
    : gsAdj >= 16
    ? 'Governance performance remains adequate but exhibits pressure under stress.'
    : gsAdj >= 11
    ? 'Governance performance is assessed as vulnerable under the simulated stress conditions.'
    : 'Governance performance is assessed as deficient, with structural breakdown under stress.';
  const diagnostic = ` Domain stress is most visible through escalation latency (${inputs.latencyHours.toFixed(1)}h), exposure visibility (${inputs.visibilityState}), and dependency concentration (${Math.round(inputs.dependencyPct)}%).`;
  const penaltyText = penalties.hits.length ? ` Breakpoint penalties applied: ${penalties.hits.join('; ')}.` : ' No structural breakpoint penalties were triggered.';
  const overrideText = (grr === 'B' && gsAdj >= 21 && (!inputs.exposureOwner || inputs.visibilityState === 'T+2' || inputs.dependencyPct > 60))
    ? ' Supervisory override constrains the resilience rating to GRR-B under Appendix conditions.'
    : '';
  const trmText = ` Transmission risk is classified as ${trm.txt.toLowerCase()}.`;
  return intro + diagnostic + penaltyText + overrideText + trmText;
}

function deltaClass(delta){
  if (delta === 0) return ['delta-neutral', `→ Δ 0 · No material deterioration under stress`];
  if (delta > 0) return ['delta-positive', `↑ Δ +${delta} · Resilience improves under current conditions`];
  if (delta <= -5) return ['delta-severe', `↓ Δ ${delta} · Severe deterioration under stress`];
  if (delta <= -3) return ['delta-material', `↓ Δ ${delta} · Material deterioration under stress`];
  return ['delta-mild', `↓ Δ ${delta} · Moderate deterioration under stress`];
}

function update(){
  const inputs = buildInputs();

  if (els.escVal) els.escVal.value = inputs.escalation;
  if (els.capVal) els.capVal.value = inputs.capital;
  if (els.depVal) els.depVal.value = inputs.dependency;
  if (els.prdVal) els.prdVal.value = inputs.product;
  if (els.decVal) els.decVal.value = inputs.decision;

  const domains = computeDomains(inputs);
  const baseScoreRaw = computeGSATRaw(domains);
  const penalties = computePenalty(inputs);
  const stressedScore = clamp(Math.round(baseScoreRaw - penalties.penalty * 5), 5, 25);
  const baselineScore = clamp(Math.round(baseScoreRaw), 5, 25);
  const trmScore = computeTRM(inputs);
  const trm = classifyTRM(trmScore);
  const grr = computeGRR(stressedScore, inputs);
  const breakpoint = buildBreakpointScenario(inputs, penalties, grr, trm, domains);
  const narrative = buildSupervisoryNarrativeScenario(inputs, penalties, domains, stressedScore, grr, trm);
  const interpretation = `${narrative.execSummary} ${narrative.governanceNarrative} ${narrative.transmission}`;
  const evidence = buildEvidencePack(inputs, penalties, domains);
  const controls = buildControlRecommendationsScenario(inputs, penalties, domains);
  const impact = simulateControlImpactScenario(inputs, penalties, domains, scenario);
  const delta = stressedScore - baselineScore;
  const [deltaCls, deltaText] = deltaClass(delta);

  // Main score
  const prevScore = parseInt(els.scoreOut?.textContent || stressedScore, 10);
  animateValue(els.scoreOut, prevScore, stressedScore);
  if (els.grrPill){ els.grrPill.textContent = grrText(grr); els.grrPill.className = 'pill ' + pillClass(grr); }
  if (els.trmOut) els.trmOut.textContent = trm.txt;
  if (els.trmPill){ els.trmPill.textContent = trm.pill; els.trmPill.className = 'pill ' + trm.cls; }
  setBand(grr);

  // Domain bars
  setBar(els.barEsc, els.barEscT, domains.SA, 20);
  setBar(els.barCap, els.barCapT, domains.CCI, 70);
  setBar(els.barDep, els.barDepT, domains.CDR, 120);
  setBar(els.barPrd, els.barPrdT, domains.PGA, 170);
  setBar(els.barDec, els.barDecT, domains.ADR, 220);

  // Interpretation + breakpoint
  if (els.breakpointBox) els.breakpointBox.textContent = breakpoint;
  if (els.heroBreakpoint) els.heroBreakpoint.textContent = breakpoint;
  if (els.reportBreakpoint) els.reportBreakpoint.textContent = breakpoint;
  if (els.monitorBreakpoint) els.monitorBreakpoint.textContent = breakpoint;
  if (els.interpretation) els.interpretation.innerHTML = `
<strong>Executive Determination</strong><br>${narrative.execSummary}<br><br>
<strong>Governance Assessment</strong><br>${narrative.governanceNarrative}<br><br>
<strong>Transmission Analysis</strong><br>${narrative.transmission}<br><br>
<strong>Primary Structural Breakpoint</strong><br>${narrative.breakpointText}<br><br>
<strong>Domain-Level Findings</strong><br>${narrative.domainFindings}<br><br>
<strong>Supervisory Conclusion</strong><br>${narrative.conclusion}
`;

  // Hero metrics
  if (els.heroScore) els.heroScore.textContent = stressedScore;
  if (els.heroLatency) els.heroLatency.textContent = `${inputs.latencyHours.toFixed(1)}h`;
  if (els.heroVisibility) els.heroVisibility.textContent = inputs.visibilityState;
  if (els.heroDependency) els.heroDependency.textContent = `${Math.round(inputs.dependencyPct)}%`;
  if (els.heroGRR){ els.heroGRR.textContent = grrText(grr); els.heroGRR.className = 'pill ' + pillClass(grr); }
  if (els.heroTRM){ els.heroTRM.textContent = 'TRM · ' + trm.txt; els.heroTRM.className = 'pill ' + trm.cls; }

  // Delta / baseline section
  if (els.baselineScore) els.baselineScore.textContent = baselineScore;
  if (els.baselineGRR){ 
    const baseGRR = computeGRR(baselineScore, {...inputs, dependencyPct:Math.min(inputs.dependencyPct,55), visibilityState:'Intraday', exposureOwner:true});
    els.baselineGRR.textContent = 'GRR-' + baseGRR;
    els.baselineGRR.className = 'pill ' + pillClass(baseGRR);
  }
  if (els.baselineText) els.baselineText.textContent = 'Governance remains stable under baseline operating conditions without additional stress amplification.';
  if (els.stressScore) els.stressScore.textContent = stressedScore;
  if (els.stressGRR){ els.stressGRR.textContent = 'GRR-' + grr; els.stressGRR.className = 'pill ' + pillClass(grr); }
  if (els.stressText) els.stressText.textContent = interpretation;
  if (els.deltaCallout){
    els.deltaCallout.classList.remove('delta-positive','delta-mild','delta-material','delta-severe','delta-neutral');
    els.deltaCallout.classList.add(deltaCls);
    els.deltaCallout.textContent = deltaText;
  }

  // Report preview
  if (els.reportTitle) els.reportTitle.textContent = cfg.reportTitle;
  if (els.reportCurrentScore) els.reportCurrentScore.textContent = stressedScore;
  if (els.reportCurrentGRR){ els.reportCurrentGRR.textContent = 'GRR-' + grr; els.reportCurrentGRR.className = 'pill ' + pillClass(grr); }
  if (els.reportCurrentTRM){ els.reportCurrentTRM.textContent = 'TRM ' + trm.txt; els.reportCurrentTRM.className = 'pill ' + trm.cls; }
  if (els.reportCurrentText) els.reportCurrentText.textContent = interpretation;

  const strengthenedScore = impact.improvedScore;
  const strengthenedGRR = impact.improvedGRR;
  const strengthenedTRM = impact.improvedTRM;
  if (els.reportTargetScore) els.reportTargetScore.textContent = strengthenedScore;
  if (els.reportTargetGRR){ els.reportTargetGRR.textContent = 'GRR-' + strengthenedGRR; els.reportTargetGRR.className = 'pill ' + pillClass(strengthenedGRR); }
  if (els.reportTargetTRM){
    const tgtCls = strengthenedScore >= 21 ? 'green' : strengthenedScore >= 16 ? 'amber' : 'orange';
    const tgtTxt = strengthenedScore >= 21 ? 'TRM Low' : 'TRM Moderate';
    els.reportTargetTRM.textContent = tgtTxt;
    els.reportTargetTRM.className = 'pill ' + tgtCls;
  }
  if (els.reportTargetText) {
    els.reportTargetText.textContent = `Illustrative strengthened state assumes escalation latency reduced to <1h, exposure visibility improved to intraday, and dependency concentration reduced below 50%.`;
  }

  // KPI sheet = report-grade metrics
  if (els.sheetGSAT) els.sheetGSAT.textContent = `${stressedScore}/25`;
  if (els.sheetGRR) els.sheetGRR.textContent = grr === 'A' ? 'Strong' : grr === 'B' ? 'Adequate' : grr === 'C' ? 'Vulnerable' : 'Deficient';
  if (els.sheetTRM) els.sheetTRM.textContent = trm.txt;
  if (els.reportDeltaCallout){
    els.reportDeltaCallout.className = els.deltaCallout.className;
    els.reportDeltaCallout.textContent = `${deltaText} · Latency ${inputs.latencyHours.toFixed(1)}h · Visibility ${inputs.visibilityState} · Concentration ${Math.round(inputs.dependencyPct)}%`;
  }

  // Monitoring block
  if (els.monitorDelta) els.monitorDelta.textContent = deltaText.replace('↓ ','').replace('↑ ','').replace('→ ','');
  const eBox = document.getElementById('evidenceBox');
  if (eBox) eBox.innerHTML = buildEvidenceHTML(evidence);
  const cBox = document.getElementById('controlsBox');
  if (cBox) cBox.innerHTML = buildControlsHTML(controls);
  const iBox = document.getElementById('impactBox');
  if (iBox) iBox.innerHTML = buildImpactHTML(impact, inputs, stressedScore, grr, trm, SCENARIO_INTELLIGENCE[scenario]);
}

['esc','cap','dep','prd','dec','assetComplexity','fragmentation','transitionType','visibility','latency','dependencyPct'].forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  }
});

update();

/* SaaS-ready state bridge */
window.GSATAppState = {
  getState: function(){
    const q = (id) => document.getElementById(id);
    return {
      scenario: document.body.dataset.scenario || 'core',
      inputs: {
        esc: q('esc')?.value, cap: q('cap')?.value, dep: q('dep')?.value, prd: q('prd')?.value, dec: q('dec')?.value,
        assetComplexity: q('assetComplexity')?.value, fragmentation: q('fragmentation')?.value, transitionType: q('transitionType')?.value,
        visibility: q('visibility')?.value, latency: q('latency')?.value, dependencyPct: q('dependencyPct')?.value
      },
      outputs: {
        score: q('scoreOut')?.textContent,
        grr: q('grrPill')?.textContent,
        trm: q('trmOut')?.textContent,
        delta: q('deltaCallout')?.textContent,
        breakpoint: q('breakpointBox')?.textContent
      },
      capturedAt: new Date().toISOString()
    };
  }
};
})();

/* ==========================================================================
   Release v1.0 Final Layers
   ========================================================================== */
const SCENARIO_NARRATIVE = {
  core: {
    intro: "Governance is assessed under ongoing monitoring conditions.",
    lens: "focuses on stability, drift, and control consistency across governance domains."
  },
  intermediaries: {
    intro: "Governance is assessed under execution, clearing, and counterparty stress conditions.",
    lens: "focuses on coordination across execution, clearing, margin, and capital functions."
  },
  assetmanagers: {
    intro: "Governance is assessed across multi-product and mandate-driven operating conditions.",
    lens: "focuses on product governance, mandate alignment, and reporting coherence."
  },
  investors: {
    intro: "Governance is assessed across delegated investment and custody structures.",
    lens: "focuses on oversight effectiveness, transparency, and indirect control."
  },
  infrastructure: {
    intro: "Governance is assessed under platform, dependency, and systemic stress conditions.",
    lens: "focuses on service continuity, concentration risk, and system-level propagation."
  }
};

function buildBreakpointScenario(inputs, penalties, grr, trm, domains){
  const scenario = document.body.dataset.scenario || "core";
  if (!inputs.exposureOwner) {
    if (scenario === "investors") return "No integrated owner of delegated exposure across custodians and managers.";
    if (scenario === "intermediaries") return "No integrated owner of clearing and counterparty exposure under stress.";
    if (scenario === "infrastructure") return "No integrated owner of critical service dependency exposure.";
    if (scenario === "assetmanagers") return "No integrated owner of product and mandate exposure under stress.";
    return "No integrated owner of stress-relevant exposure across governance domains.";
  }
  if (inputs.latencyHours > 4) {
    if (scenario === "intermediaries") return "Escalation latency breaches execution tolerance under clearing and margin stress.";
    if (scenario === "infrastructure") return "Escalation latency breaches service continuity tolerance under systemic load.";
    if (scenario === "assetmanagers") return "Escalation latency impairs mandate and product governance under stress.";
    if (scenario === "investors") return "Escalation latency weakens delegated oversight under stress conditions.";
    return "Escalation latency exceeds supervisory tolerance threshold.";
  }
  if (inputs.dependencyPct > 60) {
    if (scenario === "intermediaries") return "Clearing and counterparty concentration becomes the primary structural breakpoint.";
    if (scenario === "infrastructure") return "Platform concentration becomes the primary systemic breakpoint.";
    if (scenario === "assetmanagers") return "Operating model dependency concentration weakens governance resilience.";
    if (scenario === "investors") return "Custody and delegated dependency concentration weakens oversight resilience.";
    return "Dependency concentration breaches structural governance tolerance.";
  }
  if (inputs.visibilityState === "T+2") {
    if (scenario === "intermediaries") return "Exposure opacity prevents timely coordination across execution and clearing functions.";
    if (scenario === "infrastructure") return "Visibility delay impairs incident governance across critical infrastructure layers.";
    if (scenario === "assetmanagers") return "Reporting opacity weakens product and mandate oversight under stress.";
    if (scenario === "investors") return "Exposure opacity across delegated structures creates material oversight blind spots.";
    return "Exposure visibility delay creates material governance opacity under stress.";
  }
  if (!inputs.productClearingAligned) {
    if (scenario === "intermediaries") return "Product-clearing disconnect creates execution-layer governance failure risk.";
    if (scenario === "assetmanagers") return "Product governance misalignment becomes the primary structural breakpoint.";
    return "Product-governance disconnect weakens control alignment under stress.";
  }
  if (!inputs.decisionAligned) {
    if (scenario === "assetmanagers") return "Decision-rights fragmentation across products and mandates becomes the primary breakpoint.";
    if (scenario === "investors") return "Decision-rights fragmentation weakens delegated oversight effectiveness.";
    if (scenario === "infrastructure") return "Decision-rights misalignment weakens critical service escalation.";
    if (scenario === "intermediaries") return "Decision-rights misalignment disrupts capital and clearing escalation.";
    return "Decision-rights misalignment weakens governance control under stress.";
  }
  if (scenario === "intermediaries") {
    if (domains.CCI <= 2 || domains.CDR <= 2) return "Capital, clearing, and dependency coordination emerge as the primary breakpoint under stress.";
    if (grr === "A") return "No material breakpoint detected across execution and clearing governance layers.";
    return "Execution-layer coordination begins to weaken under combined market and operational stress.";
  }
  if (scenario === "assetmanagers") {
    if (domains.PGA <= 2 || domains.ADR <= 2) return "Mandate fragmentation and product governance misalignment become the primary breakpoint.";
    if (grr === "A") return "No material breakpoint detected across product, mandate, and reporting governance.";
    return "Governance coherence begins to weaken across products, mandates, and reporting lines.";
  }
  if (scenario === "investors") {
    if (domains.SA <= 2 || domains.CDR <= 2) return "Delegated oversight and custody visibility become the primary breakpoint.";
    if (grr === "A") return "No material breakpoint detected across delegated oversight structures.";
    return "Indirect control and delegated visibility begin to weaken governance resilience.";
  }
  if (scenario === "infrastructure") {
    if (domains.CDR <= 2 || trm.txt === "High" || trm.txt === "Severe") return "Concentration and dependency transmission become the primary systemic breakpoint.";
    if (grr === "A") return "No material breakpoint detected across platform and service continuity governance.";
    return "Critical dependency governance begins to weaken under system-level stress.";
  }
  if (Math.min(domains.SA, domains.CCI, domains.CDR, domains.PGA, domains.ADR) <= 2) return "Localized governance weakness emerges as the primary breakpoint under recurring monitoring conditions.";
  if (grr === "A") return "No material breakpoint under current monitoring conditions.";
  if (grr === "B") return "Governance drift begins to appear across escalation, visibility, and dependency controls.";
  if (grr === "C") return "Governance deterioration is concentrated in escalation, visibility, and dependency layers.";
  return "Critical governance failure under stressed monitoring conditions.";
}

function buildSupervisoryNarrativeScenario(inputs, penalties, domains, gsAdj, grr, trm){
  const scenario = document.body.dataset.scenario || "core";
  const context = SCENARIO_INTELLIGENCE[scenario];
  const narrativeContext = SCENARIO_NARRATIVE[scenario];
  const performance = gsAdj >= 21 ? "resilient" : gsAdj >= 16 ? "adequate" : gsAdj >= 11 ? "vulnerable" : "deficient";
  const execSummary = `${narrativeContext.intro} Governance performance is assessed as ${performance}, with a GSAT score of ${gsAdj}/25 and classification GRR-${grr}. Transmission risk is assessed as ${trm.txt.toLowerCase()}, reflecting exposure to ${context.keyRisk}.`;
  const governanceNarrative = `The assessment ${narrativeContext.lens} Escalation latency of ${inputs.latencyHours.toFixed(1)} hours, ${inputs.visibilityState} exposure visibility, and dependency concentration of ${Math.round(inputs.dependencyPct)}% define the current governance effectiveness under stress.`;

  let transmission;
  if (scenario === "intermediaries") transmission = `Stress transmission is driven by interaction between execution, clearing, and counterparty exposure. ${(trm.txt === "High" || trm.txt === "Severe") ? "Disruptions in clearing or margin coordination are likely to propagate across capital and execution layers." : "Transmission remains contained within execution and clearing coordination layers."}`;
  else if (scenario === "assetmanagers") transmission = `Transmission risk arises from product complexity and mandate fragmentation. ${(trm.txt === "High" || trm.txt === "Severe") ? "Stress propagates through product structures and reporting layers, weakening governance coherence." : "Transmission remains limited within product and mandate governance structures."}`;
  else if (scenario === "investors") transmission = `Transmission risk is driven by delegated structures and custody dependencies. ${(trm.txt === "High" || trm.txt === "Severe") ? "Stress propagates across asset managers and custodians, reducing effective oversight." : "Transmission remains contained within delegated oversight structures."}`;
  else if (scenario === "infrastructure") transmission = `Transmission risk reflects system-level dependency concentration. ${(trm.txt === "High" || trm.txt === "Severe") ? "Stress propagates across interconnected services, increasing systemic disruption risk." : "Transmission remains contained within individual service layers."}`;
  else transmission = `Transmission risk is driven by escalation delays, visibility gaps, and dependency structures. ${(trm.txt === "High" || trm.txt === "Severe") ? "Stress propagation affects multiple governance domains." : "Transmission remains contained within governance control boundaries."}`;

  const breakpointText = penalties.hits.length ? `Structural breakpoints identified: ${penalties.hits.join("; ")}.` : `No critical structural breakpoint triggered under current conditions.`;
  const domainFindings = `Domain assessment:<br>- Escalation & Accountability: ${domains.SA}/5<br>- Capital & Collateral Integrity: ${domains.CCI}/5<br>- Counterparty Dependency Risk: ${domains.CDR}/5<br>- Product Governance Alignment: ${domains.PGA}/5<br>- Audit & Decision Resilience: ${domains.ADR}/5`;
  let conclusion;
  if (scenario === "intermediaries") conclusion = grr === "A" ? "Governance remains robust across execution and clearing layers." : "Governance requires strengthening across execution, clearing, and counterparty coordination.";
  else if (scenario === "assetmanagers") conclusion = grr === "A" ? "Governance remains aligned across products and mandates." : "Governance requires strengthening across product structures and mandate alignment.";
  else if (scenario === "investors") conclusion = grr === "A" ? "Delegated governance structures remain effective under stress." : "Delegated oversight requires strengthening to maintain control under stress.";
  else if (scenario === "infrastructure") conclusion = grr === "A" ? "Platform governance remains stable under system conditions." : "System-level governance requires strengthening to mitigate dependency risk.";
  else conclusion = grr === "A" ? "Governance remains stable under monitoring conditions." : "Governance requires strengthening to prevent deterioration under stress.";
  return { execSummary, governanceNarrative, transmission, breakpointText, domainFindings, conclusion };
}

function buildEvidencePack(inputs, penalties, domains){
  return {
    observed: [
      `Escalation latency: ${inputs.latencyHours.toFixed(1)} hours`,
      `Exposure visibility: ${inputs.visibilityState}`,
      `Dependency concentration: ${Math.round(inputs.dependencyPct)}%`
    ],
    breakpoints: penalties.hits.length ? penalties.hits : ["No critical breakpoint triggered"],
    domainEvidence: [
      `Escalation & Accountability: ${domains.SA}/5`,
      `Capital & Collateral Integrity: ${domains.CCI}/5`,
      `Counterparty Dependency Risk: ${domains.CDR}/5`,
      `Product Governance Alignment: ${domains.PGA}/5`,
      `Audit & Decision Resilience: ${domains.ADR}/5`
    ],
    supervisory: [
      penalties.hits.length ? "Breakpoint penalty applied" : "No breakpoint penalty applied",
      "Score adjusted through model-based penalty logic",
      "Transmission risk calibrated via exposure structure"
    ]
  };
}
function buildEvidenceHTML(e){
  return `<strong>Evidence Observed During Assessment</strong><br><br><u>Observed Conditions</u><br>${e.observed.map(x => `• ${x}`).join("<br>")}<br><br><u>Triggered Breakpoints</u><br>${e.breakpoints.map(x => `• ${x}`).join("<br>")}<br><br><u>Domain Evidence</u><br>${e.domainEvidence.map(x => `• ${x}`).join("<br>")}<br><br><u>Supervisory Notes</u><br>${e.supervisory.map(x => `• ${x}`).join("<br>")}`;
}
function buildControlRecommendationsScenario(inputs, penalties, domains){
  const scenario = document.body.dataset.scenario || "core";
  const context = SCENARIO_INTELLIGENCE[scenario];
  const immediate = [], targeted = [], structural = [];
  if (!inputs.exposureOwner) immediate.push(`Assign integrated exposure ownership across ${context.focus}`);
  if (inputs.latencyHours > 4) immediate.push(`Reduce escalation latency to sub-1h across ${context.focus}`);
  if (inputs.dependencyPct > 60) immediate.push(`Reduce concentration across ${context.focus} and introduce fallback capacity`);
  if (scenario === "intermediaries") {
    if (!inputs.productClearingAligned) targeted.push("Align clearing broker exposure with execution and margin governance");
    targeted.push("Introduce clearing contingency and failover routing mechanisms");
  }
  if (scenario === "assetmanagers") {
    targeted.push("Align product governance with mandate constraints and risk exposure");
    targeted.push("Enhance oversight of complex and structured products");
  }
  if (scenario === "investors") {
    targeted.push("Strengthen delegated oversight across asset managers and counterparties");
    targeted.push("Implement consolidated exposure visibility across mandates");
  }
  if (scenario === "infrastructure") {
    targeted.push("Reduce platform concentration and introduce system redundancy");
    targeted.push("Enhance dependency mapping across critical infrastructure providers");
  }
  if (inputs.visibilityState === "T+2") targeted.push(`Implement intraday exposure visibility across ${context.focus}`);
  if (!inputs.decisionAligned) targeted.push(`Align decision authority with economic risk ownership across ${context.focus}`);
  structural.push(`Establish continuous governance monitoring across ${context.focus}`);
  structural.push(`Formalize stress escalation protocols for ${context.keyRisk}`);
  structural.push("Strengthen audit traceability and governance documentation");
  return { immediate, targeted, structural };
}
function buildControlsHTML(c){
  return `<strong>Based on identified breakpoints, the following controls are recommended</strong><br><br><u>Immediate Controls</u><br>${c.immediate.length ? c.immediate.map(x => `• ${x}`).join("<br>") : "• No immediate controls required"}<br><br><u>Targeted Controls</u><br>${c.targeted.length ? c.targeted.map(x => `• ${x}`).join("<br>") : "• No targeted controls required"}<br><br><u>Structural Controls</u><br>${c.structural.map(x => `• ${x}`).join("<br>")}`;
}
function simulateControlImpactScenario(inputs, penalties, domains, scenario){
  const improved = { ...inputs };
  if (!inputs.exposureOwner) improved.exposureOwner = true;
  if (inputs.latencyHours > 4) improved.latencyHours = 0.75;
  else if (inputs.latencyHours > 2) improved.latencyHours = 1.0;
  if (inputs.dependencyPct > 60) improved.dependencyPct = 47;
  else if (inputs.dependencyPct > 50) improved.dependencyPct = 45;
  if (inputs.visibilityState === "T+2") { improved.visibilityPct = 72; improved.visibilityState = "T+1"; }
  else if (inputs.visibilityState === "T+1") { improved.visibilityPct = 92; improved.visibilityState = "Intraday"; }
  if (!inputs.decisionAligned) { improved.decisionAligned = true; improved.decision = Math.max(inputs.decision, 4); }
  if (!inputs.productClearingAligned) { improved.productClearingAligned = true; improved.product = Math.max(inputs.product, 4); improved.capital = Math.max(inputs.capital, 4); }
  improved.escalation = Math.max(inputs.escalation, 4);
  improved.capital = Math.max(inputs.capital, 4);
  improved.dependency = Math.max(inputs.dependency, 4);
  improved.product = Math.max(inputs.product, 4);
  improved.decision = Math.max(inputs.decision, 4);
  if (scenario === "intermediaries") improved.dependencyPct = Math.min(improved.dependencyPct, 45);
  if (scenario === "infrastructure") improved.dependencyPct = Math.min(improved.dependencyPct, 40);
  if (scenario === "assetmanagers") improved.product = Math.max(improved.product, 4);
  if (scenario === "investors") { improved.visibilityPct = Math.max(improved.visibilityPct || 0, 90); improved.visibilityState = "Intraday"; }
  const improvedDomains = computeDomains(improved);
  const improvedRaw = computeGSATRaw(improvedDomains);
  const improvedPenalties = computePenalty(improved);
  const improvedScore = clamp(Math.round(improvedRaw - improvedPenalties.penalty * 5), 5, 25);
  const improvedTRMScore = computeTRM(improved);
  const improvedTRM = classifyTRM(improvedTRMScore);
  const improvedGRR = computeGRR(improvedScore, improved);
  return { improvedInputs: improved, improvedDomains, improvedPenalties, improvedScore, improvedTRM, improvedGRR };
}
function buildImpactHTML(impact, inputs, gsAdj, grr, trm, context){
  return `<strong>Control Impact Simulation</strong><br><br><u>Current State</u><br>- GSAT: ${gsAdj}/25<br>- GRR: ${grr}<br>- TRM: ${trm.txt}<br><br><u>Illustrative Strengthened State</u><br>- GSAT: ${impact.improvedScore}/25<br>- GRR: ${impact.improvedGRR}<br>- TRM: ${impact.improvedTRM.txt}<br><br><u>Scenario Impact</u><br>Governance improves across ${context.focus}, reducing ${context.keyRisk}.<br><br><u>Key Improvements</u><br>- Escalation: ${inputs.latencyHours.toFixed(1)}h → ${impact.improvedInputs.latencyHours.toFixed(1)}h<br>- Visibility: ${inputs.visibilityState} → ${impact.improvedInputs.visibilityState}<br>- Dependency: ${Math.round(inputs.dependencyPct)}% → ${Math.round(impact.improvedInputs.dependencyPct)}%<br><br><u>GSAT Uplift</u><br>+${impact.improvedScore - gsAdj} points`;
}
