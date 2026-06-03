from app.repositories.notification_repository import NotificationRepository
from app.models.notification import Notification
from werkzeug.exceptions import NotFound, Forbidden

class NotificationService:
    def __init__(self):
        self.notif_repo = NotificationRepository()

    def create_notification(self, user_id, message, notification_type, entity_id=None):
        notif = Notification(
            user_id=user_id,
            message=message,
            notification_type=notification_type,
            entity_id=entity_id
        )
        self.notif_repo.save(notif)
        return notif.to_dict()

    def get_by_user(self, user_id, unread_only=False):
        if unread_only:
            notifs = self.notif_repo.get_unread_by_user(user_id)
        else:
            notifs = self.notif_repo.get_all_by_user(user_id)
        return [n.to_dict() for n in notifs]

    def mark_as_read(self, notification_id, user_id):
        notif = self.notif_repo.get_by_id(notification_id)
        if not notif:
            raise NotFound("Notification not found")
        if notif.user_id != user_id:
            raise Forbidden("Access denied")
            
        notif.is_read = True
        self.notif_repo.commit()
        return notif.to_dict()

    def mark_all_read(self, user_id):
        unread = self.notif_repo.get_unread_by_user(user_id)
        for notif in unread:
            notif.is_read = True
        self.notif_repo.commit()
        return True
