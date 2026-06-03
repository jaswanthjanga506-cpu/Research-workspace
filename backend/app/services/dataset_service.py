from app.repositories.dataset_repository import DatasetRepository
from app.models.dataset import Dataset
from werkzeug.exceptions import NotFound

class DatasetService:
    def __init__(self):
        self.dataset_repo = DatasetRepository()

    def create_dataset(self, name, description, source_url, workspace_id, uploaded_by):
        ds = Dataset(
            name=name,
            description=description,
            source_url=source_url,
            workspace_id=workspace_id,
            uploaded_by=uploaded_by
        )
        self.dataset_repo.save(ds)
        return ds.to_dict()

    def get_workspace_datasets(self, workspace_id):
        datasets = self.dataset_repo.get_by_workspace(workspace_id)
        return [ds.to_dict() for ds in datasets]

    def delete_dataset(self, dataset_id):
        ds = self.dataset_repo.get_by_id(dataset_id)
        if not ds:
            raise NotFound("Dataset not found")
        self.dataset_repo.delete(ds)
        self.dataset_repo.commit()
        return True
