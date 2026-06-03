from app.database import db
from datetime import datetime

class Dataset(db.Model):
    __tablename__ = "datasets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    source_url = db.Column(db.String(500), nullable=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "source_url": self.source_url,
            "workspace_id": self.workspace_id,
            "uploaded_by": self.uploaded_by,
            "uploader_name": self.uploader.username if self.uploader else "Unknown",
            "created_at": self.created_at.isoformat()
        }
