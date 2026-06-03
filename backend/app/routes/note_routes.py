from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.note_service import NoteService
from app.schemas import NoteCreateSchema, NoteUpdateSchema
from app.middleware.auth_middleware import require_workspace_role
from app.repositories.workspace_repository import WorkspaceRepository
from app.models.note import Note
from app.models.user import User
from app.utils import success_response
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden, NotFound

note_bp = Blueprint("notes", __name__)
note_service = NoteService()
workspace_repo = WorkspaceRepository()

def _get_role_and_admin(user_id, workspace_id):
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"
    role = workspace_repo.get_user_role(user_id, workspace_id)
    return role, is_global_admin


# POST /api/notes/
# RBAC: Admin ✅  Member ✅  Viewer ❌
@note_bp.route("/", methods=["POST"])
@jwt_required()
def create_note():
    user_id = int(get_jwt_identity())
    try:
        data = NoteCreateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    role, is_global_admin = _get_role_and_admin(user_id, data.workspace_id)

    if not is_global_admin and role not in ("admin", "member"):
        raise Forbidden("Viewers cannot create notes")

    res = note_service.create_note(data.title, data.content, data.workspace_id, user_id)
    return success_response(res, "Note created successfully", 201)


# GET /api/notes/workspace/<workspace_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅
@note_bp.route("/workspace/<int:workspace_id>", methods=["GET"])
@require_workspace_role(["admin", "member", "viewer"])
def get_notes(workspace_id):
    res = note_service.get_workspace_notes(workspace_id)
    return success_response(res)


# GET /api/notes/<note_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅
@note_bp.route("/<int:note_id>", methods=["GET"])
@jwt_required()
def get_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get(note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin and not role:
        raise Forbidden("Access denied")

    res = note_service.get_note(note_id)
    return success_response(res)


# PUT /api/notes/<note_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@note_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get(note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot edit notes")
        if role == "member" and note.author_id != user_id:
            raise Forbidden("Members can only edit their own notes")

    try:
        data = NoteUpdateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    res = note_service.update_note(note_id, data.title, data.content, user_id)
    return success_response(res, "Note updated successfully")


# DELETE /api/notes/<note_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@note_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get(note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot delete notes")
        if role == "member" and note.author_id != user_id:
            raise Forbidden("Members can only delete their own notes")

    note_service.delete_note(note_id)
    return success_response(message="Note deleted successfully")


# POST /api/notes/<note_id>/tags/<tag_id>
# RBAC: Admin ✅  Member ✅  Viewer ❌
@note_bp.route("/<int:note_id>/tags/<int:tag_id>", methods=["POST"])
@jwt_required()
def add_tag(note_id, tag_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get(note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin and role not in ("admin", "member"):
        raise Forbidden("Viewers cannot add tags")

    res = note_service.add_tag_to_note(note_id, tag_id)
    return success_response(res, "Tag linked successfully")


# DELETE /api/notes/<note_id>/tags/<tag_id>
# RBAC: Admin ✅  Member ✅ (own note only)  Viewer ❌
@note_bp.route("/<int:note_id>/tags/<int:tag_id>", methods=["DELETE"])
@jwt_required()
def remove_tag(note_id, tag_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get(note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot remove tags")
        if role == "member" and note.author_id != user_id:
            raise Forbidden("Members can only remove tags from their own notes")

    res = note_service.remove_tag_from_note(note_id, tag_id)
    return success_response(res, "Tag unlinked successfully")