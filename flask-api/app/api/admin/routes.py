from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ...extensions import db
from ...models import Vocab
from sqlalchemy.exc import IntegrityError

bp = Blueprint("admin", __name__, url_prefix="/admin")

ALLOWED_POS = {'noun','verb','adj','adv','prep','pron','conj','det','interj'}
ALLOWED_ART = {'der','die','das'}

def enum_to_value(x):
    return x.value if hasattr(x, "value") else x

def to_dict(v):
    return {
        "id": v.id,
        "german_word": v.german_word,
        "english_word": v.english_word,
        "parts_of_speech": enum_to_value(v.parts_of_speech),
        "article": enum_to_value(v.article),
        "plural": v.plural,
        "phrases": v.phrases,
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }

def validate_payload(data, partial=False):
    if not partial:
        for f in ["german_word", "english_word", "parts_of_speech"]:
            if not (data.get(f) or "").strip():
                return f"Missing field: {f}"

    if "parts_of_speech" in data:
        pos = (data.get("parts_of_speech") or "").strip()
        if pos and pos not in ALLOWED_POS:
            return "Invalid parts_of_speech"

    if "article" in data:
        art = data.get("article")
        if art is not None:
            art = art.strip()
            if art != "" and art not in ALLOWED_ART:
                return "Invalid article"

    return None

@bp.get("/vocab")
@jwt_required()
def list_vocab():
    items = Vocab.query.order_by(Vocab.id.desc()).limit(500).all()
    return jsonify([to_dict(v) for v in items])

@bp.post("/vocab")
@jwt_required()
def create_vocab():
    data = request.get_json(force=True)
    err = validate_payload(data)
    if err:
        return {"error": err}, 400

    v = Vocab(
        german_word=data["german_word"].strip(),
        english_word=data["english_word"].strip(),
        parts_of_speech=data["parts_of_speech"].strip(),
        article=(data.get("article").strip() if data.get("article") else None),
        plural=(data.get("plural") or None),
        phrases=(data.get("phrases") or None),
    )

    try:
        db.session.add(v)
        db.session.commit()
        return to_dict(v), 201
    
    except IntegrityError as e:

        db.session.rollback()
        pgcode = getattr(getattr(e, "orig", None), "pgcode", None)

        # 23505 = unique violation
        if pgcode == "23505":
            return {"error": "Word already available (duplicate German + English)."}, 409

        # 23514 = check constraint violation
        if pgcode == "23514":
            return {"error": "Invalid parts_of_speech or article."}, 400

        return {"error": "Database error."}, 400

@bp.patch("/vocab/<int:vid>")
@jwt_required()
def update_vocab(vid):
    v = Vocab.query.get_or_404(vid)
    data = request.get_json(force=True)

    err = validate_payload(data, partial=True)
    if err:
        return {"error": err}, 400

    for field in ["german_word","english_word","parts_of_speech","article","plural","phrases"]:
        if field in data:
            val = data[field]
            if isinstance(val, str):
                val = val.strip()
            if field == "article" and (val == "" or val is None):
                val = None
            setattr(v, field, val)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"error": "Update failed (maybe duplicate)."}, 409

    return to_dict(v)

@bp.delete("/vocab/<int:vid>")
@jwt_required()
def delete_vocab(vid):
    v = Vocab.query.get_or_404(vid)
    db.session.delete(v)
    db.session.commit()
    return {"deleted": True}