from app.database import db
from datetime import datetime

# Association Table for Workspace Members
workspace_members = db.Table(
    "workspace_members",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    db.Column("workspace_id", db.Integer, db.ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True),
    db.Column("ws_role", db.String(20), nullable=False, default="member"), # ws roles: "admin", "member", "viewer"
    db.Column("joined_at", db.DateTime, default=datetime.utcnow)
)

class Workspace(db.Model):
    __tablename__ = "workspaces"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    members = db.relationship("User", secondary=workspace_members, backref=db.backref("workspaces", lazy="dynamic"))
    notes = db.relationship("Note", backref="workspace", lazy=True, cascade="all, delete-orphan")
    documents = db.relationship("Document", backref="workspace", lazy=True, cascade="all, delete-orphan")
    datasets = db.relationship("Dataset", backref="workspace", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "member_count": len(self.members)
        }
