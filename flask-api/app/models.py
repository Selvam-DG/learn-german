import enum
from sqlalchemy.dialects.postgresql import ENUM, CITEXT
from sqlalchemy import func
from .extensions import db
from datetime import datetime

class PosEnum(enum.Enum):
    noun = "noun"
    verb = "verb"
    adj = "adj"
    adv = "adv"
    prep = "prep"
    pron = "pron"
    conj = "conj"
    det = "det"
    interj = "interj"

class ArticleEnum(enum.Enum):
    der = "der"
    die = "die"
    das = "das"

pos_type = ENUM(
    PosEnum,
    name="pos_type",
    create_type=False,   
)

article_type = ENUM(
    ArticleEnum,
    name="article_type",
    create_type=False,
)

class Vocab(db.Model):
    __tablename__ = "gerengvocab"

    id = db.Column(db.Integer, primary_key=True)
    german_word = db.Column(CITEXT(), nullable=False)
    english_word = db.Column(CITEXT(), nullable=False)

    parts_of_speech = db.Column(pos_type, nullable=False)
    article = db.Column(article_type, nullable=True)

    plural = db.Column(db.String(50))
    phrases = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=True)
    synonyms = db.Column(db.JSON, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    __table_args__ = (
        db.UniqueConstraint("german_word", "english_word", "parts_of_speech"),
    )
     
    def to_dict(self):
        return {
            "id":              self.id,
            "german_word":     self.german_word,
            "english_word":    self.english_word,
            "parts_of_speech": self.parts_of_speech.value if self.parts_of_speech else None,
            "article":         self.article.value if self.article else None,
            "plural":          self.plural,
            "phrases":         self.phrases,
            "created_at":      self.created_at.isoformat() if self.created_at else None,
            "synonyms": self.synonyms or [],
            "notes": self.notes or "",
        }

story_vocab = db.Table(
    "story_vocab",
    db.Column(
        "story_id",
        db.Integer,
        db.ForeignKey("stories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "vocab_id",
        db.Integer,
        db.ForeignKey("gerengvocab.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column("created_at", db.DateTime, server_default=func.now(), nullable=False),
    
)


class Story(db.Model):
    __tablename__ = "stories"

    id = db.Column(db.Integer, primary_key=True)

    story_number = db.Column(db.Integer, nullable=False, unique=True)
    title = db.Column(db.String(255), nullable=False)
    story_date = db.Column(db.Date, nullable=False)
    content = db.Column(db.Text, nullable=False)

    important_points = db.Column(db.JSON, nullable=True)

    start_date = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    last_edit_date = db.Column(
        db.DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    vocab_items = db.relationship(
        "Vocab",
        secondary=story_vocab,
        backref=db.backref("stories", lazy="dynamic"),
        lazy="joined",
    )
    difficulty = db.Column(db.String(20), nullable=True)

    def to_dict(self, include_vocab=True):
        data = {
            "id": self.id,
            "story_number": self.story_number,
            "title": self.title,
            "story_date": self.story_date.isoformat() if self.story_date else None,
            "content": self.content,
            "important_points": self.important_points or [],
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "last_edit_date": self.last_edit_date.isoformat() if self.last_edit_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "difficulty":self.difficulty or "easy"
        }

        if include_vocab:
            data["vocab_items"] = [vocab.to_dict() for vocab in self.vocab_items]

        return data