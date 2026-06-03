from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.comment_service import CommentService
from app.schemas import CommentCreateSchema
from app.repositories.workspace_repository import WorkspaceRepository
from app.models.comment import Comment
from app.models.note import Note
from app.models.user import User
from app.utils import success_response
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden, NotFound

comment_bp = Blueprint("comments", __name__)
comment_service = CommentService()
workspace_repo = WorkspaceRepository()

def _get_role_and_admin(user_id, workspace_id):
    """Helper: returns (ws_role, is_global_admin)"""
    user = User.query.get(user_id)
    is_global_admin = user and user.role == "admin"
    role = workspace_repo.get_user_role(user_id, workspace_id)
    return role, is_global_admin


# POST /api/comments/
# RBAC: Admin ✅  Member ✅  Viewer ❌
@comment_bp.route("/", methods=["POST"])
@jwt_required()
def create_comment():
    user_id = int(get_jwt_identity())
    try:
        data = CommentCreateSchema(**request.get_json())
    except ValidationError as e:
        raise e

    note = Note.query.get(data.note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin and role not in ("admin", "member"):
        raise Forbidden("Viewers cannot post comments")

    res = comment_service.create_comment(data.content, data.note_id, user_id)
    return success_response(res, "Comment posted successfully", 201)


# GET /api/comments/note/<note_id>
# RBAC: Admin ✅  Member ✅  Viewer ✅  (read-only for viewer)
@comment_bp.route("/note/<int:note_id>", methods=["GET"])
@jwt_required()
def get_comments(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get(note_id)
    if not note:
        raise NotFound("Note not found")

    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin and not role:
        raise Forbidden("Access denied")

    res = comment_service.get_note_comments(note_id)
    return success_response(res)


# PUT /api/comments/<comment_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@comment_bp.route("/<int:comment_id>", methods=["PUT"])
@jwt_required()
def update_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    if not comment:
        raise NotFound("Comment not found")

    note = Note.query.get(comment.note_id)
    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot edit comments")
        # Admin can edit any comment; member can only edit their own
        if role == "member" and comment.author_id != user_id:
            raise Forbidden("Members can only edit their own comments")

    body = request.get_json() or {}
    content = body.get("content", "").strip()
    if not content:
        from werkzeug.exceptions import BadRequest
        raise BadRequest("Comment content cannot be empty")

    comment.content = content
    from app.database import db
    db.session.commit()
    return success_response(comment.to_dict(), "Comment updated successfully")


# DELETE /api/comments/<comment_id>
# RBAC: Admin ✅ (any)  Member ✅ (own only)  Viewer ❌
@comment_bp.route("/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    if not comment:
        raise NotFound("Comment not found")

    note = Note.query.get(comment.note_id)
    role, is_global_admin = _get_role_and_admin(user_id, note.workspace_id)

    if not is_global_admin:
        if role not in ("admin", "member"):
            raise Forbidden("Viewers cannot delete comments")
        # Admin can delete any; member can only delete their own
        if role == "member" and comment.author_id != user_id:
            raise Forbidden("Members can only delete their own comments")

    comment_service.delete_comment(comment_id)
    return success_response(message="Comment deleted successfully")