(function(){
const $=id=>document.getElementById(id);
const scenario=(document.body.dataset.scenario||'core');

const scenarioConfig = {
  core: {
    reportTitle: 'Governance Stress Test Report',
    breakpoint(adjusted){
      if (adjusted >= 21) return 'No material breakpoint under current conditions.';
      if (adjusted >= 16) return 'Escalation discipline begins to weaken under combined pressure.';
      if (adjusted >= 11) return 'Governance fracture emerges across visibility, escalation, and dependency layers.';
      return 'Critical governance failure under stress conditions.';
    },
    interpretation(adjusted){
      if (adjusted >= 21) return 'Governance performance is assessed as resilient under the simulated conditions, with stress contained across key control layers.';
      if (adjusted >= 16) return 'Governance performance remains adequate but exhibits pressure under stress, particularly across escalation and coordination layers.';
      if (adjusted >= 11) return 'Governance performance is assessed as vulnerable under the simulated stress conditions, with pressure observed across escalation, visibility, and dependency structures.';
      return 'Governance performance is assessed as deficient, with structural breakdown observed across escalation, visibility, and control mechanisms.';
    }
  },
  investors: {
    reportTitle: 'Institutional Governance Stress Report',
    breakpoint(adjusted){
      if (adjusted >= 21) return 'Oversight remains stable across delegated structures.';
      if (adjusted >= 16) return 'Visibility begins to weaken across custodians and administrators.';
      if (adjusted >= 11) return 'Custody and delegated oversight gap becomes the primary breakpoint.';
      return 'External dependency structure prevents effective governance control.';
    },
    interpretation(adjusted){
      if (adjusted >= 21) return 'Governance remains resilient across delegated structures. Oversight mechanisms effectively compensate for indirect control and external dependencies.';
      if (adjusted >= 16) return 'Governance remains functional but vulnerable where control is indirect. Dependency on custodians, administrators, and external managers introduces delayed visibility under stress.';
      if (adjusted >= 11) return 'Governance is structurally exposed through external dependency layers. Limited control combined with fragmented visibility creates material oversight risk.';
      return 'Governance fails under stress due to inability to control or escalate across delegated structures. Immediate redesign of oversight and reporting layers is required.';
    }
  },
  assetmanagers: {
    reportTitle: 'Asset & Wealth Governance Report',
    breakpoint(adjusted){
      if (adjusted >= 21) return 'Mandate and product governance remain aligned.';
      if (adjusted >= 16) return 'Coordination stress appears across product and reporting lines.';
      if (adjusted >= 11) return 'Multi-product fragmentation becomes the primary breakpoint.';
      return 'Governance fails across mandates, reporting, and escalation layers.';
    },
    interpretation(adjusted){
      if (adjusted >= 21) return 'Governance remains coherent across products and mandates. Coordination between investment, operations, and reporting functions is effective under stress.';
      if (adjusted >= 16) return 'Governance remains adequate but fragmentation across products and mandates introduces coordination inefficiencies under stress conditions.';
      if (adjusted >= 11) return 'Governance fragmentation across products, mandates, and reporting layers creates material risk under stress, particularly in escalation and visibility.';
      return 'Governance fails due to structural fragmentation. Lack of alignment across functions and mandates prevents effective control under stress.';
    }
  },
  intermediaries: {
    reportTitle: 'Intermediary Governance Stress Report',
    breakpoint(adjusted){
      if (adjusted >= 21) return 'Clearing and escalation remain aligned under stress.';
      if (adjusted >= 16) return 'Capital and clearing coordination begins to strain.';
      if (adjusted >= 11) return 'Clearing dependency concentration becomes the primary breakpoint.';
      return 'Execution-layer governance fails under capital and clearing stress.';
    },
    interpretation(adjusted){
      if (adjusted >= 21) return 'Governance remains resilient under execution stress. Escalation, capital coordination, and clearing visibility function effectively under pressure.';
      if (adjusted >= 16) return 'Governance remains workable but shows pressure under clearing and capital stress. Latency and dependency concentration begin to affect decision-making.';
      if (adjusted >= 11) return 'Governance is structurally vulnerable under execution stress. Clearing dependencies and capital visibility gaps create significant escalation risk.';
      return 'Governance breaks under stress conditions. Inability to coordinate capital, clearing, and escalation creates high execution failure risk.';
    }
  },
  infrastructure: {
    reportTitle: 'Infrastructure Governance Stress Report',
    breakpoint(adjusted){
      if (adjusted >= 21) return 'Platform governance remains stable under load.';
      if (adjusted >= 16) return 'Third-party dependency exposure begins to propagate stress.';
      if (adjusted >= 11) return 'Platform concentration becomes the primary breakpoint.';
      return 'System-level governance fails through infrastructure dependency transmission.';
    },
    interpretation(adjusted){
      if (adjusted >= 21) return 'Governance remains resilient across infrastructure layers. Platform dependencies are controlled and escalation pathways function under stress.';
      if (adjusted >= 16) return 'Governance remains stable but exposed to concentration risk. Dependency on critical infrastructure introduces potential transmission under stress.';
      if (adjusted >= 11) return 'Governance is vulnerable due to platform concentration and dependency exposure. Stress propagates across connected participants.';
      return 'Governance fails at the system level. Platform dependency and lack of escalation control create systemic risk propagation.';
    }
  }
};

const cfg = scenarioConfig[scenario] || scenarioConfig.core;
const els={
  esc:$('esc'),cap:$('cap'),dep:$('dep'),prd:$('prd'),dec:$('dec'),
  escVal:$('escVal'),capVal:$('capVal'),depVal:$('depVal'),prdVal:$('prdVal'),decVal:$('decVal'),
  assetComplexity:$('assetComplexity'),fragmentation:$('fragmentation'),transitionType:$('transitionType'),
  visibility:$('visibility'),latency:$('latency'),dependencyPct:$('dependencyPct'),
  scoreOut:$('scoreOut'),grrPill:$('grrPill'),trmOut:$('trmOut'),trmPill:$('trmPill'),
  interpretation:$('interpretation'),barEsc:$('barEsc'),barCap:$('barCap'),barDep:$('barDep'),barPrd:$('barPrd'),barDec:$('barDec'),
  barEscT:$('barEscT'),barCapT:$('barCapT'),barDepT:$('barDepT'),barPrdT:$('barPrdT'),barDecT:$('barDecT'),
  bandA:$('bandA'),bandB:$('bandB'),bandC:$('bandC'),bandD:$('bandD'),
  heroScore:$('heroScore'),heroGRR:$('heroGRR'),heroTRM:$('heroTRM'),
  heroLatency:$('heroLatency'),heroVisibility:$('heroVisibility'),heroDependency:$('heroDependency'),heroBreakpoint:$('heroBreakpoint'),
  baselineScore:$('baselineScore'),baselineGRR:$('baselineGRR'),baselineText:$('baselineText'),
  stressScore:$('stressScore'),stressGRR:$('stressGRR'),stressText:$('stressText'),deltaCallout:$('deltaCallout'),
  breakpointBox:$('breakpointBox'), reportTitle:$('reportTitle'), reportCurrentScore:$('reportCurrentScore'),
  reportCurrentGRR:$('reportCurrentGRR'), reportCurrentTRM:$('reportCurrentTRM'), reportCurrentText:$('reportCurrentText'),
  reportTargetScore:$('reportTargetScore'), reportTargetGRR:$('reportTargetGRR'), reportTargetTRM:$('reportTargetTRM'),
  reportTargetText:$('reportTargetText'), sheetGSAT:$('sheetGSAT'), sheetGRR:$('sheetGRR'), sheetTRM:$('sheetTRM'),
  reportBreakpoint:$('reportBreakpoint'), reportDeltaCallout:$('reportDeltaCallout'), monitorBreakpoint:$('monitorBreakpoint'), monitorDelta:$('monitorDelta')
};

function n(v){return parseFloat(v||0);}
function latencyScore(h){if(h<1)return 5;if(h<=4)return 4;if(h<=12)return 3;if(h<=24)return 2;return 1;}
function visibilityScore(p){if(p>90)return 5;if(p>=70)return 4;if(p>=50)return 3;if(p>=30)return 2;return 1;}
function dependencyScore(p){if(p<30)return 5;if(p<60)return 4;if(p<80)return 3;if(p<90)return 2;return 1;}
function rating(score){
  if(score>=21)return {txt:'GRR-A · Strong',cls:'green',active:'A',short:'GRR-A',label:'Strong'};
  if(score>=16)return {txt:'GRR-B · Adequate',cls:'amber',active:'B',short:'GRR-B',label:'Adequate'};
  if(score>=11)return {txt:'GRR-C · Vulnerable',cls:'orange',active:'C',short:'GRR-C',label:'Vulnerable'};
  return {txt:'GRR-D · Deficient',cls:'red',active:'D',short:'GRR-D',label:'Deficient'};
}
function trm(depPct,visPct,latHours,frag){
  let risk=0;
  if(depPct>=80)risk+=2;else if(depPct>=60)risk+=1;
  if(visPct<50)risk+=2;else if(visPct<70)risk+=1;
  if(latHours>12)risk+=2;else if(latHours>4)risk+=1;
  risk+=Math.abs(n(frag));
  if(risk>=5)return {txt:'High',pill:'Cross-system propagation',cls:'red'};
  if(risk>=3)return {txt:'Moderate',pill:'Material transmission pressure',cls:'amber'};
  return {txt:'Low',pill:'Contained propagation risk',cls:'green'};
}
function setBand(a){['A','B','C','D'].forEach(k=>els['band'+k].classList.remove('active'));els['band'+a].classList.add('active');}
function setBar(el,txt,val){el.style.width=(val*20)+'%';txt.textContent=String(val).replace('.0','');}
function animateValue(el,start,end,duration=260){
  if(!el){return;}
  if(start===end){el.textContent=end;return;}
  let startTime=null;
  function step(ts){
    if(!startTime)startTime=ts;
    const progress=Math.min((ts-startTime)/duration,1);
    el.textContent=Math.floor(progress*(end-start)+start);
    if(progress<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function update(){
  let core={esc:n(els.esc.value),cap:n(els.cap.value),dep:n(els.dep.value),prd:n(els.prd.value),dec:n(els.dec.value)};
  els.escVal.value=core.esc; els.capVal.value=core.cap; els.depVal.value=core.dep; els.prdVal.value=core.prd; els.decVal.value=core.dec;

  const vis=n(els.visibility.value), lat=n(els.latency.value), depPct=n(els.dependencyPct.value);
  const mods={asset:n(els.assetComplexity.value), frag:n(els.fragmentation.value), trans:n(els.transitionType.value)};

  let escAdj=Math.round(((core.esc*0.7)+(latencyScore(lat)*0.3))*10)/10;
  let capAdj=Math.round(((core.cap*0.65)+(visibilityScore(vis)*0.35))*10)/10;
  let depAdj=Math.round(((core.dep*0.65)+(dependencyScore(depPct)*0.35))*10)/10;
  let base=escAdj+capAdj+depAdj+core.prd+core.dec;
  let adjusted=base+mods.asset+mods.frag+mods.trans;
  adjusted=Math.max(5,Math.min(25,Math.round(adjusted)));

  const grr=rating(adjusted), tr=trm(depPct,vis,lat,mods.frag);
  const prevScore=parseInt(els.scoreOut.textContent)||adjusted;
  animateValue(els.scoreOut, prevScore, adjusted);
  els.grrPill.textContent=grr.txt; els.grrPill.className='pill '+grr.cls;
  els.trmOut.textContent=tr.txt; els.trmPill.textContent=tr.pill; els.trmPill.className='pill '+tr.cls;
  setBand(grr.active);

  setBar(els.barEsc,els.barEscT,escAdj);
  setBar(els.barCap,els.barCapT,capAdj);
  setBar(els.barDep,els.barDepT,depAdj);
  setBar(els.barPrd,els.barPrdT,core.prd);
  setBar(els.barDec,els.barDecT,core.dec);

  const breakpoint = cfg.breakpoint(adjusted);
  els.breakpointBox.textContent = breakpoint;
  if (els.heroBreakpoint) els.heroBreakpoint.textContent = breakpoint;
  if (els.reportBreakpoint) els.reportBreakpoint.textContent = breakpoint;
  if (els.monitorBreakpoint) els.monitorBreakpoint.textContent = breakpoint;

  const interp = cfg.interpretation(adjusted);
  els.interpretation.textContent = interp;

  els.heroScore.textContent=adjusted;
  els.heroLatency.textContent=lat+'h';
  els.heroVisibility.textContent=vis+'%';
  els.heroDependency.textContent=depPct+'%';
  els.heroGRR.textContent=grr.txt; els.heroGRR.className='pill '+grr.cls;
  els.heroTRM.textContent='TRM · '+tr.txt; els.heroTRM.className='pill '+tr.cls;

  const baselineRaw = core.esc + core.cap + core.dep + core.prd + core.dec;
  const baseline = Math.max(5, Math.min(25, Math.round(baselineRaw)));
  const baselineRating = rating(baseline);
  const delta = adjusted - baseline;

  els.baselineScore.textContent = baseline;
  els.baselineGRR.textContent = baselineRating.short;
  els.baselineGRR.className = 'pill ' + baselineRating.cls;
  els.baselineText.textContent = 'Governance remains stable under baseline operating conditions without additional stress amplification.';

  els.stressScore.textContent = adjusted;
  els.stressGRR.textContent = grr.short;
  els.stressGRR.className = 'pill ' + grr.cls;
  if (adjusted >= 21) {
    els.stressText.textContent = 'Governance remains resilient under the simulated stress conditions, with limited deterioration from baseline.';
  } else if (adjusted >= 16) {
    els.stressText.textContent = 'Governance remains functional but exhibits deterioration under stress, particularly across escalation and dependency structures.';
  } else if (adjusted >= 11) {
    els.stressText.textContent = 'Governance becomes structurally vulnerable under stress conditions, with deterioration visible across escalation, visibility, and dependency layers.';
  } else {
    els.stressText.textContent = 'Governance fails under the simulated stress conditions due to structural breakdown across escalation, visibility, and control mechanisms.';
  }

  els.deltaCallout.classList.remove('delta-positive','delta-mild','delta-material','delta-severe','delta-neutral');
  let deltaText = '';
  if (delta === 0) {
    deltaText = '→ Δ 0 · No material deterioration under stress';
    els.deltaCallout.classList.add('delta-neutral');
  } else if (delta > 0) {
    deltaText = `↑ Δ +${delta} · Resilience improves under current conditions`;
    els.deltaCallout.classList.add('delta-positive');
  } else if (delta <= -5) {
    deltaText = `↓ Δ ${delta} · Severe deterioration under stress`;
    els.deltaCallout.classList.add('delta-severe');
  } else if (delta <= -3) {
    deltaText = `↓ Δ ${delta} · Material deterioration under stress`;
    els.deltaCallout.classList.add('delta-material');
  } else {
    deltaText = `↓ Δ ${delta} · Moderate deterioration under stress`;
    els.deltaCallout.classList.add('delta-mild');
  }
  els.deltaCallout.textContent = deltaText;
  if (els.monitorDelta) els.monitorDelta.textContent = `Δ ${delta}`;

  if (els.reportTitle) els.reportTitle.textContent = cfg.reportTitle;
  if (els.reportCurrentScore) els.reportCurrentScore.textContent = adjusted;
  if (els.reportCurrentGRR) { els.reportCurrentGRR.textContent = grr.short; els.reportCurrentGRR.className = 'pill ' + grr.cls; }
  if (els.reportCurrentTRM) { els.reportCurrentTRM.textContent = 'TRM ' + tr.txt; els.reportCurrentTRM.className = 'pill ' + tr.cls; }
  if (els.reportCurrentText) els.reportCurrentText.textContent = interp;
  if (els.sheetGSAT) els.sheetGSAT.textContent = adjusted + '/25';
  if (els.sheetGRR) els.sheetGRR.textContent = grr.label;
  if (els.sheetTRM) els.sheetTRM.textContent = tr.txt;

  const targetScore = Math.min(25, adjusted + (adjusted >= 21 ? 1 : 5));
  const targetRating = rating(targetScore);
  if (els.reportTargetScore) els.reportTargetScore.textContent = targetScore;
  if (els.reportTargetGRR) { els.reportTargetGRR.textContent = targetRating.short; els.reportTargetGRR.className = 'pill ' + targetRating.cls; }
  if (els.reportTargetTRM) {
    const targetTRMClass = tr.txt === 'Low' ? 'green' : 'amber';
    const targetTRMText = tr.txt === 'Low' ? 'TRM Low' : 'TRM Moderate';
    els.reportTargetTRM.textContent = targetTRMText;
    els.reportTargetTRM.className = 'pill ' + targetTRMClass;
  }
  if (els.reportTargetText) els.reportTargetText.textContent = 'Governance resilience improves when escalation discipline, visibility, and dependency controls are strengthened.';
  if (els.reportDeltaCallout) {
    els.reportDeltaCallout.textContent = els.deltaCallout.textContent;
    els.reportDeltaCallout.className = els.deltaCallout.className;
  }
}

['esc','cap','dep','prd','dec','assetComplexity','fragmentation','transitionType','visibility','latency','dependencyPct'].forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  }
});

update();
})();
