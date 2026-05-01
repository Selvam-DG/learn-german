from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ...extensions import db
from ...models import Vocab, Story
from datetime import datetime


stories_bp = Blueprint("stories", __name__)

@stories_bp.route("/stories", methods=["GET"])
def get_stories():
    stories = Story.query.order_by(Story.story_number.asc()).all()

    return jsonify([
        story.to_dict(include_vocab=False)
        for story in stories
    ]), 200
    
@stories_bp.route("/stories/<int:story_id>", methods=["GET"])
def get_story(story_id):
    story = Story.query.get_or_404(story_id)

    return jsonify(story.to_dict(include_vocab=True)), 200

@stories_bp.route("/admin/stories", methods=["GET"])
@jwt_required()
def get_stories_admin():
    stories = Story.query.order_by(Story.story_number.asc()).all()

    return jsonify([
        story.to_dict(include_vocab=True)
        for story in stories
    ]), 200
    
@stories_bp.route("/admin/stories", methods=["POST"])
@jwt_required()
def create_story():
    data = request.get_json()

    required_fields = ["story_number", "title", "story_date", "content"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    story_date = datetime.strptime(data["story_date"], "%Y-%m-%d").date()

    vocab_ids = data.get("vocab_ids", [])

    vocab_items = []
    if vocab_ids:
        vocab_items = Vocab.query.filter(Vocab.id.in_(vocab_ids)).all()

        if len(vocab_items) != len(set(vocab_ids)):
            return jsonify({"error": "One or more vocab IDs are invalid"}), 400

    story = Story(
        story_number=data["story_number"],
        title=data["title"],
        story_date=story_date,
        content=data["content"],
        difficulty=data.get("difficulty") or "easy",
        important_points=data.get("important_points", []),
        vocab_items=vocab_items,
    )

    db.session.add(story)
    db.session.commit()

    return jsonify(story.to_dict(include_vocab=True)), 201

@stories_bp.route("/admin/stories/<int:story_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_story(story_id):
    story = Story.query.get_or_404(story_id)

    data = request.get_json()

    if "story_number" in data:
        story.story_number = data["story_number"]

    if "title" in data:
        story.title = data["title"]

    if "story_date" in data:
        story.story_date = datetime.strptime(data["story_date"], "%Y-%m-%d").date()

    if "content" in data:
        story.content = data["content"]
    if "difficulty" in data:
        story.difficulty = data.get("difficulty") or "easy"

    if "important_points" in data:
        story.important_points = data["important_points"]

    if "vocab_ids" in data:
        vocab_ids = data.get("vocab_ids", [])

        vocab_items = Vocab.query.filter(Vocab.id.in_(vocab_ids)).all()

        if len(vocab_items) != len(set(vocab_ids)):
            return jsonify({"error": "One or more vocab IDs are invalid"}), 400

        story.vocab_items = vocab_items

    db.session.commit()

    return jsonify(story.to_dict(include_vocab=True)), 200

@stories_bp.route("/admin/stories/<int:story_id>", methods=["DELETE"])
@jwt_required()
def delete_story(story_id):
    story = Story.query.get_or_404(story_id)

    db.session.delete(story)
    db.session.commit()

    return jsonify({"message": "Story deleted successfully"}), 200