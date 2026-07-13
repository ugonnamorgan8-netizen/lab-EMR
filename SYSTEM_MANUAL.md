# ST. DAVID MEDICAL DIAGNOSTIC CENTRE System Manual

## Facility identity

- Name: `ST. DAVID MEDICAL DIAGNOSTIC CENTRE`
- Address: `BERLIN PLAZA #NO 110 OGUI ROAD ENUGU STATE NIGERIA`
- Email: `info@stdavidmedicaldiagnostic.org.ng`
- Phone: `08100094967`
- Website: `www.stdavidmedicaldiagnostic.org.ng`

## 1. Purpose of the system

Lab EMR is a single-application laboratory operations system for running the full path from patient registration to report dispatch. It combines:

- patient registration
- visit and test ordering
- invoice generation and payment recording
- specimen collection
- pre-analytics sample handling
- bench processing and result entry
- scientific validation
- QC run entry and review
- report generation and dispatch
- supervisor analytics, catalog management, user administration, and audit review

The current system is designed as an operational laboratory workspace, not a public portal. Users sign in and work inside role-controlled dashboards.

## 2. High-level architecture

The application is a monorepo with:

- `client/`: React frontend
- `server/`: Express backend
- `shared/`: shared schemas and types used by both client and server

Runtime behavior:

- Express serves the API under `/api/*`
- The same Express server also serves the built frontend
- Prisma handles data access against PostgreSQL
- Socket.IO delivers live notifications
- A lightweight cron bootstrap exists in the server, but it is currently a placeholder timer rather than a business automation engine

Core backend routes:

- `/api/auth`
- `/api/patients`
- `/api/visits`
- `/api/samples`
- `/api/invoices`
- `/api/catalog`
- `/api/admin`
- `/api/workflows`
- `/api/notifications`

## 3. User roles

The live role model has four roles:

### RECEPTIONIST

Used for front-desk operations:

- register patients
- create visits
- order tests
- hand completed visits over to accounts for payment confirmation

### ACCOUNTS

Used for finance operations:

- view the payment queue for newly registered patients
- quote invoice totals to patients
- confirm full invoice payment
- view billing dashboard
- review outstanding invoices
- record payments
- review patient directory

### LAB_SCIENTIST

Used for laboratory bench and release operations:

- specimen collection
- laboratory configuration
- test setup for analytes and reference ranges
- pre-analytics workflow
- processing and manual result entry
- amendment of existing results
- result validation
- QC run entry and review
- dispatch queue
- printable patient report view
- patient directory access

### SUPERVISOR

Full system access, including:

- all reception functions
- all lab scientist functions
- all accounts functions
- analytics
- user management
- settings management
- test catalog management
- audit log review

## 4. Authentication and session behavior

Users log in through the login page. The frontend stores the returned access token and current user in the client auth store. Once logged in:

- the user is redirected to the first screen allowed for their role
- route access is checked in the frontend using role permissions
- backend API access is also restricted by role middleware
- every dashboard header shows the signed-in account name and role
- the dashboard header also shows a live count of currently connected accounts
- the Alerts button in the header shows a red unread badge when new notifications are waiting
- logout calls the auth logout endpoint and clears the local session

For live use, login credentials should be created and managed by a supervisor from the user administration screen. The login page itself no longer displays seeded demo credentials.

## 5. Main workflow, end to end

The intended system flow is:

1. Register or find a patient
2. Create a visit and select tests
3. Auto-generate invoice and line items
4. Hand the patient to accounts for price confirmation and payment
5. Confirm invoice payment at the accounts desk
6. Collect specimen(s)
7. Move specimens through pre-analytics
8. Start processing and enter analyte results
9. Validate results
10. Generate report
11. Dispatch report

## 6. Patient registration

Page:

- `Reception > Register`

What it does:

- searches for possible existing patients using phone number input
- creates a new patient only if a match is not already present
- captures demographic and operational patient data

Fields captured:

- first name
- last name
- date of birth
- gender
- phone
- email
- address
- emergency contact
- emergency phone
- insurance provider
- policy number
- referring doctor
- referring facility
- clinical history
- allergies

Important behavior:

- the right-side match panel updates when the phone number has at least 3 characters
- after saving, the user is taken directly into the new visit screen for that patient

