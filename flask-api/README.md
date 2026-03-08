
#  German-English Vocabulary API (Backend)

A production-ready Flask REST API for managing and learning German–English vocabulary.

This service provides:
- JWT-based admin authentication
- Vocabulary CRUD operations
- Daily deterministic word selection
- Filtering by part of speech
- PostgreSQL ENUM integration
- Production deployment using Gunicorn

---

# Architecture Overview

The backend follows a modular Flask application factory pattern.

```

backend/
│
├── app/
│   ├── **init**.py        # App factory
│   ├── config.py          # Environment configuration
│   ├── extensions.py      # SQLAlchemy + JWT
│   ├── models.py          # Database models
│   └── api/
│       ├── health.py
│       ├── daily_vocab.py
│       └── admin/
│           ├── auth.py
│           └── routes.py
│
├── run.py
├── Dockerfile
├── requirements.txt
└── README.md

````

---

# Tech Stack

| Component        | Technology |
|------------------|------------|
| Framework        | Flask |
| ORM              | SQLAlchemy |
| Authentication   | Flask-JWT-Extended |
| Database         | PostgreSQL |
| Server           | Gunicorn |
| Containerization | Docker |

---

# Authentication

Admin authentication uses JWT tokens.

## Login

**POST** `/auth/login`

Request:
```json
{
  "username": "admin",
  "password": "password"
}
````

Response:

```json
{
  "access_token": "JWT_TOKEN"
}
```

Protected routes require:

```
Authorization: Bearer <token>
```

---

# Vocabulary Model

## Database Table: `gerengvocab`

| Column          | Type            | Notes                 |
| --------------- | --------------- | --------------------- |
| id              | Integer (PK)    | Auto increment        |
| german_word     | String          | Required              |
| english_word    | String          | Required              |
| parts_of_speech | ENUM (pos_type) | noun, verb, adj, etc. |
| article         | ENUM            | der, die, das         |
| plural          | String          | Optional              |
| phrases         | String          | Optional              |
| created_at      | Timestamp       | Default now()         |

### Constraints

* Unique constraint:

```
(german_word, english_word)
```

* ENUM enforcement for:

  * `parts_of_speech`
  * `article`

---

# API Endpoints

## Public Routes

### Health Check

```
GET /health
```

### Random Vocabulary

```
GET /vocab?pos=verb&limit=10
```

### Daily Vocabulary

```
GET /vocab/daily?n=10&pos=noun
```

Daily results are deterministic per date.

---

## Admin Routes (JWT Required)

### List Vocabulary

```
GET /admin/vocab
```

### Create Vocabulary

```
POST /admin/vocab
```

### Update Vocabulary

```
PATCH /admin/vocab/<id>
```

### Delete Vocabulary

```
DELETE /admin/vocab/<id>
```

---

# Database Configuration

The backend connects using:

```
POSTGRES_DB_URL
```

Example:

```env
POSTGRES_DB_URL=postgresql+psycopg://user:password@host:5432/gereng_vocab
```

---

# Production Deployment

The backend runs using Gunicorn:

```
gunicorn -w 2 -k gthread --threads 4 -b 0.0.0.0:5000 run:app
```

Docker exposes:

```
5000
```

---

#  Design Decisions

* Used PostgreSQL ENUM types for strong type safety
* Deterministic daily word ordering
* Clean modular blueprint structure
* Strict database-level validation
* Token-based admin access

---

# Future Improvements

* Spaced Repetition Algorithm (SRS)
* Role-based user system
* Rate limiting
* Input validation layer (Marshmallow / Pydantic)
* Pagination support
* Logging and monitoring
* Alembic migrations
* OpenAPI documentation
* Unit & integration tests

---

# Development Mode

To run locally without Docker:

```
python run.py
```

Ensure `.env` is configured properly.

---

#  Error Handling

The API distinguishes:

* `400` → Validation errors
* `401` → Authentication failure
* `409` → Unique constraint violation
* `500` → Server error

---

#  License

MIT License (or specify your license)
