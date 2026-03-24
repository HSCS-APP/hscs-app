const $ = (id) => document.getElementById(id);
let chart;

function latencyScore(hours){
  if (hours < 1) return 5;
  if (hours <= 4) return 4;
  if (hours <= 12) return 3;
  if (hours <= 24) return 2;
  return 1;
}
function visibilityScore(pct){
  if (pct > 90) return 5;
  if (pct >= 70) return 4;
  if (pct >= 50) return 3;
  if (pct >= 30) return 2;
  return 1;
}
function dependencyScore(pct){
  if (pct < 30) return 5;
  if (pct < 60) return 4;
  if (pct < 80) return 3;
  if (pct < 90) return 2;
  return 1;
}
function setBand(active){
  ["A","B","C","D"].forEach((k)=>$("band"+k)?.classList.remove("active"));
  $("band"+active)?.classList.add("active");
}
function setBar(id,value,textId){
  if ($(id)) $(id).style.width = (value * 20) + "%";
  if ($(textId)) $(textId).textContent = String(value).replace(".0","");
}
function openModal(){ $("contactModal").style.display = "flex"; }
function closeModal(){ $("contactModal").style.display = "none"; }

document.addEventListener("click", function(e){
  if (e.target.classList.contains("modal")) closeModal();
});

function getScenarioFromInputs(finalScore, miniGRR, trmText){
  const esc = Number($("esc").value);
  const cap = Number($("cap").value);
  const dep = Number($("dep").value);
  const prod = Number($("prod").value);
  const dec = Number($("dec").value);
  const assetComplexity = Number($("assetComplexity").value);
  const fragmentation = Number($("fragmentation").value);
  const transitionType = Number($("transitionType").value);
  const visibility = Number($("visibility").value);
  const latency = Number($("latency").value);
  const dependencyPct = Number($("dependencyPct").value);

  return {
    score: finalScore,
    grr: miniGRR,
    trm: trmText,
    timestamp: new Date().toLocaleString(),
    inputs: { esc, cap, dep, prod, dec, assetComplexity, fragmentation, transitionType, visibility, latency, dependencyPct }
  };
}

function renderHistory(){
  const container = $("historyList");
  if (!container) return;
  const history = JSON.parse(localStorage.getItem("gsat_history") || "[]");
  container.innerHTML = history.map((item, index) => `
    <div class="panel kpi-panel">
      <div class="subhead">Scenario ${index + 1}</div>
      <div class="kpi-value">${item.score}/25</div>
      <div class="kpi-desc">GRR: ${item.grr} · TRM: ${item.trm}</div>
      <div class="kpi-desc mt-10">${item.timestamp}</div>
      <button onclick="loadScenario(${index})" class="btn btn-primary mt-12">Load</button>
    </div>
  `).join("");
}

function loadScenario(index){
  const history = JSON.parse(localStorage.getItem("gsat_history") || "[]");
  const s = history[index];
  if (!s) return;
  const i = s.inputs;
  $("esc").value = i.esc;
  $("cap").value = i.cap;
  $("dep").value = i.dep;
  $("prod").value = i.prod;
  $("dec").value = i.dec;
  $("assetComplexity").value = i.assetComplexity;
  $("fragmentation").value = i.fragmentation;
  $("transitionType").value = i.transitionType;
  $("visibility").value = i.visibility;
  $("latency").value = i.latency;
  $("dependencyPct").value = i.dependencyPct;
  update(false);
}

function populateComparison(){
  const history = JSON.parse(localStorage.getItem("gsat_history") || "[]");
  const selectA = $("compareA");
  const selectB = $("compareB");
  if (!selectA || !selectB) return;
  const options = history.map((h,i) => `<option value="${i}">Scenario ${i+1} (${h.score}/25)</option>`).join("");
  selectA.innerHTML = options;
  selectB.innerHTML = options;
  if (history.length > 1 && !selectB.dataset.initialized){
    selectB.value = "1";
    selectB.dataset.initialized = "true";
  }
  updateComparison();
}

