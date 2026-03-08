from flask import Blueprint, request, current_app
from flask_jwt_extended import create_access_token

bp = Blueprint("admin_auth", __name__, url_prefix="/admin/")

@bp.post("/login")
def login():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "")

    if username == current_app.config["ADMIN_USERNAME"] and password == current_app.config["ADMIN_PASSWORD"]:
        token = create_access_token(identity=username)
        return {"access_token": token}

    return {"error": "Invalid credentials"}, 401