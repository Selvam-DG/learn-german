
#  German-English Vocabulary Frontend

A modern React + TailwindCSS frontend for the German–English Vocabulary Learning Application.

This frontend provides:

- Admin dashboard (JWT authentication)
- Vocabulary management (Create / Edit / Delete)
- Daily vocabulary learning
- Filtering by part of speech
- Production-ready Nginx deployment
- Dockerized build process

---

# Architecture Overview

The frontend is built with:

- React (Vite)
- TailwindCSS
- Fetch API
- Nginx (production serving)
- Docker (multi-stage build)

```

frontend/
│
├── src/
│   ├── pages/
│   │   ├── Admin.jsx
│   │   ├── Login.jsx
│   │   └── Learn.jsx
│   ├── api.js
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── nginx.conf
├── Dockerfile
├── package.json
└── README.md

```

---

# Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | React |
| Build Tool   | Vite |
| Styling      | TailwindCSS |
| HTTP Client  | Fetch API |
| Web Server   | Nginx |
| Deployment   | Docker |

---

#  API Communication

The frontend communicates with the backend through a proxy:

```

/api → [http://backend:5050/](http://backend:5050/)

````

Example:

```javascript
fetch("/api/vocab/daily?n=10");
````

This allows:

* No hardcoded VM IP
* No CORS issues in production
* Clean separation between frontend and backend

---

# Authentication Flow

1. Admin logs in via `/auth/login`
2. JWT token stored in `localStorage`
3. Token sent with:

   ```
   Authorization: Bearer <token>
   ```
4. Protected admin routes require valid JWT

---

#  Core Pages

##  Learn Page

Features:

* Random vocabulary
* Daily vocabulary
* Filter by part of speech
* Adjustable word count (5 / 10 / 20)
* Displays article, plural, phrases

---

## Admin Page

Features:

* Add new vocabulary
* Edit existing entries
* Delete words
* Immediate UI refresh
* Error handling (duplicate detection)

---

## Login Page

Features:

* Admin authentication
* JWT token storage
* Route protection

---

# Styling

TailwindCSS is used for:

* Layout grids
* Responsive design
* Forms and buttons
* Card-based vocabulary display
* Utility-first styling

Tailwind config:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"]
```

---

# Production Deployment

The frontend uses a **multi-stage Docker build**:

### Stage 1: Build

```bash
npm run build
```

Generates optimized static files inside:

```
dist/
```

### Stage 2: Nginx

Nginx serves the static files and proxies `/api`.

Docker exposes:

```
5185
```

Access in production:

```
http://<VM-IP>:5185
```

---

# React Router Support

Nginx configuration includes:

```
try_files $uri /index.html;
```

This ensures client-side routing works correctly in production.

---

# Design Decisions

* Proxy-based API calls to avoid CORS complexity
* JWT stored in localStorage (simple admin use case)
* Simple state management (no Redux required)
* Clean component separation
* Production Nginx container instead of dev server

---

# Future Improvements

* Dark mode toggle
* Pagination support
* Search functionality
* Flashcard mode (flip card UI)
* Spaced repetition UI
* Progress tracking dashboard
* Multi-user login
* Mobile-first refinements
* Accessibility improvements
* Unit testing (React Testing Library)
* Error boundary components

---

# Development Mode

To run locally without Docker:

```bash
npm install
npm run dev
```

Dev server runs on:

```
http://localhost:5173
```

Ensure backend is running and proxy configured.

---

# Environment Variables

If not using proxy (not recommended), you can set:

```
VITE_API_URL=http://<VM-IP>:5050
```

But proxy configuration is preferred for production.

---

# License

MIT License (or specify your license)

