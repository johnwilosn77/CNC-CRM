// HTML elements ko JavaScript mein access karo
const dashboardButton = document.getElementById("dashboardButton");
const leadsButton = document.getElementById("leadsButton");
const usersButton = document.getElementById("usersButton");
const settingsButton = document.getElementById("settingsButton");
const mainContent = document.getElementById("mainContent");

// Dashboard button par click
dashboardButton.addEventListener("click", function () {
    mainContent.innerHTML = `
        <h2>Dashboard</h2>
        <p>Welcome to C&C CRM.</p>
    `;
});

// Leads button par click
leadsButton.addEventListener("click", function () {
    mainContent.innerHTML = `
        <h2>Leads</h2>
        <p>Your leads will appear here.</p>
    `;
});