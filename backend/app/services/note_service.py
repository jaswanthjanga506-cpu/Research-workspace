from app.repositories.note_repository import NoteRepository
from app.repositories.version_repository import VersionRepository
from app.repositories.tag_repository import TagRepository
from app.models.note import Note
from app.models.version_history import VersionHistory
from werkzeug.exceptions import NotFound

class NoteService:
    def __init__(self):
        self.note_repo = NoteRepository()
        self.version_repo = VersionRepository()
        self.tag_repo = TagRepository()

    def create_note(self, title, content, workspace_id, author_id):
        note = Note(title=title, content=content, workspace_id=workspace_id, author_id=author_id)
        self.note_repo.save(note)
        
        # Save initial version (v1)
        initial_version = VersionHistory(
            content_snapshot=content or "",
            version_number=1,
            note_id=note.id,
            changed_by=author_id
        )
        db_session = self.note_repo.add(initial_version)
        self.note_repo.commit()
        return note.to_dict()

    def get_note(self, note_id):
        note = self.note_repo.get_by_id(note_id)
        if not note:
            raise NotFound("Note not found")
        return note.to_dict()

    def get_workspace_notes(self, workspace_id):
        notes = self.note_repo.get_by_workspace(workspace_id)
        return [n.to_dict() for n in notes]

    def update_note(self, note_id, title=None, content=None, user_id=None):
        note = self.note_repo.get_by_id(note_id)
        if not note:
            raise NotFound("Note not found")

        content_changed = content is not None and content != note.content
        title_changed = title is not None and title != note.title

        if content_changed or title_changed:
            # Determine next version number
            latest_ver = self.version_repo.get_latest_version_number("note", note.id)
            next_ver = latest_ver + 1
            
            # Save the current state BEFORE updating as a snapshot in version history
            snapshot = VersionHistory(
                content_snapshot=note.content or "",
                version_number=next_ver,
                note_id=note.id,
                changed_by=user_id
            )
            self.note_repo.add(snapshot)

        if title:
            note.title = title
        if content is not None:
            note.content = content

        self.note_repo.commit()
        return note.to_dict()

    def delete_note(self, note_id):
        note = self.note_repo.get_by_id(note_id)
        if not note:
            raise NotFound("Note not found")
        self.note_repo.delete(note)
        self.note_repo.commit()
        return True

    def add_tag_to_note(self, note_id, tag_id):
        note = self.note_repo.get_by_id(note_id)
        if not note:
            raise NotFound("Note not found")
        tag = self.tag_repo.get_by_id(tag_id)
        if not tag:
            raise NotFound("Tag not found")
            
        if tag not in note.tags:
            note.tags.append(tag)
            self.note_repo.commit()
        return note.to_dict()

    def remove_tag_from_note(self, note_id, tag_id):
        note = self.note_repo.get_by_id(note_id)
        if not note:
            raise NotFound("Note not found")
        tag = self.tag_repo.get_by_id(tag_id)
        if not tag:
            raise NotFound("Tag not found")
            
        if tag in note.tags:
            note.tags.remove(tag)
            self.note_repo.commit()
        return note.to_dict()
