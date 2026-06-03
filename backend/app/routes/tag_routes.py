from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.tag_service import TagService
from app.schemas import TagCreateSchema
from app.repositories.workspace_repository import WorkspaceRepository
from app.models.user import User
from app.utils import success_response
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden

tag_bp = Blueprint("tags", __name__)
tag_service = TagService()
workspace_repo = WorkspaceRepository()

def _resolve_workspace_role(user_id, workspace_id):
    """Returns (ws_role, is_global_admin) for a given user + workspace."""
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"
    role = workspace_repo.get_user_role(user_id, workspace_id) if workspace_id else None
    return role, is_global_admin


# POST /api/tags/
# RBAC: Admin ✅  Member ✅  Viewer ❌
# workspace_id must be provided in the body so we can check membership
@tag_bp.route("/", methods=["POST"])
@jwt_required()
def create_tag():
    user_id = int(get_jwt_identity())
    try:
        data = TagCreateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    # Tags are global but creation requires at least member role in the
    # workspace provided (or global admin). workspace_id is optional for
    # backwards compat — if absent, only global admins may create tags.
    body = request.get_json(silent=True) or {}
    workspace_id = body.get("workspace_id")

    role, is_global_admin = _resolve_workspace_role(user_id, workspace_id)

    if not is_global_admin:
        if not workspace_id:
            raise Forbidden("workspace_id required to create tags")
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot create tags")

    res = tag_service.create_tag(data.name)
    return success_response(res, "Tag created successfully", 201)


# GET /api/tags/
# RBAC: All authenticated users — tags are global/read-only for everyone
@tag_bp.route("/", methods=["GET"])
@jwt_required()
def get_tags():
    res = tag_service.get_all()
    return success_response(res)


# DELETE /api/tags/<tag_id>
# RBAC: Admin ✅  Member ❌  Viewer ❌
# workspace_id required in query params or body to verify admin role
@tag_bp.route("/<int:tag_id>", methods=["DELETE"])
@jwt_required()
def delete_tag(tag_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"

    # Global platform admin can always delete
    if not is_global_admin:
        # Check workspace-level admin role
        workspace_id = request.args.get("workspace_id")
        if not workspace_id:
            body = request.get_json(silent=True) or {}
            workspace_id = body.get("workspace_id")

        if not workspace_id:
            raise Forbidden("workspace_id required. Only workspace admins can delete tags")

        try:
            workspace_id = int(workspace_id)
        except (ValueError, TypeError):
            raise Forbidden("Invalid workspace_id")

        role = workspace_repo.get_user_role(user_id, workspace_id)
        if role != "admin":
            raise Forbidden("Only workspace admins can delete tags")

    tag_service.delete_tag(tag_id)
    return success_response(message="Tag deleted successfully")