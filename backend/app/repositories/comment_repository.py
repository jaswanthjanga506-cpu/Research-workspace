from app.models.comment import Comment
from app.repositories.base_repository import BaseRepository

class CommentRepository(BaseRepository):
    model = Comment

    def get_by_note(self, note_id):
        return self.model.query.filter_by(note_id=note_id).order_by(self.model.created_at.asc()).all()
