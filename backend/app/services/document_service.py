from app.repositories.document_repository import DocumentRepository
from app.repositories.version_repository import VersionRepository
from app.repositories.tag_repository import TagRepository
from app.models.document import Document
from app.models.version_history import VersionHistory
from werkzeug.exceptions import NotFound

class DocumentService:
    def __init__(self):
        self.doc_repo = DocumentRepository()
        self.version_repo = VersionRepository()
        self.tag_repo = TagRepository()

    def create_document(self, title, content, workspace_id, author_id, file_path=None):
        doc = Document(title=title, content=content, workspace_id=workspace_id, author_id=author_id, file_path=file_path)
        self.doc_repo.save(doc)
        
        # Save initial version (v1)
        initial_version = VersionHistory(
            content_snapshot=content or "",
            version_number=1,
            document_id=doc.id,
            changed_by=author_id
        )
        self.doc_repo.add(initial_version)
        self.doc_repo.commit()
        return doc.to_dict()

    def get_document(self, doc_id):
        doc = self.doc_repo.get_by_id(doc_id)
        if not doc:
            raise NotFound("Document not found")
        return doc.to_dict()

    def get_workspace_documents(self, workspace_id):
        docs = self.doc_repo.get_by_workspace(workspace_id)
        return [d.to_dict() for d in docs]

    def update_document(self, doc_id, title=None, content=None, file_path=None, user_id=None):
        doc = self.doc_repo.get_by_id(doc_id)
        if not doc:
            raise NotFound("Document not found")

        content_changed = content is not None and content != doc.content
        title_changed = title is not None and title != doc.title
        file_changed = file_path is not None and file_path != doc.file_path

        if content_changed or title_changed or file_changed:
            latest_ver = self.version_repo.get_latest_version_number("document", doc.id)
            next_ver = latest_ver + 1
            
            snapshot = VersionHistory(
                content_snapshot=doc.content or "",
                version_number=next_ver,
                document_id=doc.id,
                changed_by=user_id
            )
            self.doc_repo.add(snapshot)

        if title:
            doc.title = title
        if content is not None:
            doc.content = content
        if file_path is not None:
            doc.file_path = file_path

        self.doc_repo.commit()
        return doc.to_dict()

    def delete_document(self, doc_id):
        doc = self.doc_repo.get_by_id(doc_id)
        if not doc:
            raise NotFound("Document not found")
        self.doc_repo.delete(doc)
        self.doc_repo.commit()
        return True
