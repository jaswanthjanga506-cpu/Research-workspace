from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.workspace_service import WorkspaceService
from app.schemas import WorkspaceCreateSchema, WorkspaceUpdateSchema, AddMemberSchema, ChangeRoleSchema
from app.middleware.auth_middleware import require_workspace_role
from app.utils import success_response, error_response
from app.models.user import User
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden

workspace_bp = Blueprint("workspaces", __name__)
workspace_service = WorkspaceService()

@workspace_bp.route("/", methods=["POST"])
@jwt_required()
def create_workspace():
    user_id = int(get_jwt_identity())
    try:
        data = WorkspaceCreateSchema(**request.get_json())
    except ValidationError as e:
        raise e
        
    res = workspace_service.create_workspace(data.name, data.description, user_id)
    return success_response(res, "Workspace created successfully", 201)

@workspace_bp.route("/", methods=["GET"])
@jwt_required()
def get_workspaces():
    user_id = int(get_jwt_identity())
    res = workspace_service.get_user_workspaces(user_id)
    return success_response(res)

@workspace_bp.route("/<int:workspace_id>", methods=["GET"])
@require_workspace_role(["admin", "member", "viewer"])
def get_workspace(workspace_id):
    res = workspace_service.get_workspace(workspace_id)
    return success_response(res)

@workspace_bp.route("/<int:workspace_id>", methods=["PUT"])
@require_workspace_role(["admin"])
def update_workspace(workspace_id):
    try:
        data = WorkspaceUpdateSchema(**request.get_json())
    except ValidationError as e:
        raise e
        
    res = workspace_service.update_workspace(workspace_id, data.name, data.description)
    return success_response(res, "Workspace updated successfully")

@workspace_bp.route("/<int:workspace_id>", methods=["DELETE"])
@jwt_required()
def delete_workspace(workspace_id):
    user_id = int(get_jwt_identity())
    ws_details = workspace_service.get_workspace(workspace_id)
    user = User.query.get(user_id)
    
    # Check if owner or platform admin
    if ws_details["owner_id"] != user_id and (not user or user.role != "admin"):
        raise Forbidden("Only the owner or a global administrator can delete this workspace")
        
    workspace_service.delete_workspace(workspace_id)
    return success_response(message="Workspace deleted successfully")

# ── Member management ──────────────────────────────────────────────────────────

@workspace_bp.route("/<int:workspace_id>/members", methods=["GET"])
@require_workspace_role(["admin", "member", "viewer"])
def get_members(workspace_id):
    res = workspace_service.get_members(workspace_id)
    return success_response(res)

@workspace_bp.route("/<int:workspace_id>/members", methods=["POST"])
@require_workspace_role(["admin"])
def add_member(workspace_id):
    try:
        data = AddMemberSchema(**request.get_json())
    except ValidationError as e:
        raise e
        
    res = workspace_service.add_member(workspace_id, data.email, data.ws_role)
    return success_response(res, "Member added successfully")

@workspace_bp.route("/<int:workspace_id>/members/<int:member_id>", methods=["PUT"])
@require_workspace_role(["admin"])
def change_member_role(workspace_id, member_id):
    try:
        data = ChangeRoleSchema(**request.get_json())
    except ValidationError as e:
        raise e
        
    res = workspace_service.change_member_role(workspace_id, member_id, data.ws_role)
    return success_response(res, "Role updated successfully")

@workspace_bp.route("/<int:workspace_id>/members/<int:member_id>", methods=["DELETE"])
@require_workspace_role(["admin"])
def remove_member(workspace_id, member_id):
    workspace_service.remove_member(workspace_id, member_id)
    return success_response(message="Member removed successfully")
