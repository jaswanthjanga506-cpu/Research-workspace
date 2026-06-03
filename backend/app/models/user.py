from app.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False) # global roles: "admin", "user"
    avatar_url = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    owned_workspaces = db.relationship("Workspace", backref="owner", lazy=True,
                                       foreign_keys="Workspace.owner_id")
    notes = db.relationship("Note", backref="author", lazy=True, cascade="all, delete-orphan")
    documents = db.relationship("Document", backref="author", lazy=True, cascade="all, delete-orphan")
    comments = db.relationship("Comment", backref="author", lazy=True, cascade="all, delete-orphan")
    datasets = db.relationship("Dataset", backref="uploader", lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship("Notification", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == "admin"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat()
        }
