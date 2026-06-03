from app.models.dataset import Dataset
from app.repositories.base_repository import BaseRepository

class DatasetRepository(BaseRepository):
    model = Dataset

    def get_by_workspace(self, workspace_id):
        return self.model.query.filter_by(workspace_id=workspace_id).order_by(self.model.created_at.desc()).all()
