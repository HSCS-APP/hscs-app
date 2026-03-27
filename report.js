(function(){
const s=JSON.parse(sessionStorage.getItem("hscs_gsat_report_state")||"{}");
if(!s.outputs)return;
document.getElementById("r_score").innerText=s.outputs.score+"/25";
document.getElementById("r_grr").innerText=s.outputs.grr;
document.getElementById("r_trm").innerText=s.outputs.trm;
})();
