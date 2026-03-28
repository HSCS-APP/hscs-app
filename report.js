(function(){
  'use strict';

  function $(id){ return document.getElementById(id); }
  function text(id, value){ const el=$(id); if(el) el.textContent=value; }
  function html(id, value){ const el=$(id); if(el) el.innerHTML=value; }

  function loadState(){
    try{
      return JSON.parse(sessionStorage.getItem('hscs_gsat_report_state') || 'null');
    }catch(err){
      console.error('Failed to read report state', err);
      return null;
    }
  }

  function scenarioLabel(key){
    return ({
      core:'Ongoing monitoring conditions',
      investors:'Delegated oversight and custody structures',
      assetmanagers:'Product governance and mandate alignment',
      intermediaries:'Execution, clearing, and counterparty coordination',
      infrastructure:'Platform dependency and systemic concentration'
    })[key] || 'Ongoing monitoring conditions';
  }

  function formatDate(iso){
    if(!iso) return 'Generated in current session';
    const d=new Date(iso);
    if(Number.isNaN(d.getTime())) return 'Generated in current session';
    return d.toLocaleString([], {year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'});
  }

  function parseInputs(inputs){
    const visibility = Number(inputs?.visibility || 0);
    const latency = Number(inputs?.latency || 0);
    const dependency = Number(inputs?.dependencyPct || 0);
    const visibilityState = visibility < 40 ? 'T+2' : visibility < 70 ? 'T+1' : 'Intraday';
    return { visibility, latency, dependency, visibilityState };
  }

  function findings(inputs){
    const out=[];
    if(inputs.latency > 4) out.push('Escalation pathways are materially delayed under stress conditions.');
    else if(inputs.latency > 2) out.push('Escalation pathways function but are delayed under stress.');
    else out.push('Escalation pathways remain responsive under simulated stress conditions.');

    if(inputs.visibilityState === 'T+2') out.push('Exposure visibility is delayed and does not support timely decision-making.');
    else if(inputs.visibilityState === 'T+1') out.push('Exposure visibility is partial, limiting governance responsiveness.');
    else out.push('Exposure visibility remains broadly sufficient under stress conditions.');

    if(inputs.dependency > 60) out.push('Counterparty and service dependencies create concentrated transmission risk.');
    else if(inputs.dependency > 45) out.push('Dependency concentration remains material and requires continued monitoring.');
    else out.push('Dependency concentration remains contained under the simulated stress state.');

    return out;
  }

  function vulnerabilityBlocks(inputs){
    return [
      {
        title:'Escalation Delay',
        behavior: inputs.latency > 4 ? 'Escalation exceeds defined response thresholds under stress.' : 'Escalation remains functional but is not immediate under stressed conditions.',
        impact:'Delayed escalation increases the probability that governance weakness amplifies rather than contains stress.',
        consequence:'Reduced crisis responsiveness and higher supervisory sensitivity.'
      },
      {
        title:'Visibility Gaps',
        behavior: inputs.visibilityState === 'T+2' ? 'Exposure visibility remains delayed beyond expected stress-reporting tolerance.' : inputs.visibilityState === 'T+1' ? 'Exposure visibility is partial and not consistently intraday.' : 'Exposure visibility remains broadly aligned to stress-reporting needs.',
        impact:'Opacity reduces decision quality and impairs the sequencing of escalation.',
        consequence:'Increased uncertainty under compressed decision timelines.'
      },
      {
        title:'Dependency Concentration',
        behavior: inputs.dependency > 60 ? 'Concentrated reliance on limited counterparties or service providers remains high.' : 'Dependency concentration remains material but partially manageable.',
        impact:'Stress propagates more rapidly through concentrated dependency channels.',
        consequence:'Higher transmission risk beyond the originating function.'
      }
    ];
  }

  function render(){
    const state=loadState();
    if(!state){
      html('r_exec','No simulation state was found for this report view. Return to the simulator, run a scenario, and open the report again.');
      return;
    }

    const inputs=parseInputs(state.inputs || {});
    const outputs=state.outputs || {};
    const currentText=state.report?.currentText || '';
    const targetText=state.report?.targetText || '';

    text('r_title', state.report?.title || 'Governance Stress Test Report');
    text('r_subtitle', 'Illustrative supervisory output based on simulated governance conditions.');
    text('r_scenario', scenarioLabel(state.scenario));
    text('r_generated', formatDate(state.capturedAt));

    text('r_score', outputs.score ? outputs.score + '/25' : '—');
    text('r_grr', outputs.grr || '—');
    text('r_trm', outputs.trm || '—');

    text('r_latency', inputs.latency ? inputs.latency.toFixed(1) + 'h' : '—');
    text('r_visibility', inputs.visibility ? Math.round(inputs.visibility) + '% (' + inputs.visibilityState + ')' : '—');
    text('r_dependency', inputs.dependency ? Math.round(inputs.dependency) + '%' : '—');
    text('r_delta', outputs.delta || '—');

    html('r_exec',
      '<strong>Objective.</strong> HSCS conducted a governance stress assessment to evaluate the institution’s ability to maintain effective oversight, escalation discipline, and decision integrity under simulated stress conditions.<br><br>' +
      '<strong>Executive Determination.</strong> Governance performance is assessed as <strong>' + (outputs.grr || 'Unavailable') + '</strong>, with a GSAT score of <strong>' + (outputs.score || '—') + '/25</strong> under the defined stress scenario. Transmission risk is classified as <strong>' + (outputs.trm || 'Unavailable') + '</strong>.'
    );

    html('r_findings',
      '<strong>Key Findings.</strong><ul class="report-list">' +
      findings(inputs).map(function(item){ return '<li>' + item + '</li>'; }).join('') +
      '</ul>'
    );

    html('r_conclusion',
      '<strong>Conclusion.</strong> ' + (currentText || 'Governance arrangements remain directionally stable under baseline assumptions but exhibit structural deterioration under stress, particularly across escalation responsiveness, exposure visibility, and dependency management.')
    );

    text('r_breakpoint', outputs.breakpoint || 'Structural vulnerability remains concentrated across escalation, visibility, and dependency conditions.');

    html('r_vulnerabilities',
      vulnerabilityBlocks(inputs).map(function(v){
        return '<div class="report-block"><strong>' + v.title + '</strong><br><strong>Observed behavior:</strong> ' + v.behavior + '<br><strong>Transmission impact:</strong> ' + v.impact + '<br><strong>Consequence:</strong> ' + v.consequence + '</div>';
      }).join('')
    );

    html('r_strengthened',
      '<strong>Current vs strengthened.</strong><br>' +
      'GSAT <strong>' + (outputs.score || '—') + '/25</strong> → <strong>' + (state.report?.sheetGSAT || '22/25') + '</strong><br>' +
      'GRR <strong>' + (outputs.grr || '—') + '</strong> → <strong>' + (state.report?.sheetGRR || 'Strong') + '</strong><br>' +
      'TRM <strong>' + (outputs.trm || '—') + '</strong> → <strong>' + (state.report?.sheetTRM || 'Moderate') + '</strong><br><br>' +
      '<strong>Interpretation.</strong> ' + (targetText || 'Reducing escalation latency, improving visibility to intraday conditions, and lowering dependency concentration materially improve governance resilience under simulated stress.')
    );
  }

  document.addEventListener('DOMContentLoaded', render);
})();
