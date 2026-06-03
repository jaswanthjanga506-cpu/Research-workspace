from app.models.document import Document
from app.repositories.base_repository import BaseRepository

class DocumentRepository(BaseRepository):
    model = Document

    def get_by_workspace(self, workspace_id):
        return self.model.query.filter_by(workspace_id=workspace_id).order_by(self.model.updated_at.desc()).all()

    def search_in_workspace(self, workspace_id, query):
        q = f"%{query}%"
        return self.model.query.filter(
            self.model.workspace_id == workspace_id,
            (self.model.title.like(q) | self.model.content.like(q))
        ).all()

    def search_globally(self, user_workspace_ids, query):
        if not user_workspace_ids:
            return []
        q = f"%{query}%"
        return self.model.query.filter(
            self.model.workspace_id.in_(user_workspace_ids),
            (self.model.title.like(q) | self.model.content.like(q))
        ).all()