function updateComparison(){
  const history = JSON.parse(localStorage.getItem("gsat_history") || "[]");
  const aIndex = $("compareA")?.value;
  const bIndex = $("compareB")?.value;
  if (aIndex === undefined || bIndex === undefined) return;
  const A = history[aIndex];
  const B = history[bIndex];
  if (!A || !B) return;

  $("compareAScore").textContent = A.score + "/25";
  $("compareBScore").textContent = B.score + "/25";
  $("compareADetails").textContent = `GRR: ${A.grr} · TRM: ${A.trm}`;
  $("compareBDetails").textContent = `GRR: ${B.grr} · TRM: ${B.trm}`;

  const delta = B.score - A.score;
  let text = "";
  const bar = $("deltaBar");
  const magnitude = Math.min(Math.abs(delta) * 10, 100);

  if (delta > 0){
    text = `Scenario B improves governance resilience by +${delta}.`;
    bar.style.width = magnitude + "%";
    bar.style.background = "linear-gradient(90deg,#178c4a,#64c993)";
  } else if (delta < 0){
    text = `Scenario B deteriorates governance resilience by ${delta}.`;
    bar.style.width = magnitude + "%";
    bar.style.background = "linear-gradient(90deg,#b33c3c,#eb7c7c)";
  } else {
    text = "No material difference between scenarios.";
    bar.style.width = "10%";
    bar.style.background = "#9cb0d0";
  }
  $("compareDeltaText").textContent = text;

  const domains = [
    { key: "esc", label: "Escalation" },
    { key: "cap", label: "Capital & Clearing" },
    { key: "dep", label: "Dependency" },
    { key: "prod", label: "Product Governance" },
    { key: "dec", label: "Decision Authority" }
  ];
  const domainHTML = domains.map(d => {
    const a = A.inputs[d.key];
    const b = B.inputs[d.key];
    const diff = b - a;
    let color = "#9cb0d0";
    if (diff > 0) color = "#64c993";
    if (diff < 0) color = "#eb7c7c";
    return `
      <div style="display:grid;grid-template-columns:1fr 40px 40px 60px;gap:10px;margin-bottom:8px;align-items:center;font-size:13px;">
        <div>${d.label}</div>
        <div>${a}</div>
        <div>${b}</div>
        <div style="color:${color};font-weight:800;">${diff > 0 ? "+" : ""}${diff}</div>
      </div>
    `;
  }).join("");
  $("domainComparison").innerHTML = domainHTML;
}

function renderTrend(){
  const history = JSON.parse(localStorage.getItem("gsat_history") || "[]");
  const canvas = $("trendChart");
  if (!canvas || typeof Chart === "undefined") return;
  const labels = history.map((_, i) => `Run ${i+1}`).reverse();
  const data = history.map(h => h.score).reverse();
  if (chart) chart.destroy();
  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "GSAT Score",
        data,
        borderColor: "#7ea2ff",
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 5, max: 25,
          ticks: { color: "#9cb0d0" },
          grid: { color: "rgba(255,255,255,.05)" }
        },
        x: {
          ticks: { color: "#9cb0d0" },
          grid: { display: false }
        }
      }
    }
  });
}

function downloadReport(){
  const finalScore = $("score").textContent;
  const miniGRR = $("miniGRR").textContent;
  const trmText = $("miniTRM").textContent;
  const reportHTML = `
  <html>
  <head>
    <title>GSAT Governance Report</title>
    <style>
      body { font-family: Arial; padding: 40px; color: #111; }
      h1 { font-size: 28px; }
      .block { margin-top: 20px; }
      .kpi { font-size: 20px; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Governance Stress Test Report</h1>
    <div class="block">
      <div class="kpi">GSAT Score: ${finalScore}/25</div>
      <div>GRR: ${miniGRR}</div>
      <div>TRM: ${trmText}</div>
    </div>
    <div class="block"><strong>Scenario</strong><br/>Transition stress with multi-entity fragmentation and elevated dependency exposure.</div>
    <div class="block"><strong>Finding</strong><br/>Governance performance degrades under stress due to escalation latency and fragmented visibility.</div>
    <div class="block"><strong>Recommendation</strong><br/>Realign escalation pathways, improve exposure transparency, and reduce dependency concentration.</div>
  </body>
  </html>`;
  const win = window.open("", "", "width=900,height=700");
  win.document.write(reportHTML);
  win.document.close();
  win.print();
}

