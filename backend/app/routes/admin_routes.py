from flask import Blueprint, request
from app.services.user_service import UserService
from app.repositories.workspace_repository import WorkspaceRepository
from app.middleware.auth_middleware import require_platform_admin
from app.utils import success_response, error_response

admin_bp = Blueprint("admin", __name__)
user_service = UserService()
workspace_repo = WorkspaceRepository()

@admin_bp.route("/users", methods=["GET"])
@require_platform_admin
def get_users():
    res = user_service.get_all_users()
    return success_response(res)

@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@require_platform_admin
def update_user_role(user_id):
    body = request.get_json() or {}
    role = body.get("role")
    if not role or role not in ("admin", "user"):
        return error_response("Invalid role. Must be 'admin' or 'user'")
        
    res = user_service.update_global_role(user_id, role)
    return success_response(res, "Global role updated successfully")

@admin_bp.route("/workspaces", methods=["GET"])
@require_platform_admin
def get_all_workspaces():
    workspaces = workspace_repo.get_all()
    return success_response([ws.to_dict() for ws in workspaces])
