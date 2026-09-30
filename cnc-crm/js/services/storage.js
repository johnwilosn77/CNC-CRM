const leads = JSON.parse(localStorage.getItem("crm_leads")) || [];

function saveLeads() {
  localStorage.setItem("crm_leads", JSON.stringify(leads));
}

function getLeads() {
  return leads;
}
