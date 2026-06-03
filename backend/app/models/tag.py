from app.database import db

# Tag note relationship table
note_tags = db.Table(
    "note_tags",
    db.Column("note_id", db.Integer, db.ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

# Tag document relationship table
document_tags = db.Table(
    "document_tags",
    db.Column("document_id", db.Integer, db.ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }
