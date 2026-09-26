# LeadFlow CRM — Beginner Version 1

A small CRM built with HTML, CSS, and JavaScript. It is designed for learning and currently stores data in the browser with `localStorage`.

## Included features

- Dashboard totals for leads, follow-ups, conversions, and sales
- Add, edit, and delete leads
- Assign leads to salespeople
- Lead status and follow-up tracking
- Estimated and final sales values
- Notes and activity history
- Search and status filters
- Demonstration roles: admin, lead generator, and salesperson
- Responsive layout

## Start the CRM

### Easy option: VS Code Live Server

1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Node.js option

Open a terminal inside this folder and run:

```bash
npx serve .
```

Then open the local address shown in the terminal.

## Files to learn first

1. `index.html` contains the page structure and forms.
2. `css/style.css` controls the complete design.
3. `js/storage.js` stores users, sample leads, and browser data.
4. `js/app.js` controls navigation, permissions, calculations, forms, and tables.

## Role rules in this learning version

- **Admin:** sees all leads, assigns salespeople, and can delete leads.
- **Lead generator:** sees and edits leads they created and can add new leads.
- **Salesperson:** sees assigned leads and can update them.

The user selector is only for learning and demonstration. It is not secure authentication. Supabase Auth and database permissions will replace it in a later version.

## Reset the sample data

Open the browser developer console and run:

```javascript
localStorage.clear();
location.reload();
```

## Learning roadmap

1. Change the CRM name and colours.
2. Understand the lead array and table rendering.
3. Add a new lead field.
4. Study how LocalStorage saves data.
5. Replace LocalStorage with Supabase.
6. Add real authentication and database permissions.
7. Deploy the CRM online.
