const $ = (id) => document.getElementById(id);

function latencyScore(hours) {
  if (hours < 1) return 5;
  if (hours <= 4) return 4;
  if (hours <= 12) return 3;
  if (hours <= 24) return 2;
  return 1;
}

function visibilityScore(pct) {
  if (pct > 90) return 5;
  if (pct >= 70) return 4;
  if (pct >= 50) return 3;
  if (pct >= 30) return 2;
  return 1;
}

function dependencyScore(pct) {
  if (pct < 30) return 5;
  if (pct < 60) return 4;
  if (pct < 80) return 3;
  if (pct < 90) return 2;
  return 1;
}

function setBand(active) {
  ["A", "B", "C", "D"].forEach((k) => $("band" + k).classList.remove("active"));
  $("band" + active).classList.add("active");
}

function setBar(id, value, textId) {
  $(id).style.width = (value * 20) + "%";
  $(textId).textContent = String(value).replace(".0", "");
}

function update() {
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

  if (finalScore >= 21) {
    grrText = "GRR-A · Strong";
    grrClass = "badge-green";
    activeBand = "A";
    miniGRR = "A";
  } else if (finalScore >= 16) {
    grrText = "GRR-B · Adequate";
    grrClass = "badge-amber";
    activeBand = "B";
    miniGRR = "B";
  } else if (finalScore >= 11) {
    grrText = "GRR-C · Vulnerable";
    grrClass = "badge-orange";
    activeBand = "C";
    miniGRR = "C";
  } else {
    grrText = "GRR-D · Deficient";
    grrClass = "badge-red";
    activeBand = "D";
    miniGRR = "D";
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

  if (riskPoints >= 5) {
    trmText = "High";
    trmLabel = "Cross-system propagation";
    trmClass = "badge-red";
  } else if (riskPoints >= 3) {
    trmText = "Moderate";
    trmLabel = "Material transmission pressure";
    trmClass = "badge-amber";
  } else {
    trmText = "Low";
    trmLabel = "Contained propagation risk";
    trmClass = "badge-green";
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
  if (finalScore >= 21) {
    interpretation = "Governance appears resilient under the simulated conditions. Stress is visible but largely contained through stronger escalation, control, and decision authority.";
  } else if (finalScore >= 16) {
    interpretation = "Governance remains workable but vulnerable under transition pressure. Steady-state adequacy degrades when capital movement, infrastructure change, and time compression converge.";
  } else if (finalScore >= 11) {
    interpretation = "Governance is structurally vulnerable under stress. Likely failure modes include delayed escalation, fragmented visibility, and amplified dependency risk.";
  } else {
    interpretation = "Governance appears deficient under the simulated conditions. Immediate structural realignment would be required before execution.";
  }

  $("text").textContent = interpretation;
}

[
  "esc", "cap", "dep", "prod", "dec",
  "assetComplexity", "fragmentation", "transitionType",
  "visibility", "latency", "dependencyPct"
].forEach((id) => {
  $(id).addEventListener("input", update);
  $(id).addEventListener("change", update);
});

update();
