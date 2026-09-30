// ========================================
// 7. LEADS
// ========================================
function renderLeadsTable() {
  const search = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;

  const filteredLeads = getAccessibleLeads().filter((lead) => {
    const searchText = `${lead.name} ${lead.email} ${lead.phone} ${lead.company}`.toLowerCase();
    return searchText.includes(search) && (status === "all" || lead.status === status);
  });

  elements.leadsEmptyState.hidden = filteredLeads.length > 0;
  elements.leadsTable.innerHTML = filteredLeads
    .map(
      (lead) => `
        <tr>
          <td><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.email)} · ${escapeHtml(lead.phone)}</small></td>
          <td><strong>${escapeHtml(lead.source)}</strong><small>${escapeHtml(lead.service || "No service")}</small></td>
          <td>${escapeHtml(getUserName(lead.assignedTo))}</td>
          <td>${lead.followUpDate ? formatDate(lead.followUpDate) : "—"}</td>
          <td><span class="status status-${slug(lead.status)}">${escapeHtml(lead.status)}</span></td>
          <td>${formatMoney(lead.finalValue)}</td>
          <td class="align-right">
            <button class="table-button" data-edit="${lead.id}">Edit</button>
            ${currentUser.role === "admin" ? `<button class="table-button danger-text" data-delete="${lead.id}">Delete</button>` : ""}
          </td>
        </tr>`,
    )
    .join("");
}


// ========================================
// 9. LEAD FORM
// ========================================
function openLeadForm(leadId = "") {
  elements.leadForm.reset();
  document.querySelector("#leadId").value = leadId;
  elements.formTitle.textContent = leadId ? "Edit lead" : "Add lead";

  if (leadId) {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead) return;
    Object.entries(lead).forEach(([key, value]) => {
      const field = document.querySelector(`#${key}`);
      if (field) field.value = value ?? "";
    });
  }

  if (currentUser.role !== "admin") {
    elements.assignedTo.disabled = true;
  } else {
    elements.assignedTo.disabled = false;
  }

  const salespersonLockedFields = [
    "name",
    "email",
    "phone",
    "country",
    "company",
    "source",
    "service",
    "estimatedValue",
  ];
  salespersonLockedFields.forEach((id) => {
    document.querySelector(`#${id}`).disabled = currentUser.role === "salesperson";
  });

  elements.leadDialog.showModal();
}

function closeLeadForm() {
  elements.leadDialog.close();
}

function saveLeadFromForm(event) {
  event.preventDefault();
  const leadId = document.querySelector("#leadId").value;
  const existingLead = leads.find((lead) => lead.id === leadId);
  const now = new Date().toISOString();

  const salespersonIsEditing = currentUser.role === "salesperson" && existingLead;
  const leadData = {
    id: leadId || `lead-${Date.now()}`,
    name: salespersonIsEditing ? existingLead.name : fieldValue("name"),
    email: salespersonIsEditing ? existingLead.email : fieldValue("email"),
    phone: salespersonIsEditing ? existingLead.phone : fieldValue("phone"),
    country: salespersonIsEditing ? existingLead.country : fieldValue("country"),
    company: salespersonIsEditing ? existingLead.company : fieldValue("company"),
    source: salespersonIsEditing ? existingLead.source : fieldValue("source"),
    service: salespersonIsEditing ? existingLead.service : fieldValue("service"),
    assignedTo: currentUser.role === "admin" ? fieldValue("assignedTo") : existingLead?.assignedTo || "",
    status: fieldValue("status"),
    followUpDate: fieldValue("followUpDate"),
    notes: fieldValue("notes"),
    estimatedValue: salespersonIsEditing ? existingLead.estimatedValue : Number(fieldValue("estimatedValue") || 0),
    finalValue: Number(fieldValue("finalValue") || 0),
    createdBy: existingLead?.createdBy || currentUser.id,
    createdAt: existingLead?.createdAt || now,
    updatedAt: now,
  };

  if (existingLead) {
    leads = leads.map((lead) => (lead.id === leadId ? leadData : lead));
    addActivity(leadData.id, "Lead updated", describeChanges(existingLead, leadData));
  } else {
    leads.unshift(leadData);
    addActivity(leadData.id, "Lead created", `${leadData.name} was added from ${leadData.source}.`);
  }

  storage.saveLeads(leads);
  storage.saveActivity(activity);
  closeLeadForm();
  renderAll();
  showToast(existingLead ? "Lead updated successfully" : "Lead added successfully");
}

function describeChanges(before, after) {
  const changes = [];
  if (before.status !== after.status) changes.push(`status changed from ${before.status} to ${after.status}`);
  if (before.assignedTo !== after.assignedTo) changes.push(`assignment changed to ${getUserName(after.assignedTo)}`);
  if (Number(before.finalValue) !== Number(after.finalValue)) changes.push(`final sale updated to ${formatMoney(after.finalValue)}`);
  if (before.followUpDate !== after.followUpDate) changes.push("follow-up date updated");
  return changes.length ? capitalize(changes.join(", ")) + "." : "Lead information was edited.";
}

function addActivity(leadId, action, detail) {
  activity.unshift({
    id: crypto.randomUUID(),
    leadId,
    action,
    detail,
    userId: currentUser.id,
    timestamp: new Date().toISOString(),
  });
}


// ========================================
// 10. DELETE LEAD
// ========================================
function requestDelete(leadId) {
  deleteTargetId = leadId;
  elements.confirmDialog.showModal();
}

function deleteLead() {
  if (!deleteTargetId || currentUser.role !== "admin") return;
  leads = leads.filter((lead) => lead.id !== deleteTargetId);
  activity = activity.filter((item) => item.leadId !== deleteTargetId);
  storage.saveLeads(leads);
  storage.saveActivity(activity);
  deleteTargetId = null;
  elements.confirmDialog.close();
  renderAll();
  showToast("Lead deleted");
}

