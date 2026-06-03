from app.database import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False) # "member_added", "role_updated", "new_comment"
    entity_id = db.Column(db.Integer, nullable=True) # ID of workspace or note, if applicable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "is_read": self.is_read,
            "notification_type": self.notification_type,
            "entity_id": self.entity_id,
            "created_at": self.created_at.isoformat()
        }
