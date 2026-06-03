from flask import Blueprint, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.document_service import DocumentService
from app.schemas import DocumentCreateSchema, DocumentUpdateSchema
from app.middleware.auth_middleware import require_workspace_role
from app.repositories.workspace_repository import WorkspaceRepository
from app.models.document import Document
from app.models.user import User
from app.utils import success_response
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden, NotFound

document_bp = Blueprint("documents", __name__)
doc_service = DocumentService()
workspace_repo = WorkspaceRepository()

def _get_role_and_admin(user_id, workspace_id):
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"
    role = workspace_repo.get_user_role(user_id, workspace_id)
    return role, is_global_admin


# POST /api/documents/
# RBAC: Admin ✅  Member ✅  Viewer ❌
@document_bp.route("/", methods=["POST"])
@jwt_required()
def create_document():
    user_id = int(get_jwt_identity())
    try:
        data = DocumentCreateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    role, is_global_admin = _get_role_and_admin(user_id, data.workspace_id)

    if not is_global_admin and role not in ("admin", "member"):
        raise Forbidden("Viewers cannot upload documents")

    res = doc_service.create_document(data.title, data.content, data.workspace_id, user_id, data.file_path)
    return success_response(res, "Document created successfully", 201)


# GET /api/documents/workspace/<workspace_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅
@document_bp.route("/workspace/<int:workspace_id>", methods=["GET"])
@require_workspace_role(["admin", "member", "viewer"])
def get_documents(workspace_id):
    res = doc_service.get_workspace_documents(workspace_id)
    return success_response(res)


# GET /api/documents/<document_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅
@document_bp.route("/<int:document_id>", methods=["GET"])
@jwt_required()
def get_document(document_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.get(document_id)
    if not doc:
        raise NotFound("Document not found")

    role, is_global_admin = _get_role_and_admin(user_id, doc.workspace_id)

    if not is_global_admin and not role:
        raise Forbidden("Access denied")

    res = doc_service.get_document(document_id)
    return success_response(res)


# PUT /api/documents/<document_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@document_bp.route("/<int:document_id>", methods=["PUT"])
@jwt_required()
def update_document(document_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.get(document_id)
    if not doc:
        raise NotFound("Document not found")

    role, is_global_admin = _get_role_and_admin(user_id, doc.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot edit documents")
        if role == "member" and doc.author_id != user_id:
            raise Forbidden("Members can only edit their own documents")

    try:
        data = DocumentUpdateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    res = doc_service.update_document(document_id, data.title, data.content, data.file_path, user_id)
    return success_response(res, "Document updated successfully")


# DELETE /api/documents/<document_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@document_bp.route("/<int:document_id>", methods=["DELETE"])
@jwt_required()
def delete_document(document_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.get(document_id)
    if not doc:
        raise NotFound("Document not found")

    role, is_global_admin = _get_role_and_admin(user_id, doc.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot delete documents")
        if role == "member" and doc.author_id != user_id:
            raise Forbidden("Members can only delete their own documents")

    doc_service.delete_document(document_id)
    return success_response(message="Document deleted successfully")


# GET /api/documents/<document_id>/download
# RBAC: Admin ✅  Member ✅  Viewer ✅  (read-only download)
@document_bp.route("/<int:document_id>/download", methods=["GET"])
@jwt_required()
def download_document(document_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.get(document_id)
    if not doc:
        raise NotFound("Document not found")

    role, is_global_admin = _get_role_and_admin(user_id, doc.workspace_id)

    if not is_global_admin and not role:
        raise Forbidden("Access denied")

    filename = f"{doc.title.replace(' ', '_')}.md"
    return Response(
        doc.content or "",
        mimetype="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )