from flask import Blueprint, request, jsonify
from sqlalchemy import func, cast, BigInteger
from datetime import date
from ..models import Vocab


bp = Blueprint("daily_vocab", __name__, url_prefix="/vocab")
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
    
@bp.get("")
def list_random():
    pos = request.args.get('pos')
    limit = int(request.args.get("limit", 50))
    limit = max(1, min(limit, 200))
    
    q = Vocab.query
    
    if pos:
        q = q.filter(Vocab.parts_of_speech == pos)
    
    items = q.order_by(func.random()).limit(limit).all()
    return jsonify([to_dict(v) for v in items])
@bp.get("/daily")
def daily():
    n = int(request.args.get("n", 10))
    n = max(1, min(n, 50))
    pos = request.args.get("pos")

    today = date.today().isoformat()
    day_num = int(today.replace("-", ""))

    q = Vocab.query
    if pos:
        q = q.filter(Vocab.parts_of_speech == pos)

    # BIGINT math to avoid overflow
    expr = (
        (cast(Vocab.id, BigInteger) * 1103515245) +
        cast(day_num, BigInteger)
    ) % cast(2147483647, BigInteger)

    items = q.order_by(expr).limit(n).all()

    return jsonify({
        "date": today,
        "count": len(items),
        "items": [to_dict(v) for v in items],
    })