## 7. Visit creation and test ordering

Page:

- `Reception > New Visit`

What it does:

- creates a visit linked to the patient
- captures visit type and urgency
- lets the user search and select tests from the catalog
- generates grouped samples based on specimen type and container
- generates the visit invoice automatically

Visit types:

- `WALK_IN`
- `REFERRAL`
- `CORPORATE`
- `HOME_COLLECTION`

Urgency levels:

- `ROUTINE`
- `URGENT`
- `STAT`

Important behavior:

- selected tests are shown in the order review panel
- subtotal is calculated from test prices
- after confirmation, the visit is handed off to accounts for payment confirmation

## 8. Billing and invoices

### Invoice page

Route:

- `/billing/invoice/:visitId`

What it shows:

- invoice ID
- patient name
- itemized line items
- subtotal
- patient balance
- invoice status

Important behavior:

- one-click demo payment records the full remaining balance
- payment is currently posted with method `CARD`

### Billing dashboard

Page:

- `Billing > Dashboard`

What it shows:

- gross revenue
- collected revenue
- outstanding balance
- unpaid invoice count
- partial invoice count
- recent invoice history

### Outstanding invoices

Page:

- `Billing > Outstanding`

What it shows:

- all invoices with remaining balance
- patient and visit details
- invoice amount and balance
- a payment-first queue for accounts staff to confirm full invoice settlement

## 9. Visit queue and patient directory

### Queue

Page:

- `Reception > Queue`

What it shows:

- all visits
- urgency and visit status
- estimated TAT context
- number of tests ordered

Important behavior:

- opening a visit routes into the collection workspace

### Patients

Page:

- `Patients`

What it shows:

- deduplicated patient directory based on existing visits
- patient ID
- phone
- gender
- referring doctor
- clinical history

This screen is a practical registry view for operational lookup, not a fully expanded chart page.

## 10. Collection workflow

### Collection queue

Page:

- `Collection > Queue`

What it shows:

- visits with status `REGISTERED`
- grouped container requirements
- urgency
- TAT timer

### Collection workspace

Route:

- `/collection/:visitId`

What it does:

- shows each required sample for the visit
- shows specimen ID, specimen type, container, and ordered tests
- allows the user to mark each sample as collected

Current collection behavior:

- the collection action sets `collectedAt` to the current time
- the sample condition is saved as `ACCEPTABLE`
- collected samples then feed the pre-analytics queue
- opening the workspace from the scientist collection queue routes directly into this screen for the selected visit

## 10A. Scientist configuration workspace

Pages:

- `Scientist > Test Setup`
- `Scientist > Lab Config`

Purpose:

- let laboratory staff maintain the analytes used during result entry
- let laboratory staff set and adjust reference ranges for each analyte
- let laboratory staff update core lab identity and report-branding settings used across printed reports and the application shell

Test setup behavior:

- each test can expose an editable analyte list
- analytes can store name, unit, and sort order
- each analyte can carry one or more editable reference ranges
- reference ranges can be tailored by gender, age band, normal range, and critical range

Lab configuration behavior:

- the lab identity settings are editable from the scientist workflow
- updates affect the branding and contact details shown in result reports

## 11. Pre-analytics workflow

Page:

- `Pre-analytics > Queue`

Purpose:

- track samples after collection and before active bench analysis

Supported sample workflow statuses in this stage:

- `COLLECTED`
- `RECEIVED_LAB`
- `IN_CENTRIFUGE`
- `ALIQUOTED`
- `IN_ANALYSIS`
- `STORED`
- `DISPOSED`

Available actions depend on current status:

- `COLLECTED` -> receive in lab
- `RECEIVED_LAB` -> send to centrifuge or direct to analysis
- `IN_CENTRIFUGE` -> aliquot or direct to analysis
- `ALIQUOTED` -> send to analysis or store specimen

This page is the chain-of-custody handoff screen between collection and the bench.

## 12. Processing and result entry

Page:

- `Processing > Worklist`

Purpose:

- active scientist bench workspace for entering and amending results

What appears here:

- test orders that are pending or in analysis
- test metadata
- patient and visit context
- analyte list from the configured catalog parameters
- configured reference ranges

