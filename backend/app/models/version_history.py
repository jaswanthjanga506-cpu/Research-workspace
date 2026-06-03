from app.database import db
from datetime import datetime

class VersionHistory(db.Model):
    __tablename__ = "version_history"

    id = db.Column(db.Integer, primary_key=True)
    content_snapshot = db.Column(db.Text, nullable=False)
    version_number = db.Column(db.Integer, nullable=False, default=1)
    note_id = db.Column(db.Integer, db.ForeignKey("notes.id", ondelete="CASCADE"), nullable=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    changed_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    editor = db.relationship("User", foreign_keys=[changed_by])

    def to_dict(self):
        return {
            "id": self.id,
            "content_snapshot": self.content_snapshot,
            "version_number": self.version_number,
            "note_id": self.note_id,
            "document_id": self.document_id,
            "changed_by": self.changed_by,
            "editor_name": self.editor.username if self.editor else "Unknown",
            "created_at": self.created_at.isoformat()
        }
