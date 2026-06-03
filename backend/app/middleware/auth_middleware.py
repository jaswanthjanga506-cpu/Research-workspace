from functools import wraps
from flask import request, abort, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.repositories.workspace_repository import WorkspaceRepository

workspace_repo = WorkspaceRepository()

def require_platform_admin(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != "admin":
            return jsonify({"success": False, "message": "Platform admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

def require_workspace_role(allowed_roles):
    """
    Decorator to check workspace role of current user.
    allowed_roles: list/tuple of strings e.g. ["admin", "member", "viewer"]
    
    It will extract workspace_id from route kwargs (e.g. '<int:workspace_id>')
    or from the request JSON body ('workspace_id') or query parameters.
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated(*args, **kwargs):
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 401
                
            # If user is a global platform admin, bypass workspace-level checks
            if user.role == "admin":
                return f(*args, **kwargs)
            
            # Find workspace_id in arguments
            workspace_id = kwargs.get("workspace_id")
            if not workspace_id:
                # check query params
                workspace_id = request.args.get("workspace_id")
            if not workspace_id and request.is_json:
                # check json body
                body = request.get_json(silent=True) or {}
                workspace_id = body.get("workspace_id")
            
            if not workspace_id:
                return jsonify({"success": False, "message": "workspace_id parameter is required"}), 400
            
            try:
                workspace_id = int(workspace_id)
            except ValueError:
                return jsonify({"success": False, "message": "Invalid workspace_id format"}), 400

            role = workspace_repo.get_user_role(user_id, workspace_id)
            if not role or role not in allowed_roles:
                return jsonify({"success": False, "message": f"Workspace access denied. Required role: {allowed_roles}"}), 403
                
            return f(*args, **kwargs)
        return decorated
    return decorator
