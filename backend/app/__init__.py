import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from app.database import db
from app.middleware.error_handler import init_error_handlers

migrate = Migrate()
jwt = JWTManager()

def create_app(config_class="app.config.Config"):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, supports_credentials=True)

    # Initialize DB & extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Ensure directories exist
    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)

    # Global Exception Handling
    init_error_handlers(app)

    # Register blueprints
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

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(workspace_bp, url_prefix="/api/workspaces")
    app.register_blueprint(note_bp, url_prefix="/api/notes")
    app.register_blueprint(document_bp, url_prefix="/api/documents")
    app.register_blueprint(tag_bp, url_prefix="/api/tags")
    app.register_blueprint(comment_bp, url_prefix="/api/comments")
    app.register_blueprint(dataset_bp, url_prefix="/api/datasets")
    app.register_blueprint(version_bp, url_prefix="/api/versions")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app
