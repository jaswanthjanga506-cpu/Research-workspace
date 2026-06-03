from app.models.tag import Tag
from app.repositories.base_repository import BaseRepository

class TagRepository(BaseRepository):
    model = Tag

    def get_by_name(self, name):
        return self.model.query.filter_by(name=name).first()
