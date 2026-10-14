
export function showLeadsPage(mainContent) {

    mainContent.innerHTML = `
        <h2>Lead Management</h2>

        <h3>Add New Lead</h3>

        <form id="leadForm">

            <label for="customerName">
                Customer Name
            </label>

            <input
                type="text"
                id="customerName"
                name="customerName"
                required
            >

            <label for="customerPhone">
                Phone Number
            </label>

            <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                required
            >

            <label for="leadSource">
                Lead Source
            </label>

            <select id="leadSource" name="leadSource">
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Call">Call</option>
            </select>

            <button type="submit">
                Add Lead
            </button>

        </form>
    `;
}
