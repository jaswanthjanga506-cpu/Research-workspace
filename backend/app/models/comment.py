from app.database import db
from datetime import datetime

class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "note_id": self.note_id,
            "author_id": self.author_id,
            "author_name": self.author.username if self.author else "Unknown",
            "created_at": self.created_at.isoformat()
        }
