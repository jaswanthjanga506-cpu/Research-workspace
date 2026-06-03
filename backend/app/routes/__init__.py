from app.routes.auth_routes import auth_bp
from app.routes.workspace_routes import workspace_bp
from app.routes.note_routes import note_bp
from app.routes.document_routes import document_bp
from app.routes.tag_routes import tag_bp
from app.routes.comment_routes import comment_bp
from app.routes.dataset_routes import dataset_bp
from app.routes.version_routes import version_bp
from app.routes.dashboard_routes import dashboard_bp
from app.routes.admin_routes import admin_bp

__all__ = [
    "auth_bp",
    "workspace_bp",
    "note_bp",
    "document_bp",
    "tag_bp",
    "comment_bp",
    "dataset_bp",
    "version_bp",
    "dashboard_bp",
    "admin_bp"
]
