from flask import Blueprint

bp = Blueprint("health", __name__, url_prefix="/")

@bp.get("/health")
def health():
    return {"Ok": True}