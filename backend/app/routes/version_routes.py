from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.version_service import VersionService
from app.repositories.workspace_repository import WorkspaceRepository
from app.models.note import Note
from app.models.document import Document
from app.models.user import User
from app.utils import success_response
from werkzeug.exceptions import Forbidden, NotFound, BadRequest

version_bp = Blueprint("versions", __name__)
version_service = VersionService()
workspace_repo = WorkspaceRepository()

def _resolve_item(item_type, item_id):
    """Fetch note or document; raise 400/404 if invalid."""
    if item_type == "note":
        item = Note.query.get(item_id)
    elif item_type == "document":
        item = Document.query.get(item_id)
    else:
        raise BadRequest("Invalid item type. Must be 'note' or 'document'")
    if not item:
        raise NotFound(f"{item_type.capitalize()} not found")
    return item

def _get_role_and_admin(user_id, workspace_id):
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"
    role = workspace_repo.get_user_role(user_id, workspace_id)
    return role, is_global_admin


# GET /api/versions/<item_type>/<item_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅  (read-only)
@version_bp.route("/<string:item_type>/<int:item_id>", methods=["GET"])
@jwt_required()
def get_versions(item_type, item_id):
    user_id = int(get_jwt_identity())
    item = _resolve_item(item_type, item_id)
    role, is_global_admin = _get_role_and_admin(user_id, item.workspace_id)

    # Any workspace member (including viewer) can read version history
    if not is_global_admin and not role:
        raise Forbidden("Access denied")

    res = version_service.get_versions(item_type, item_id)
    return success_response(res)


# POST /api/versions/<item_type>/<item_id>/restore/<version_id>
# RBAC: Admin ✅ (any item)  Member ❌  Viewer ❌
# Per spec: only admins may restore versions
@version_bp.route("/<string:item_type>/<int:item_id>/restore/<int:version_id>", methods=["POST"])
@jwt_required()
def restore_version(item_type, item_id, version_id):
    user_id = int(get_jwt_identity())
    item = _resolve_item(item_type, item_id)
    role, is_global_admin = _get_role_and_admin(user_id, item.workspace_id)

    if not is_global_admin:
        # Only workspace-level admins can restore versions
        if role != "admin":
            raise Forbidden("Only workspace admins can restore versions")

    res = version_service.restore_version(item_type, item_id, version_id, user_id)
    return success_response(res, f"{item_type.capitalize()} restored to selected version")