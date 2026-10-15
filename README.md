# StockWise — Product Inventory & Analytics Dashboard

A responsive inventory dashboard built with **HTML, CSS, and Vanilla JavaScript**. It is designed as a learning project demonstrating core JavaScript concepts through a practical product-management interface.

## Features

- Dashboard summary: total products, units in stock, inventory value, and low-stock count
- Add, edit, and delete products
- Search by product name or category
- Filter by category and stock status
- Low-stock alerts
- Inventory totals grouped by category
- Export inventory data to CSV
- Saves changes in browser `localStorage`
- Responsive layout for desktop and mobile
- Sample data included so the app works immediately

## Run locally

No package installation or build step is required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a local development server, you can use VS Code's Live Server extension or run `python -m http.server 8000` in this folder and open `http://localhost:8000`.

## JavaScript concepts demonstrated

| Concept | Where it is used |
|---|---|
| Variables and constants | Application state and DOM references |
| Arrays and objects | Product inventory data |
| Functions | Rendering, validation, formatting, and CRUD operations |
| Loops | Calculating totals and rendering rows/alerts |
| Conditionals | Stock status, filters, and form validation |
| Array methods | `filter`, `map`, `find`, `sort`, `reduce`-style aggregation via loops |
| DOM manipulation | Updating the table, summary cards, chart, and alerts |
| Events | Form submission, search, filters, edit/delete actions |
| Browser storage | Persisting inventory with `localStorage` |
| Data export | Generating and downloading a CSV file |

## Inventory value

For each product:

`Inventory value = Unit price × Quantity in stock`

The overall inventory value is the sum of all product inventory values.

## Notes

- All data is stored locally in the browser on the device where the app is used. It does not sync across devices.
- This is a front-end learning project, not a secure multi-user inventory system.
- The demo includes starter products. You can edit or delete them and add your own.

## Suggested future improvements

- Add chart libraries for richer visualizations
- Add import from CSV
- Add pagination for large inventories
- Add a backend and authentication if a multi-user version is needed

## Author

Add your name and GitHub profile link here before publishing.
