from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.dataset_service import DatasetService
from app.schemas import DatasetCreateSchema
from app.middleware.auth_middleware import require_workspace_role
from app.repositories.workspace_repository import WorkspaceRepository
from app.models.dataset import Dataset
from app.models.user import User
from app.utils import success_response
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden, NotFound

dataset_bp = Blueprint("datasets", __name__)
dataset_service = DatasetService()
workspace_repo = WorkspaceRepository()

def _get_role_and_admin(user_id, workspace_id):
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"
    role = workspace_repo.get_user_role(user_id, workspace_id)
    return role, is_global_admin


# POST /api/datasets/
# RBAC: Admin ✅  Member ✅  Viewer ❌
@dataset_bp.route("/", methods=["POST"])
@jwt_required()
def create_dataset():
    user_id = int(get_jwt_identity())
    try:
        data = DatasetCreateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    role, is_global_admin = _get_role_and_admin(user_id, data.workspace_id)

    if not is_global_admin and role not in ("admin", "member"):
        raise Forbidden("Viewers cannot add datasets")

    res = dataset_service.create_dataset(
        name=data.name,
        description=data.description,
        source_url=data.source_url,
        workspace_id=data.workspace_id,
        uploaded_by=user_id
    )
    return success_response(res, "Dataset added successfully", 201)


# GET /api/datasets/workspace/<workspace_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅
@dataset_bp.route("/workspace/<int:workspace_id>", methods=["GET"])
@require_workspace_role(["admin", "member", "viewer"])
def get_datasets(workspace_id):
    res = dataset_service.get_workspace_datasets(workspace_id)
    return success_response(res)


# GET /api/datasets/<dataset_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅
@dataset_bp.route("/<int:dataset_id>", methods=["GET"])
@jwt_required()
def get_dataset(dataset_id):
    user_id = int(get_jwt_identity())
    ds = Dataset.query.get(dataset_id)
    if not ds:
        raise NotFound("Dataset not found")

    role, is_global_admin = _get_role_and_admin(user_id, ds.workspace_id)

    if not is_global_admin and not role:
        raise Forbidden("Access denied")

    return success_response(ds.to_dict())


# PUT /api/datasets/<dataset_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@dataset_bp.route("/<int:dataset_id>", methods=["PUT"])
@jwt_required()
def update_dataset(dataset_id):
    user_id = int(get_jwt_identity())
    ds = Dataset.query.get(dataset_id)
    if not ds:
        raise NotFound("Dataset not found")

    role, is_global_admin = _get_role_and_admin(user_id, ds.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot edit datasets")
        if role == "member" and ds.uploaded_by != user_id:
            raise Forbidden("Members can only edit their own datasets")

    body = request.get_json() or {}
    if "name" in body and body["name"].strip():
        ds.name = body["name"].strip()
    if "description" in body:
        ds.description = body.get("description")
    if "source_url" in body:
        ds.source_url = body.get("source_url")

    from app.database import db
    db.session.commit()
    return success_response(ds.to_dict(), "Dataset updated successfully")


# DELETE /api/datasets/<dataset_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@dataset_bp.route("/<int:dataset_id>", methods=["DELETE"])
@jwt_required()
def delete_dataset(dataset_id):
    user_id = int(get_jwt_identity())
    ds = Dataset.query.get(dataset_id)
    if not ds:
        raise NotFound("Dataset not found")

    role, is_global_admin = _get_role_and_admin(user_id, ds.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot delete datasets")
        # Members can only delete their own datasets
        if role == "member" and ds.uploaded_by != user_id:
            raise Forbidden("Members can only delete their own datasets")

    dataset_service.delete_dataset(dataset_id)
    return success_response(message="Dataset deleted successfully")