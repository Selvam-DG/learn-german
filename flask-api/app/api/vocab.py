from flask import Blueprint, request, jsonify
from app.extensions import db
from ..models import Vocab, Story  
from sqlalchemy import or_
from .daily_vocab import to_dict
vocab_bp = Blueprint("vocab_public", __name__)



# ── NEW ROUTE 1: SEARCH ───────────────────────────────────────────────────────
# GET /vocab/search?q=haus&direction=de-en
# GET /vocab/search?q=house&direction=en-de
@vocab_bp.route("/vocab/search", methods=["GET"])
def vocab_search():
    q = request.args.get("q", "").strip()
    direction = request.args.get("direction", "de-en")

    if not q:
        return jsonify([])

    pattern = f"%{q}%"

    if direction == "en-de":
        results = (
            Vocab.query
            .filter(Vocab.english_word.ilike(pattern))
            .order_by(Vocab.german_word.asc())
            .limit(50)
            .all()
        )
    else:  # de-en (default)
        results = (
            Vocab.query
            .filter(Vocab.german_word.ilike(pattern))
            .order_by(Vocab.german_word.asc())
            .limit(50)
            .all()
        )

    return jsonify([v.to_dict() for v in results])


# ── NEW ROUTE 2: BROWSE BY LETTER ─────────────────────────────────────────────
# GET /vocab/browse?letter=A
@vocab_bp.route("/vocab/browse", methods=["GET"])
def vocab_browse():
    letter = request.args.get("letter", "").strip()

    if not letter:
        return jsonify([])

    pattern = f"{letter.upper()}%"

    results = (
        Vocab.query
        .filter(Vocab.german_word.ilike(pattern))
        .order_by(Vocab.german_word.asc())
        .all()
    )

    return jsonify([v.to_dict() for v in results])


# ── NEW ROUTE 3: SINGLE WORD DETAIL ───────────────────────────────────────────
# GET /vocab/<int:id>
@vocab_bp.route("/vocab/<int:id>", methods=["GET"])
def vocab_detail(id):
    v = Vocab.query.get_or_404(id)

    data = v.to_dict()

    data["stories"] = [
        {
            "id": story.id,
            "story_number": story.story_number,
            "title": story.title,
            "story_date": story.story_date.isoformat() if story.story_date else None,
            "difficulty": story.difficulty or "easy",
        }
        for story in v.stories.order_by(Story.story_number.asc()).all()
    ]

    data["synonyms"] = []
    data["notes"] = ""

    return jsonify(data), 200