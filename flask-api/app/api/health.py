from flask import Blueprint

health_bp = Blueprint("health", __name__, url_prefix="/")

@health_bp.get("/health")
def health():
    return {"Ok": True}