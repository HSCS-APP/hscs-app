document.documentElement.classList.add('js-ready');
/* Extracted from locked prototype baseline */

(function(){
function pulse(el){
  if(!el) return;
  el.classList.add('is-updating');
  setTimeout(()=>el.classList.remove('is-updating'), 220);
}
function setBarAnimated(el, txt, val, delay=0){
  if(!el || !txt) return;
  setTimeout(()=>{
    el.style.width=(val*20)+'%';
    txt.textContent=String(val).replace('.0','');
  }, delay);
}

 const $=id=>document.getElementById(id);
 const els={esc:$('esc'),cap:$('cap'),dep:$('dep'),prd:$('prd'),dec:$('dec'),escVal:$('escVal'),capVal:$('capVal'),depVal:$('depVal'),prdVal:$('prdVal'),decVal:$('decVal'),assetComplexity:$('assetComplexity'),fragmentation:$('fragmentation'),transitionType:$('transitionType'),visibility:$('visibility'),latency:$('latency'),dependencyPct:$('dependencyPct'),scoreOut:$('scoreOut'),grrPill:$('grrPill'),trmOut:$('trmOut'),trmPill:$('trmPill'),interpretation:$('interpretation'),barEsc:$('barEsc'),barCap:$('barCap'),barDep:$('barDep'),barPrd:$('barPrd'),barDec:$('barDec'),barEscT:$('barEscT'),barCapT:$('barCapT'),barDepT:$('barDepT'),barPrdT:$('barPrdT'),barDecT:$('barDecT'),bandA:$('bandA'),bandB:$('bandB'),bandC:$('bandC'),bandD:$('bandD'),heroScore:$('heroScore'),heroGRR:$('heroGRR'),heroTRM:$('heroTRM'),heroLatency:$('heroLatency'),heroVisibility:$('heroVisibility'),heroDependency:$('heroDependency')};
 const n=v=>parseFloat(v||0);
 function latencyScore(h){if(h<1)return 5;if(h<=4)return 4;if(h<=12)return 3;if(h<=24)return 2;return 1;}
 function visibilityScore(p){if(p>90)return 5;if(p>=70)return 4;if(p>=50)return 3;if(p>=30)return 2;return 1;}
 function dependencyScore(p){if(p<30)return 5;if(p<60)return 4;if(p<80)return 3;if(p<90)return 2;return 1;}
 function rating(score){if(score>=21)return {txt:'GRR-A · Strong',cls:'green',active:'A'};if(score>=16)return {txt:'GRR-B · Adequate',cls:'amber',active:'B'};if(score>=11)return {txt:'GRR-C · Vulnerable',cls:'orange',active:'C'};return {txt:'GRR-D · Deficient',cls:'red',active:'D'};}
 function trm(depPct,visPct,latHours,frag){let risk=0;if(depPct>=80)risk+=2;else if(depPct>=60)risk+=1;if(visPct<50)risk+=2;else if(visPct<70)risk+=1;if(latHours>12)risk+=2;else if(latHours>4)risk+=1;risk+=Math.abs(n(frag));if(risk>=5)return {txt:'High',pill:'Cross-system propagation',cls:'red'};if(risk>=3)return {txt:'Moderate',pill:'Material transmission pressure',cls:'amber'};return {txt:'Low',pill:'Contained propagation risk',cls:'green'};}
 function setBand(a){['A','B','C','D'].forEach(k=>els['band'+k].classList.remove('active'));els['band'+a].classList.add('active');}
 function setBar(el,txt,val){setBarAnimated(el,txt,val,0);}
 function animateValue(el,start,end,duration=260){if(start===end){el.textContent=end;return;}let startTime=null;function step(ts){if(!startTime)startTime=ts;const progress=Math.min((ts-startTime)/duration,1);el.textContent=Math.floor(progress*(end-start)+start);if(progress<1)requestAnimationFrame(step);}requestAnimationFrame(step);} 
 function update(){
   let core={esc:n(els.esc.value),cap:n(els.cap.value),dep:n(els.dep.value),prd:n(els.prd.value),dec:n(els.dec.value)};
   els.escVal.value=core.esc; els.capVal.value=core.cap; els.depVal.value=core.dep; els.prdVal.value=core.prd; els.decVal.value=core.dec;
   const vis=n(els.visibility.value), lat=n(els.latency.value), depPct=n(els.dependencyPct.value);
   const mods={asset:n(els.assetComplexity.value), frag:n(els.fragmentation.value), trans:n(els.transitionType.value)};
   let escAdj=Math.round(((core.esc*0.7)+(latencyScore(lat)*0.3))*10)/10;
   let capAdj=Math.round(((core.cap*0.65)+(visibilityScore(vis)*0.35))*10)/10;
   let depAdj=Math.round(((core.dep*0.65)+(dependencyScore(depPct)*0.35))*10)/10;
   let base=escAdj+capAdj+depAdj+core.prd+core.dec;
   let adjusted=base+mods.asset+mods.frag+mods.trans; adjusted=Math.max(5,Math.min(25,Math.round(adjusted)));
   const grr=rating(adjusted), tr=trm(depPct,vis,lat,mods.frag);
   const prevScore=parseInt(els.scoreOut.textContent)||adjusted; animateValue(els.scoreOut,prevScore,adjusted); els.grrPill.textContent=grr.txt; els.grrPill.className='pill '+grr.cls; els.trmOut.textContent=tr.txt; els.trmPill.textContent=tr.pill; els.trmPill.className='pill '+tr.cls;
   setBand(grr.active);
   setBar(els.barEsc,els.barEscT,escAdj); setBar(els.barCap,els.barCapT,capAdj); setBar(els.barDep,els.barDepT,depAdj); setBar(els.barPrd,els.barPrdT,core.prd); setBar(els.barDec,els.barDecT,core.dec);
   let msg;
   if (adjusted >= 21){
     msg = 'Governance performance is assessed as resilient under the simulated conditions, with stress contained across key control layers.';
   } else if (adjusted >= 16){
     msg = 'Governance performance remains adequate but exhibits pressure under stress, particularly across escalation and coordination layers.';
   } else if (adjusted >= 11){
     msg = 'Governance performance is assessed as vulnerable under the simulated stress conditions, with pressure observed across escalation, visibility, and dependency structures.';
   } else {
     msg = 'Governance performance is assessed as deficient, with structural breakdown observed across escalation, visibility, and control mechanisms.';
   }
   els.interpretation.innerHTML=msg;
   els.heroScore.textContent=adjusted; els.heroLatency.textContent=lat+'h'; els.heroVisibility.textContent=vis+'%'; els.heroDependency.textContent=depPct+'%'; els.heroGRR.textContent=grr.txt; els.heroGRR.className='pill '+grr.cls; els.heroTRM.textContent='TRM · '+tr.txt; els.heroTRM.className='pill '+tr.cls;
 }
 [els.esc,els.cap,els.dep,els.prd,els.dec,els.assetComplexity,els.fragmentation,els.transitionType,els.visibility,els.latency,els.dependencyPct].forEach(el=>{el.addEventListener('input',update);el.addEventListener('change',update);});
 update();
})();


/* SaaS-ready state bridge: no visual impact, used later for persistence / auth */
window.GSATAppState = {
  getState: function(){
    const q = (id) => document.getElementById(id);
    return {
      scenario: document.body.dataset.scenario || 'core',
      inputs: {
        esc: q('esc')?.value,
        cap: q('cap')?.value,
        dep: q('dep')?.value,
        prd: q('prd')?.value,
        dec: q('dec')?.value,
        assetComplexity: q('assetComplexity')?.value,
        fragmentation: q('fragmentation')?.value,
        transitionType: q('transitionType')?.value,
        visibility: q('visibility')?.value,
        latency: q('latency')?.value,
        dependencyPct: q('dependencyPct')?.value
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
