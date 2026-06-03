from app.models.notification import Notification
from app.repositories.base_repository import BaseRepository

class NotificationRepository(BaseRepository):
    model = Notification

    def get_all_by_user(self, user_id):
        return self.model.query.filter_by(user_id=user_id).order_by(self.model.created_at.desc()).all()

    def get_unread_by_user(self, user_id):
        return self.model.query.filter_by(user_id=user_id, is_read=False).order_by(self.model.created_at.desc()).all()
