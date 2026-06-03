from app.repositories.version_repository import VersionRepository
from app.repositories.note_repository import NoteRepository
from app.repositories.document_repository import DocumentRepository
from app.models.version_history import VersionHistory
from werkzeug.exceptions import NotFound, BadRequest

class VersionService:
    def __init__(self):
        self.version_repo = VersionRepository()
        self.note_repo = NoteRepository()
        self.doc_repo = DocumentRepository()

    def get_versions(self, item_type, item_id):
        if item_type not in ("note", "document"):
            raise BadRequest("Invalid item type")
        versions = self.version_repo.get_versions_by_item(item_type, item_id)
        return [v.to_dict() for v in versions]

    def restore_version(self, item_type, item_id, version_id, user_id):
        if item_type not in ("note", "document"):
            raise BadRequest("Invalid item type")
            
        version = self.version_repo.get_by_id(version_id)
        if not version:
            raise NotFound("Version snapshot not found")
            
        # Ensure it belongs to the correct note/doc
        if item_type == "note" and version.note_id != item_id:
            raise BadRequest("Snapshot note mismatch")
        if item_type == "document" and version.document_id != item_id:
            raise BadRequest("Snapshot document mismatch")

        if item_type == "note":
            note = self.note_repo.get_by_id(item_id)
            if not note:
                raise NotFound("Note not found")
                
            # Create a snapshot of current state before reverting
            latest_ver = self.version_repo.get_latest_version_number("note", note.id)
            next_ver = latest_ver + 1
            snapshot = VersionHistory(
                content_snapshot=note.content or "",
                version_number=next_ver,
                note_id=note.id,
                changed_by=user_id
            )
            self.version_repo.add(snapshot)
            
            # Revert
            note.content = version.content_snapshot
            self.note_repo.commit()
            return note.to_dict()
            
        else: # document
            doc = self.doc_repo.get_by_id(item_id)
            if not doc:
                raise NotFound("Document not found")
                
            # Create snapshot of current state
            latest_ver = self.version_repo.get_latest_version_number("document", doc.id)
            next_ver = latest_ver + 1
            snapshot = VersionHistory(
                content_snapshot=doc.content or "",
                version_number=next_ver,
                document_id=doc.id,
                changed_by=user_id
            )
            self.version_repo.add(snapshot)
            
            # Revert
            doc.content = version.content_snapshot
            self.doc_repo.commit()
            return doc.to_dict()
Class_NoteService = None