Scientist actions:

- start analysis
- manually enter each parameter result
- assign result flags
- add per-parameter flag notes
- add method
- add instrument
- add scientist note
- add overall interpretation
- prefill midpoint values as a convenience tool
- amend a previously saved result with a mandatory amendment reason

Result flags supported:

- `NORMAL`
- `LOW`
- `HIGH`
- `CRITICAL_LOW`
- `CRITICAL_HIGH`
- `ABNORMAL`
- `POSITIVE`
- `NEGATIVE`
- `INDETERMINATE`
- `SEE_NOTE`

Important behavior:

- results are no longer auto-generated
- entry is manual and analyte-by-analyte
- if a result already exists, saving becomes an amendment flow
- amendments require a reason

## 13. Validation workflow

Page:

- `Validation > Queue`

Purpose:

- scientific sign-off after result entry

What it shows:

- result sets awaiting validation
- parameter values
- flags
- urgency and timing context

Main action:

- `Validate result`

Effect:

- moves entered work toward dispatch/report generation

This page is intentionally simpler than processing. The scientist reviews completed results and confirms they are ready for release.

## 14. QC workflow

Page:

- `QC > Dashboard`

Purpose:

- enter and review quality control runs for active materials

What it shows:

- active control materials
- target mean and standard deviation
- expiry dates
- recent entries
- z-scores
- rule outcomes

QC rule statuses visible in the system:

- `IN_CONTROL`
- `WARNING_1_2S`
- `REJECT_1_3S`
- `REJECT_2_2S`
- `REJECT_R_4S`
- `REJECT_4_1S`
- `REJECT_10X`

Main action:

- record a new QC value for a material

Use case:

- supports routine QC tracking before or during analytical release decisions

## 15. Report generation and dispatch

### Dispatch queue

Page:

- `Dispatch > Queue`

What it does:

- lists validated or release-ready visits
- shows report status and dispatch state
- keeps invoice balance visible during release

Main actions:

- open print view
- generate report
- dispatch report

Dispatch delivery method currently used from the main action:

- `PRINT`

### Printable result report

Route:

- `/reports/visit/:visitId`

What the report includes:

- lab branding and logo
- lab name
- tagline
- address
- phone
- accreditation
- patient details
- referring doctor and facility
- clinical history
- visit summary
- invoice reference and current balance
- test-by-test analyte tables
- units
- reference ranges
- flags
- method
- instrument
- interpretation
- scientist notes
- certifying signatory area
- amendment note when present

Print behavior:

- print controls are hidden during printing
- the page is optimized to print the report content only

## 16. Supervisor administration

### Analytics

Page:

- `Admin > Analytics`

What it shows:

- total patients
- visits today
- active visits
- pending collection
- tests in analysis
- reports generated
- revenue collected
- outstanding balance
- visit status breakdown
- urgency breakdown
- recent visits
- department workload
- current TAT breach count

### Users

Page:

- `Admin > Users`

What it allows:

- create new staff accounts
- review all users
- edit role
- edit status
- edit department
- export a user archive and then delete the account
- delete an account without downloading an archive when appropriate

Deletion safeguards:

- a supervisor cannot delete their own account from this screen
- the system prevents removal of the last active supervisor account
- export-and-delete produces a JSON archive of the user's profile and recent operational footprint before deletion

Authentication safeguards:

- only active accounts can log in or refresh a session
- login attempts are rate-limited
- refresh cookies are marked secure in production
- production startup rejects default JWT secrets

User statuses supported:

- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`

### Settings

Page:

- `Admin > Settings`

What it allows:

- edit system settings stored as key/value pairs
- adjust branding and report information

Seeded settings include:

- `lab.name`
- `lab.address`
- `lab.phone`
- `lab.email`
- `lab.website`
- `lab.director`
- `lab.accreditation`
- `lab.tagline`
- `lab.logoUrl`

### Catalog

Page:

- `Admin > Catalog`

What it allows:

- review test inventory
- edit department
- edit price
- activate or deactivate tests
- review test panels and included tests

### Audit

Page:

- `Admin > Audit`

What it shows:

- latest tracked operational actions
- actor name, email, role
- action
- resource type and ID
- metadata
- timestamp
- IP address when captured

## 17. Notifications and real-time behavior

The system includes a full real-time notification layer visible to all logged-in users.

### Alerts button badge

- The **Alerts** button in the top header shows a pulsing red circle badge with the unread notification count whenever there are unread items
- The count is calculated on initial page load from items returned by `/api/notifications` that have `read: false`
- Each new notification pushed via Socket.IO increments the count by one
- The badge resets to zero immediately when the user clicks Alerts and the notification drawer opens
- The count caps at `99+` if more than 99 unread items are present

### Floating toast pop-up

- When a new notification arrives via WebSocket while the user is on any page, a floating toast slides in from the top-right corner of the screen
- The toast displays the notification title, message, and a bell icon
- A blue progress bar at the bottom of the toast shrinks over 4 seconds, matching the auto-dismiss timer
- The toast can be dismissed early by clicking the ✕ button or pressing `Escape`
- The toast does not block the rest of the interface while it is visible

### Notification drawer

- Clicking Alerts opens the notification drawer from the right side of the screen
- The drawer lists all notifications in reverse chronological order
- Opening the drawer resets the unread badge count to zero
- Closing the drawer returns the user to the current page without navigation

### Socket.IO real-time connection

When a user is logged in:

- the client connects to the Socket.IO server
- the client joins a room for that user's ID
- the client joins a room for that user's role
- the client joins a department room if one is set on the account
- new notifications are pushed into the drawer and trigger the floating toast in real time
- the server publishes a real-time connected-user count to all open dashboards
- the live user count in the header updates automatically without a page refresh

## 17A. UI layout and mobile behavior

### Desktop layout

On screens wider than 768 px (`md` breakpoint):

- the left sidebar is visible and shows the lab logo, name, address, and the full navigation menu for the current role
- the top header shows the lab short name, current page title, a Signed-in card with the user name and role, an Online now card with the connected account count, and the Alerts and Logout buttons
- the bottom navigation rail is hidden

### Mobile layout

On screens narrower than 768 px:

- the sidebar is hidden
- the top header collapses to a single compact row approximately 56 px tall:
  - left side: small lab logo, page title, and role subtitle (truncated if necessary)
  - right side: compact Alerts button (with unread badge if applicable) and Logout button
  - the Signed-in and Online now info cards are hidden to preserve screen space
- the bottom navigation rail appears at the very bottom of the viewport and shows the role-specific navigation links as horizontal scrollable tabs
- the content area fills the remaining height between the header and the bottom rail

### Sidebar navigation states

The sidebar navigation items use a color inversion effect:

- **Default state**: item has a subtle semi-transparent background and white text
- **Hover state**: hovering any inactive item temporarily inverts colors (white background, dark text) for the duration of the hover only; the inversion disappears when the cursor leaves
- **Active/selected state**: the currently selected route item maintains a persistent white background with dark text using CSS `!important` to prevent any hover rule from overriding it, regardless of CSS cascade order; the selected item stays inverted even after the cursor moves away

## 18. Core record types in the data model

Major business records include:

- `User`
- `Patient`
- `Visit`
- `Sample`
- `TestOrder`
- `TestCatalog`
- `TestParameter`
- `ReferenceRange`
- `TestPanel`
- `TestResult`
- `ResultValue`
- `QCMaterial`
- `QCEntry`
- `Report`
- `Invoice`
- `BillingItem`
- `Payment`
- `Notification`
- `AuditLog`
- `SystemSetting`

## 19. Important status concepts

### Visit status

- `REGISTERED`
- `SAMPLE_COLLECTED`
- `IN_PROCESSING`
- `AWAITING_QC`
- `VALIDATED`
- `DISPATCHED`
- `CANCELLED`

### Sample status

- `PENDING_COLLECTION`
- `COLLECTED`
- `IN_TRANSIT`
- `RECEIVED_LAB`
- `IN_CENTRIFUGE`
- `ALIQUOTED`
- `IN_ANALYSIS`
- `ANALYSIS_COMPLETE`
- `STORED`
- `DISPOSED`

### Test order status

- `PENDING`
- `IN_ANALYSIS`
- `RESULTED`
- `VALIDATED`
- `REPORTED`
- `REFERRED_OUT`
- `CANCELLED`

### Result status

- `PENDING`
- `ENTERED`
- `DELTA_CHECK_FAILED`
- `QC_FAILED`
- `VALIDATED`
- `AMENDED`
- `CANCELLED`

### Report status

- `PENDING`
- `GENERATED`
- `DISPATCHED`
- `AMENDED`

### Invoice status

- `UNPAID`
- `PARTIAL`
- `PAID`
- `VOID`
- `CORPORATE`

## 20. Seeded demo content

The demo seed can load demonstration content for testing and training, including:

- four system users
- twenty patients
- fifteen workflow-rich visits
- sample test catalog entries such as FBC, LFT, GLU, UA, and HIV
- a bundled panel
- QC materials and historical QC entries
- invoices, payments, reports, notifications, and audit-ready data relationships

Important production note:

- demo seeding is now intended to run only when `ENABLE_DEMO_SEED=true`
- standard deploys should apply schema updates without wiping live records

## 21. Current limitations and known demo behaviors

These points matter for training and expectation setting:

- the referral queue route is still a placeholder screen
- invoice payment buttons currently record full payment in one action for demo simplicity
- collection currently marks specimen condition as acceptable by default in the workspace action
- the patient directory is a concise operational registry, not a full chart module
- the cron bootstrap exists but does not yet run business rules beyond a placeholder interval
- some notification generation behavior depends on backend event logic and seeded data patterns rather than a broad alert rules engine

## 22. Recommended training order for staff

### Reception staff

1. Register patient
2. Search for duplicates
3. Create visit
4. Select tests
5. Review invoice
6. Track visit in queue

### Accounts staff

1. Open billing dashboard
2. Read invoice statuses
3. Settle balances from outstanding invoices
4. Verify financial impact in dashboard totals

### Laboratory scientist

1. Open collection queue
2. Mark samples collected
3. Maintain analytes, reference ranges, and lab configuration when needed
4. Move samples through pre-analytics
5. Start analysis
6. Enter manual analyte results
7. Validate results
8. Record QC runs
9. Generate and dispatch reports
10. Print patient result forms

### Supervisor

1. Review analytics
2. Review users and role assignments
3. Create or update staff accounts
4. Export account data before deletion when necessary
5. Update lab settings and branding
6. Manage catalog pricing and activation
7. Review audit trail regularly

## 23. Operational summary

In daily use, the system behaves like a single laboratory control center:

- reception creates patient and visit records
- billing is generated from ordered work
- laboratory staff push samples through collection, handling, processing, validation, and dispatch
- reports are printed with lab branding
- supervisors retain visibility and control across staffing, settings, analytics, and audit

That is the current working model of the application as implemented in this codebase.

## 24. Go-live transition — replacing demo data with real data

This section documents how the facility moves from the seeded demo state to live production use.

### What the demo seed contains

The database ships with the following fake data intended only for testing and demonstration:

- four test user accounts with placeholder emails and a shared test password
- twenty fake patients with synthetic names, phone numbers, and addresses
- fifteen fake visits distributed across all workflow stages
- samples, test orders, results, invoices, payments, and reports linked to those visits
- three BioRad QC control materials with thirty historical QC run entries each
- audit logs and notifications generated by the seed process

The following data is real and correct and must not be wiped:

- system settings (lab name, address, phone, email, logo URL, director, accreditation, tagline) — already seeded with the facility's actual identity
- test catalog entries (FBC, LFT, Glucose, Urinalysis, HIV Screen) with analyte parameters and reference ranges — these are real and should be expanded, not deleted

### Step 1 — wipe demo data

The demo seed is protected by an environment variable called `ENABLE_DEMO_SEED`. Normal production deployments never set this variable, so a routine redeploy will never wipe the database.

To run a clean wipe before go-live, execute the following once from the developer's machine while the server's `.env` is pointing at the live Supabase database:

```
cd server
ENABLE_DEMO_SEED=true npx tsx prisma/maybeSeed.ts
```

On Windows PowerShell:

```
$env:ENABLE_DEMO_SEED = "true"
npx tsx prisma/maybeSeed.ts
```

This deletes all fake patients, visits, samples, orders, results, invoices, payments, reports, QC runs, notifications, audit logs, and all user accounts. It then re-creates only the system settings and test catalog with real values. After the command completes, the `ENABLE_DEMO_SEED` variable must not be set again.

### Step 2 — create the first real supervisor account

After the wipe there are zero users in the database. The first real supervisor account must be inserted directly using a one-off script because there is no user to log in and use the UI yet.

Run the following from the server directory, replacing the name, email, and password with the facility's actual supervisor credentials:

```
npx tsx -e "
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const hash = await bcrypt.hash('YourRealPassword1!', 10);
await p.user.create({ data: {
  name: 'Dr. Ifeoma Balogun',
  email: 'supervisor@stdavidmedicaldiagnostic.org.ng',
  role: 'SUPERVISOR',
  department: 'Management',
  passwordHash: hash
}});
console.log('Supervisor created');
await p.\$disconnect();
"
```

Password must meet the system rules: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one symbol.

### Step 3 — create all staff accounts from the UI

Once the supervisor can log in:

1. Navigate to Admin > Users
2. Use the Create account panel to add each staff member
3. Assign the correct role (RECEPTIONIST, ACCOUNTS, LAB_SCIENTIST, or SUPERVISOR)
4. Provide a temporary password meeting the password rules
5. Communicate each person's email and temporary password to them directly

No further scripting is needed after this point. All account management is handled through the UI.

### Step 4 — verify system settings

Navigate to Admin > Settings and confirm all facility details are correct. These values appear on every printed patient report.

Settings to verify:

- `lab.name`
- `lab.address`
- `lab.phone`
- `lab.email`
- `lab.website`
- `lab.director`
- `lab.accreditation`
- `lab.tagline`
- `lab.logoUrl`

### Step 5 — expand the test catalog

The seeded catalog contains five tests. The lab's full test menu should be added through Admin > Catalog or Scientist > Test Setup before patient registration begins.

The system is now live. All records created from this point are real operational data.

## 25. Database and hosting

### Database

The system uses a PostgreSQL database hosted on Supabase. The connection string is stored in the `DATABASE_URL` environment variable on the hosting platform.

Supabase free tier behaviour:

- the free tier pauses the database automatically after seven consecutive days of zero API activity
- if the system is in active daily use it will not pause
- if it pauses it can be un-paused from the Supabase dashboard without any data loss

### Supabase tier upgrade

The project is currently on the Supabase free tier. The upgrade to the Pro tier should be done once the facility has confirmed payment and the system is in active production use.

Pro tier provides:

- no inactivity pause
- 8 GB database storage (versus 500 MB on free)
- daily automated backups with 7-day retention
- higher connection limits suitable for multi-user concurrent workloads

How to upgrade:

1. Log into supabase.com with the project owner account
2. Open the project and go to Settings > Billing
3. Switch to the Pro plan

The database connection string does not change when upgrading. No code changes and no redeploy are required. The upgrade takes effect immediately.

### Hosting platform

The application is deployed on Railway (or Render, depending on the active deployment). Environment variables are managed through the hosting platform's dashboard. The variables that must be set in the hosting environment are:

- `DATABASE_URL` — Supabase PostgreSQL connection string
- `DIRECT_URL` — same value as DATABASE_URL for Prisma migrations
- `JWT_ACCESS_SECRET` — strong random secret for access tokens
- `JWT_REFRESH_SECRET` — strong random secret for refresh tokens
- `NODE_ENV` — set to `production`

The variable `ENABLE_DEMO_SEED` must never be set in the production hosting environment.

## 26. Post-go-live safety rules

The following actions are irreversible and must never be performed once real patient data exists in the database:

| Action | Risk |
|---|---|
| Running `maybeSeed.ts` with `ENABLE_DEMO_SEED=true` | Permanently deletes all patients, visits, results, invoices, and users |
| Running `prisma db push --force-reset` | Drops and recreates all database tables — total data loss |
| Setting `ENABLE_DEMO_SEED=true` in Railway or Render environment variables | Will wipe the database on the next automatic deploy |
| Deleting the Supabase project | Permanently destroys the database with no recovery option |

Before performing any database migration or schema change after go-live, take a manual backup from the Supabase dashboard under Database > Backups.
