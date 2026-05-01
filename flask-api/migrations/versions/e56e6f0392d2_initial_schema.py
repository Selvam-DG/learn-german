"""initial schema

Revision ID: e56e6f0392d2
Revises: 
Create Date: 2026-05-01 17:53:57.329981

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'e56e6f0392d2'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")

    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pos_type') THEN
            CREATE TYPE pos_type AS ENUM (
                'noun', 'verb', 'adj', 'adv', 'prep',
                'pron', 'conj', 'det', 'interj'
            );
        END IF;
    END$$;
    """)

    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_type') THEN
            CREATE TYPE article_type AS ENUM ('der', 'die', 'das');
        END IF;
    END$$;
    """)

    op.create_table(
        "gerengvocab",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("german_word", postgresql.CITEXT(), nullable=False),
        sa.Column("english_word", postgresql.CITEXT(), nullable=False),
        sa.Column(
            "parts_of_speech",
            postgresql.ENUM(
                "noun", "verb", "adj", "adv", "prep",
                "pron", "conj", "det", "interj",
                name="pos_type",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "article",
            postgresql.ENUM(
                "der", "die", "das",
                name="article_type",
                create_type=False,
            ),
            nullable=True,
        ),
        sa.Column("plural", sa.String(length=50), nullable=True),
        sa.Column("phrases", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.UniqueConstraint(
            "german_word",
            "english_word",
            "parts_of_speech",
            name="gerengvocab_german_word_english_word_parts_of_speech_key",
        ),
    )

   


def downgrade():
    op.drop_table("gerengvocab")

    op.execute("DROP TYPE IF EXISTS article_type")
    op.execute("DROP TYPE IF EXISTS pos_type")