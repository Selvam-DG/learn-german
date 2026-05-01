from flask import Blueprint, request, current_app, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

auth_bp = Blueprint("admin_auth", __name__, url_prefix="/admin")


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if (
        username == current_app.config["ADMIN_USERNAME"]
        and password == current_app.config["ADMIN_PASSWORD"]
    ):
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()

    new_access_token = create_access_token(identity=current_user)

    return jsonify({
        "access_token": new_access_token,
    }), 200


@auth_bp.post("/logout")
def logout():
    return jsonify({"message": "Logged out"}), 200