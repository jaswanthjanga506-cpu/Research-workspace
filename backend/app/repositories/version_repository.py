from app.models.version_history import VersionHistory
from app.repositories.base_repository import BaseRepository

class VersionRepository(BaseRepository):
    model = VersionHistory

    def get_versions_by_item(self, item_type, item_id):
        if item_type == "note":
            return self.model.query.filter_by(note_id=item_id).order_by(self.model.version_number.desc()).all()
        elif item_type == "document":
            return self.model.query.filter_by(document_id=item_id).order_by(self.model.version_number.desc()).all()
        return []

    def get_latest_version_number(self, item_type, item_id):
        if item_type == "note":
            latest = self.model.query.filter_by(note_id=item_id).order_by(self.model.version_number.desc()).first()
        elif item_type == "document":
            latest = self.model.query.filter_by(document_id=item_id).order_by(self.model.version_number.desc()).first()
        else:
            latest = None
        return latest.version_number if latest else 0
