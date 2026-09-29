// ========================================
// 1. STORAGE AND APP STATE
// ========================================
const storage = window.crmStorage;
storage.initialize();

let leads = storage.getLeads();
let activity = storage.getActivity();
let currentUser = getUser(storage.getCurrentUserId());
let deleteTargetId = null;

const pageInformation = {
  dashboard: ["Dashboard", "Track your leads, follow-ups and sales."],
  leads: ["Lead management", "Add, assign and update customer leads."],
  activity: ["Activity history", "Review important changes across your leads."],
};

// ========================================
// 2. DOM ELEMENT REFERENCES
// ========================================
const elements = {
  pages: document.querySelectorAll(".page"),
  navLinks: document.querySelectorAll(".nav-link"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  currentUser: document.querySelector("#currentUser"),
  statsGrid: document.querySelector("#statsGrid"),
  recentLeads: document.querySelector("#recentLeads"),
  followUpList: document.querySelector("#followUpList"),
  leadsTable: document.querySelector("#leadsTable"),
  leadsEmptyState: document.querySelector("#leadsEmptyState"),
  activityList: document.querySelector("#activityList"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  addLeadButton: document.querySelector("#addLeadButton"),
  leadDialog: document.querySelector("#leadDialog"),
  leadForm: document.querySelector("#leadForm"),
  formTitle: document.querySelector("#formTitle"),
  assignedTo: document.querySelector("#assignedTo"),
  confirmDialog: document.querySelector("#confirmDialog"),
  toast: document.querySelector("#toast"),
  sidebar: document.querySelector("#sidebar"),
};

function getUser(id) {
  return storage.users.find((user) => user.id === id) || storage.users[0];
}

function roleLabel(role) {
  return {
    admin: "Admin",
    lead_generator: "Lead Generator",
    salesperson: "Salesperson",
  }[role];
}

// ========================================
// 3. APP INITIALIZATION
// ========================================
function initializeApp() {
  renderUserSelector();
  renderSalespeople();
  bindEvents();
  renderAll();
}

function bindEvents() {
  elements.navLinks.forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  document.querySelectorAll("[data-open-page]").forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.openPage));
  });

  elements.currentUser.addEventListener("change", (event) => {
    storage.setCurrentUserId(event.target.value);
    currentUser = getUser(event.target.value);
    renderAll();
    showToast(`Now viewing as ${currentUser.name}`);
  });

  elements.searchInput.addEventListener("input", renderLeadsTable);
  elements.statusFilter.addEventListener("change", renderLeadsTable);
  elements.addLeadButton.addEventListener("click", () => openLeadForm());
  elements.leadForm.addEventListener("submit", saveLeadFromForm);
  document.querySelector("#closeDialog").addEventListener("click", closeLeadForm);
  document.querySelector("#cancelDialog").addEventListener("click", closeLeadForm);
  document.querySelector("#cancelDelete").addEventListener("click", () => elements.confirmDialog.close());
  document.querySelector("#confirmDelete").addEventListener("click", deleteLead);
  document.querySelector("#menuButton").addEventListener("click", () => elements.sidebar.classList.toggle("open"));

  elements.leadsTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    if (editButton) openLeadForm(editButton.dataset.edit);
    if (deleteButton) requestDelete(deleteButton.dataset.delete);
  });
}

// ========================================
// 4. NAVIGATION
// ========================================
function showPage(pageName) {
  elements.pages.forEach((page) => page.classList.remove("active"));
  elements.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.page === pageName));
  document.querySelector(`#${pageName}Page`).classList.add("active");
  [elements.pageTitle.textContent, elements.pageSubtitle.textContent] = pageInformation[pageName];
  elements.sidebar.classList.remove("open");
}

function renderUserSelector() {
  elements.currentUser.innerHTML = storage.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)} · ${roleLabel(user.role)}</option>`)
    .join("");
  elements.currentUser.value = currentUser.id;
}

function renderSalespeople() {
  const salespeople = storage.users.filter((user) => user.role === "salesperson");
  elements.assignedTo.innerHTML = `<option value="">Unassigned</option>${salespeople
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`)
    .join("")}`;
}

