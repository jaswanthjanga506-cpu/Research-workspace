from app.repositories.comment_repository import CommentRepository
from app.repositories.note_repository import NoteRepository
from app.models.comment import Comment
from app.services.notification_service import NotificationService
from werkzeug.exceptions import NotFound

class CommentService:
    def __init__(self):
        self.comment_repo = CommentRepository()
        self.note_repo = NoteRepository()
        self.notif_service = NotificationService()

    def create_comment(self, content, note_id, author_id):
        note = self.note_repo.get_by_id(note_id)
        if not note:
            raise NotFound("Note not found")
            
        comment = Comment(content=content, note_id=note_id, author_id=author_id)
        self.comment_repo.save(comment)
        
        # Trigger notification to note author, unless author is commenting on their own note
        if note.author_id != author_id:
            self.notif_service.create_notification(
                user_id=note.author_id,
                message=f"Someone commented on your note '{note.title}'",
                notification_type="new_comment",
                entity_id=note.id
            )
            
        return comment.to_dict()

    def get_note_comments(self, note_id):
        comments = self.comment_repo.get_by_note(note_id)
        return [c.to_dict() for c in comments]

    def delete_comment(self, comment_id):
        comment = self.comment_repo.get_by_id(comment_id)
        if not comment:
            raise NotFound("Comment not found")
        self.comment_repo.delete(comment)
        self.comment_repo.commit()
        return True
