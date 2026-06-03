from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.notification_service import NotificationService
from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.note_repository import NoteRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.dataset_repository import DatasetRepository
from app.utils import success_response, error_response

dashboard_bp = Blueprint("dashboard", __name__)
notif_service = NotificationService()
workspace_repo = WorkspaceRepository()
note_repo = NoteRepository()
doc_repo = DocumentRepository()
dataset_repo = DatasetRepository()

@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    
    # User's workspaces
    workspaces = workspace_repo.get_user_workspaces(user_id)
    ws_ids = [w.id for w in workspaces]
    
    # Accumulate counts
    notes_count = 0
    docs_count = 0
    datasets_count = 0
    
    for ws_id in ws_ids:
        notes_count += len(note_repo.get_by_workspace(ws_id))
        docs_count += len(doc_repo.get_by_workspace(ws_id))
        datasets_count += len(dataset_repo.get_by_workspace(ws_id))
        
    return success_response({
        "workspaces_count": len(workspaces),
        "notes_count": notes_count,
        "documents_count": docs_count,
        "datasets_count": datasets_count
    })

@dashboard_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    unread_only = request.args.get("unread", "false").lower() == "true"
    res = notif_service.get_by_user(user_id, unread_only=unread_only)
    return success_response(res)

@dashboard_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    res = notif_service.mark_as_read(notification_id, user_id)
    return success_response(res, "Notification marked as read")

@dashboard_bp.route("/notifications/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    notif_service.mark_all_read(user_id)
    return success_response(message="All notifications marked as read")

@dashboard_bp.route("/search", methods=["GET"])
@jwt_required()
def search():
    user_id = int(get_jwt_identity())
    query = request.args.get("q", "").strip()
    workspace_id = request.args.get("workspace_id")
    
    if not query:
        return success_response({"notes": [], "documents": []})
        
    if workspace_id:
        try:
            workspace_id = int(workspace_id)
        except ValueError:
            return error_response("Invalid workspace_id format")
            
        # Verify access
        role = workspace_repo.get_user_role(user_id, workspace_id)
        if not role:
            return error_response("Access denied to workspace", 403)
            
        notes = note_repo.search_in_workspace(workspace_id, query)
        docs = doc_repo.search_in_workspace(workspace_id, query)
    else:
        # Global search
        workspaces = workspace_repo.get_user_workspaces(user_id)
        ws_ids = [w.id for w in workspaces]
        
        notes = note_repo.search_globally(ws_ids, query) if ws_ids else []
        docs = doc_repo.search_globally(ws_ids, query) if ws_ids else []
        
    return success_response({
        "notes": [n.to_dict() for n in notes],
        "documents": [d.to_dict() for d in docs]
    })
