function renderLeads() {
  const leadsTable = document.querySelector("#leadsTable");
  const leadCount = document.querySelector("#leadCount");
  const leads = getLeads();

  leadCount.textContent = leads.length;

  leadsTable.innerHTML = leads.map((lead) => `
    <tr>
      <td>${lead.name}</td>
      <td>${lead.email}</td>
      <td>${lead.phone}</td>
    </tr>
  `).join("");
}
