# AGC Learning Portal

Live: https://agc-learning-portal.vercel.app (deployed by Vercel from the `main` branch).

A demo learning portal for students, parents, tutors, admins and developers. There is no server:
all data is saved in the browser (`localStorage`), and the login is for demonstration only.
Every demo account's password is `agc2026` (listed under "Demo accounts" on the login page).

## Folders

```
index.html              The page: loads the stylesheets and scripts below

css/
  base.css              Colour tokens (light + dark mode), fonts, resets
  login.css             Login screen
  layout.css            Sidebar, top bar and main area
  pages.css             Cards, tables, forms, buttons, calendar, badges

js/                     Loaded in this order; they share one global scope
  helpers.js            Settings and small helpers (dates, money, escaping, toast)
  data.js               Demo data, saved state and data helpers
  components.js         UI pieces used by several views
  views/
    student.js          Student pages
    parent.js           Parent pages
    tutor-hours.js      Tutor hours & payments
    calendar.js         Calendar (tutor, admin, super admin)
    tutor.js            Tutor pages
    admin.js            Admin & Super Admin pages
    developer.js        Developer pages and error log
    profiles.js         Student profiles
  app.js                Navigation, login, rendering and click/form handling (starts the app)

images/logo.jpg
```

## Common edits

| To change… | Edit |
|---|---|
| Colours or dark mode | `css/base.css` (the `--navy`, `--gold`… tokens) |
| A role's pages | the matching file in `js/views/` |
| Sidebar menu for a role | `NAV` and `ALLOWED` in `js/app.js` |
| Demo accounts or password | `accounts()` and `DEMO_PASSWORD` in `js/app.js` |
| Demo students, courses, packages | `js/data.js` |
| What happens when a button or form is used | `js/app.js` (events section) |

A new script must be added to `index.html` **after** the scripts it depends on.