// ========================================
// 5. ROLE / ACCESS LOGIC
// ========================================
function getAccessibleLeads() {
  if (currentUser.role === "admin") return leads;
  if (currentUser.role === "lead_generator") {
    return leads.filter((lead) => lead.createdBy === currentUser.id);
  }
  return leads.filter((lead) => lead.assignedTo === currentUser.id);
}

function renderAll() {
  leads = storage.getLeads();
  activity = storage.getActivity();
  renderDashboard();
  renderLeadsTable();
  renderActivity();
  elements.addLeadButton.hidden = currentUser.role === "salesperson";
}

// ========================================
// 6. DASHBOARD
// ========================================
function renderDashboard() {
  const visibleLeads = getAccessibleLeads();
  const finalSales = visibleLeads.reduce((sum, lead) => sum + Number(lead.finalValue || 0), 0);
  const stats = [
    ["Total leads", visibleLeads.length, "all visible records"],
    ["Follow-ups", visibleLeads.filter((lead) => lead.status === "Follow-up").length, "need attention"],
    ["Converted", visibleLeads.filter((lead) => lead.status === "Converted").length, "successful leads"],
    ["Sales amount", formatMoney(finalSales), "final recorded value"],
  ];

  elements.statsGrid.innerHTML = stats
    .map(
      ([label, value, helper], index) => `
        <article class="stat-card">
          <span class="stat-icon stat-${index + 1}">${["◎", "⌁", "✓", "₹"][index]}</span>
          <div>
            <p>${label}</p>
            <strong>${value}</strong>
            <small>${helper}</small>
          </div>
        </article>`,
    )
    .join("");

  elements.recentLeads.innerHTML = visibleLeads
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(
      (lead) => `
        <tr>
          <td><strong>${escapeHtml(lead.name)}</strong><small>${escapeHtml(lead.company || lead.email)}</small></td>
          <td><span class="status status-${slug(lead.status)}">${escapeHtml(lead.status)}</span></td>
          <td>${escapeHtml(getUserName(lead.assignedTo))}</td>
          <td>${formatMoney(lead.finalValue || lead.estimatedValue)}</td>
        </tr>`,
    )
    .join("") || emptyTableRow(4, "No leads available.");

  const followUps = visibleLeads
    .filter((lead) => lead.followUpDate && !["Converted", "Lost"].includes(lead.status))
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
    .slice(0, 5);

  elements.followUpList.innerHTML = followUps.length
    ? followUps
        .map(
          (lead) => `
            <article class="follow-up-item">
              <div class="date-block"><strong>${formatDay(lead.followUpDate)}</strong><span>${formatMonth(lead.followUpDate)}</span></div>
              <div><strong>${escapeHtml(lead.name)}</strong><p>${escapeHtml(lead.service || "No service selected")}</p></div>
            </article>`,
        )
        .join("")
    : `<div class="small-empty">No upcoming follow-ups.</div>`;
}

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
// 8. ACTIVITY
// ========================================
function renderActivity() {
  const visibleIds = new Set(getAccessibleLeads().map((lead) => lead.id));
  const visibleActivity = activity
    .filter((item) => visibleIds.has(item.leadId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  elements.activityList.innerHTML = visibleActivity.length
    ? visibleActivity
        .map((item) => {
          const lead = leads.find((entry) => entry.id === item.leadId);
          return `
            <article class="activity-item">
              <span class="activity-dot"></span>
              <div>
                <strong>${escapeHtml(item.action)}</strong>
                <p>${escapeHtml(item.detail)}</p>
                <small>${escapeHtml(lead?.name || "Deleted lead")} · ${escapeHtml(getUserName(item.userId))} · ${formatDateTime(item.timestamp)}</small>
              </div>
            </article>`;
        })
        .join("")
    : `<div class="small-empty">No activity is available for these leads.</div>`;
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

// ========================================
// 11. HELPER FUNCTIONS
// ========================================
function fieldValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function getUserName(id) {
  return id ? getUser(id).name : "Unassigned";
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDay(value) {
  return new Date(`${value}T00:00:00`).getDate().toString().padStart(2, "0");
}

function formatMonth(value) {
  return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${value}T00:00:00`));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function emptyTableRow(columns, message) {
  return `<tr><td colspan="${columns}" class="small-empty">${message}</td></tr>`;
}

function escapeHtml(value = "") {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

initializeApp();
