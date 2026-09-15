# Bottle-Project

## Running the Application

To start the Backend server, run the following command from the `Backend` directory:
```bash
cd Backend
npx nodemon server.js
```

To start the Admin Panel (frontend), run the following command from the `admin panel` directory:
```bash
cd "admin panel"
npm run dev
```

## SG Label Seeder

To sync all existing Variants into the SG Label module automatically, run the following command from the `backend` directory:

```bash
cd backend
node src/seeders/sgLabelSeeder.js
```

## SG Labels Module Architecture

The SG Labels module allows users to generate print-ready labels for combinations of Bottles, Variants, Coating Shades, and Text Colors. It is designed to be **decoupled** from the master data, ensuring that custom edits to labels never accidentally overwrite the original master specifications.

### Key Files Involved

**Frontend (Admin Panel / React)**
- `admin panel/src/pages/SgLabel/` (Entire folder: `SgLabels.jsx`, `AddSgLabel.jsx`, `EditSgLabel.jsx`)
- `admin panel/src/store/slices/sgLabelSlice.js` (Redux state for SG Labels)
- `admin panel/src/store/store.js` (Redux store configuration)
- `admin panel/src/App.jsx` (React routes for the module)
- `admin panel/src/layout/Sidebar.jsx` (Sidebar navigation link)

**Backend (API & Database)**
- `backend/src/models/SgLabel.js`: The MongoDB schema defining the SG Label document.
- `backend/src/controllers/sgLabel.controller.js`: Contains all CRUD operations, pagination logic, duplicate validation, and the PDF generation engine.
- `backend/src/routes/sgLabel.routes.js`: Express routes for the module.
- `backend/src/app.js`: Where the `sgLabel.routes.js` is imported and registered.
- `backend/src/seeders/sgLabelSeeder.js`: Seeder script to sync existing variants.
- `backend/src/seeders/rbac.seeder.js`: Contains updated RBAC permissions to grant access to Managers/Admins.
- `backend/package.json`: Updated to include `puppeteer` for PDF generation (requires running `npm install puppeteer` on the live server).

### How Data Comes Together

1. **Auto-Importing Master Data (Read-Only View)**
   - When viewing the SG Labels table, the backend dynamically fetches all existing `Variant` master records and merges them with any custom `SgLabel` records.
   - This ensures that every Variant automatically has a base SG Label ready for printing, without needing to manually create one.

2. **Custom Overrides (Data Integrity)**
   - If a user needs a specific text color, coating shade, or slightly different text for the label, they can edit it.
   - When selecting a Bottle and Variant from the dropdowns, the original master names are populated. The user can then freely type over them.
   - Upon saving, this creates an **override document** in the `sg-labels` collection containing `customBottleName` and `customVariantName`. 
   - **Crucially, the original `BottleSpec` and `Variant` collections are completely untouched.**

3. **Strict Duplicate Prevention**
   - The backend validates that exact duplicate combinations of Bottle, Variant, Shade, Text Color, and Custom Names cannot be created, preventing duplicate entries.

4. **Dynamic PDF Generation**
   - When "Print" is clicked, the `generateSgLabelPdf` controller boots a Headless Chrome instance (Puppeteer).
   - It constructs the label using the custom overrides (if any) or falls back to the master names.
   - **Dynamic Auto-Scaling**: To prevent long text from being cut off on the physical 75x25mm sticker, a JavaScript snippet is injected directly into the PDF generation phase. This script physically measures the text and shrinks the font size pixel-by-pixel until it fits perfectly inside the label container.

