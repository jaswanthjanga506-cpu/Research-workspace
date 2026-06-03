from app.database import db
from app.models.tag import note_tags
from datetime import datetime

class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tags = db.relationship("Tag", secondary=note_tags, backref=db.backref("notes_list", lazy="dynamic"))
    comments = db.relationship("Comment", backref="note", lazy=True, cascade="all, delete-orphan")
    versions = db.relationship("VersionHistory", backref="note", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "workspace_id": self.workspace_id,
            "author_id": self.author_id,
            "author_name": self.author.username if self.author else "Unknown",
            "tags": [t.to_dict() for t in self.tags],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
