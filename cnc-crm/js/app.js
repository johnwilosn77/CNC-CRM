const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("nav button");
const addLeadButton = document.querySelector("#addLeadButton");
const leadForm = document.querySelector("#leadForm");
const cancelLead = document.querySelector("#cancelLead");

function showPage(pageName) {
  pages.forEach((page) => page.classList.add("hidden"));

  const selectedPage = document.querySelector(`#${pageName}Page`);
  selectedPage.classList.remove("hidden");

  renderLeads();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

addLeadButton.addEventListener("click", () => {
  leadForm.classList.remove("hidden");
});

cancelLead.addEventListener("click", () => {
  leadForm.reset();
  leadForm.classList.add("hidden");
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const lead = {
    id: crypto.randomUUID(),
    name: document.querySelector("#leadName").value.trim(),
    email: document.querySelector("#leadEmail").value.trim(),
    phone: document.querySelector("#leadPhone").value.trim()
  };

  leads.push(lead);
  saveLeads();

  leadForm.reset();
  leadForm.classList.add("hidden");
  renderLeads();
});

renderLeads();
showPage("dashboard");
