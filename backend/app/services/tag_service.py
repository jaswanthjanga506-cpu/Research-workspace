from app.repositories.tag_repository import TagRepository
from app.models.tag import Tag
from werkzeug.exceptions import Conflict, NotFound

class TagService:
    def __init__(self):
        self.tag_repo = TagRepository()

    def create_tag(self, name):
        cleaned = name.strip().lower()
        existing = self.tag_repo.get_by_name(cleaned)
        if existing:
            raise Conflict(f"Tag '#{cleaned}' already exists")
            
        tag = Tag(name=cleaned)
        self.tag_repo.save(tag)
        return tag.to_dict()

    def get_all(self):
        tags = self.tag_repo.get_all()
        return [t.to_dict() for t in tags]

    def delete_tag(self, tag_id):
        tag = self.tag_repo.get_by_id(tag_id)
        if not tag:
            raise NotFound("Tag not found")
        self.tag_repo.delete(tag)
        self.tag_repo.commit()
        return True