function update(saveHistory = true){
  const esc = Number($("esc").value);
  const cap = Number($("cap").value);
  const dep = Number($("dep").value);
  const prod = Number($("prod").value);
  const dec = Number($("dec").value);

  $("escVal").value = esc;
  $("capVal").value = cap;
  $("depVal").value = dep;
  $("prodVal").value = prod;
  $("decVal").value = dec;

  const assetComplexity = Number($("assetComplexity").value);
  const fragmentation = Number($("fragmentation").value);
  const transitionType = Number($("transitionType").value);
  const visibility = Number($("visibility").value);
  const latency = Number($("latency").value);
  const dependencyPct = Number($("dependencyPct").value);

  const escAdj = Math.round(((esc * 0.7) + (latencyScore(latency) * 0.3)) * 10) / 10;
  const capAdj = Math.round(((cap * 0.65) + (visibilityScore(visibility) * 0.35)) * 10) / 10;
  const depAdj = Math.round(((dep * 0.65) + (dependencyScore(dependencyPct) * 0.35)) * 10) / 10;
  const baseScore = escAdj + capAdj + depAdj + prod + dec;

  let finalScore = Math.round(baseScore + assetComplexity + fragmentation + transitionType);
  if (finalScore < 5) finalScore = 5;
  if (finalScore > 25) finalScore = 25;

  $("score").textContent = finalScore;
  $("miniScore").textContent = finalScore;

  let grrText = "";
  let grrClass = "";
  let activeBand = "D";
  let miniGRR = "D";
  if (finalScore >= 21){
    grrText = "GRR-A · Strong"; grrClass = "badge-green"; activeBand = "A"; miniGRR = "A";
  } else if (finalScore >= 16){
    grrText = "GRR-B · Adequate"; grrClass = "badge-amber"; activeBand = "B"; miniGRR = "B";
  } else if (finalScore >= 11){
    grrText = "GRR-C · Vulnerable"; grrClass = "badge-orange"; activeBand = "C"; miniGRR = "C";
  } else {
    grrText = "GRR-D · Deficient"; grrClass = "badge-red"; activeBand = "D"; miniGRR = "D";
  }

  $("grr").textContent = grrText;
  $("grr").className = "badge " + grrClass;
  $("miniGRR").textContent = miniGRR;
  setBand(activeBand);

  let riskPoints = 0;
  if (dependencyPct >= 80) riskPoints += 2;
  else if (dependencyPct >= 60) riskPoints += 1;
  if (visibility < 50) riskPoints += 2;
  else if (visibility < 70) riskPoints += 1;
  if (latency > 12) riskPoints += 2;
  else if (latency > 4) riskPoints += 1;
  riskPoints += Math.abs(fragmentation);

  let trmText = "";
  let trmLabel = "";
  let trmClass = "";
  if (riskPoints >= 5){
    trmText = "High"; trmLabel = "Cross-system propagation"; trmClass = "badge-red";
  } else if (riskPoints >= 3){
    trmText = "Moderate"; trmLabel = "Material transmission pressure"; trmClass = "badge-amber";
  } else {
    trmText = "Low"; trmLabel = "Contained propagation risk"; trmClass = "badge-green";
  }

  $("trmText").textContent = trmText;
  $("trm").textContent = trmLabel;
  $("trm").className = "badge " + trmClass;
  $("miniTRM").textContent = trmText;

  setBar("barEsc", escAdj, "barEscText");
  setBar("barCap", capAdj, "barCapText");
  setBar("barDep", depAdj, "barDepText");
  setBar("barProd", prod, "barProdText");
  setBar("barDec", dec, "barDecText");

  let interpretation = "";
  if (finalScore >= 21){
    interpretation = "Governance appears resilient under the simulated conditions. Stress is visible but largely contained through stronger escalation, control, and decision authority.";
  } else if (finalScore >= 16){
    interpretation = "Governance remains workable but vulnerable under transition pressure. Steady-state adequacy degrades when capital movement, infrastructure change, and time compression converge.";
  } else if (finalScore >= 11){
    interpretation = "Governance is structurally vulnerable under stress. Likely failure modes include delayed escalation, fragmented visibility, and amplified dependency risk.";
  } else {
    interpretation = "Governance appears deficient under the simulated conditions. Immediate structural realignment would be required before execution.";
  }
  $("text").textContent = interpretation;

  if ($("heroScore")){
    $("heroScore").textContent = finalScore;
    $("heroGRR").textContent = grrText;
    $("heroGRR").className = "badge " + grrClass;
    $("heroTRM").textContent = "TRM · " + trmText;
    $("heroTRM").className = "badge " + trmClass;
    $("heroLatency").textContent = latency + "h";
    $("heroVisibility").textContent = visibility + "%";
    $("heroDependency").textContent = dependencyPct + "%";
  }
  if ($("mobileScore")){
    $("mobileScore").textContent = finalScore;
    $("mobileGRR").textContent = miniGRR;
  }
  if ($("formScore")){
    $("formScore").value = finalScore;
    $("formGRR").value = miniGRR;
    $("formTRM").value = trmText;
  }

  if (saveHistory){
    const scenario = getScenarioFromInputs(finalScore, miniGRR, trmText);
    let history = JSON.parse(localStorage.getItem("gsat_history") || "[]");
    const last = history[0];
    const sameAsLast = last && JSON.stringify(last.inputs) === JSON.stringify(scenario.inputs) && last.score === scenario.score && last.grr === scenario.grr && last.trm === scenario.trm;
    if (!sameAsLast){
      history.unshift(scenario);
      history = history.slice(0, 5);
      localStorage.setItem("gsat_history", JSON.stringify(history));
    }
  }

  renderHistory();
  populateComparison();
  renderTrend();
}

document.addEventListener("DOMContentLoaded", function(){
  const form = $("contactForm");
  if (form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();
      const data = new FormData(form);
      try {
        await fetch("https://formspree.io/f/YOUR_ID", {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });
        form.innerHTML = `
          <div class="modal-title">Request Submitted</div>
          <div class="modal-sub" style="margin-top:10px;">
            We will review your governance scenario and revert within 24 hours.
          </div>
        `;
      } catch (err){
        alert("Submission failed. Please try again.");
      }
    });
  }

  ["esc","cap","dep","prod","dec","assetComplexity","fragmentation","transitionType","visibility","latency","dependencyPct"].forEach((id)=>{
    $(id).addEventListener("input", ()=>update(true));
    $(id).addEventListener("change", ()=>update(true));
  });

  document.addEventListener("change", function(e){
    if (e.target.id === "compareA" || e.target.id === "compareB") updateComparison();
  });

  update(false);
});
