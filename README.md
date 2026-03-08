# German-English Vocabulary Learning App

A full-stack German–English vocabulary learning application built with:

-  Flask (Backend API)
-  React + TailwindCSS (Frontend)
-  PostgreSQL (Database)
-  Docker (Production Deployment)

The application allows:
- Admin authentication (JWT-based)
- Add / Edit / Delete vocabulary words
- Learn words by parts of speech
- Daily vocabulary selection (5, 10, 20 words)
- Production-ready containerized deployment

---

#  Project Structure

```

project-root/
│
├── flask-api/               # Flask API
├── frontend/              # React + Tailwind UI
├── docker-compose.yml     # Production deployment
├── .env                   # Environment configuration
└── README.md              # This file

````

---

#  Features

##  Admin Features
- JWT authentication
- Create new vocabulary entries
- Update existing words
- Delete entries
- Enforced uniqueness (German + English pair)

## Learning Features
- Random vocabulary
- Filter by part of speech
- Stable "Words of the Day"
- Article & plural support
- Phrase support

---

#  Environment Configuration

Create a `.env` file in the project root:

```env
BACKEND_PORT=5050
FRONTEND_PORT=5185

POSTGRES_DB_URL=postgresql+psycopg://user:password@YOUR_DB_HOST:5432/gereng_vocab

JWT_SECRET_KEY=super-secret-key
ADMIN_USER=admin
ADMIN_PASS=strong-password
````

---

# Production Deployment (Docker)

### Build and start containers

```bash
docker compose up --build -d
```

### View logs

```bash
docker compose logs -f
```

---

# Access the Application

| Service                | URL                            |
| ---------------------- | ------------------------------ |
| Frontend               | http://IP:5185            |
| Backend                | http://<IP>:5050/health     |
| API via Frontend Proxy | http://<IP>:5185/api/health |

---

# Authentication Flow

1. Admin logs in via `/admin/login`
2. JWT token stored in frontend
3. Token sent via `Authorization: Bearer <token>`
4. Protected routes require valid JWT

---

#  Database

* Uses existing PostgreSQL instance
* No database container required
* Supports:

  * ENUM types (pos_type, article_type)
  * Unique constraint (german_word, english_word)
  * Daily deterministic ordering

---

#  Future Enhancements

* Spaced repetition system (SRS)
* Multiple phrases per word (normalized table)
* Audio pronunciation support
* User accounts (non-admin learners)
* Progress tracking
* Role-based access control
* Admin dashboard analytics
* CI/CD pipeline
* HTTPS + reverse proxy (NGINX + SSL)

---

#  Architecture Overview

```
Browser
   ↓
Nginx (Frontend Container :5185)
   ↓
/api proxy
   ↓
Flask API (Gunicorn :5050)
   ↓
PostgreSQL Database
```

---

# Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Backend    | Flask + SQLAlchemy + JWT |
| Frontend   | React + TailwindCSS      |
| Database   | PostgreSQL               |
| Server     | Gunicorn                 |
| Static     | Nginx                    |
| Deployment | Docker + Docker Compose  |

---

#  Author

Developed as a full-stack vocabulary learning system using modern production practices.

---

# 📄 License

MIT License (or specify your license)


