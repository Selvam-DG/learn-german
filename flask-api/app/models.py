import enum
from sqlalchemy.dialects.postgresql import ENUM
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
    create_type=False,   # IMPORTANT: type already exists in Postgres
)

article_type = ENUM(
    ArticleEnum,
    name="article_type",
    create_type=False,
)

class Vocab(db.Model):
    __tablename__ = "gerengvocab"

    id = db.Column(db.Integer, primary_key=True)
    german_word = db.Column(db.String(100), nullable=False)
    english_word = db.Column(db.String(100), nullable=False)

    parts_of_speech = db.Column(pos_type, nullable=False)
    article = db.Column(article_type, nullable=True)

    plural = db.Column(db.String(50))
    phrases = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    
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
        }