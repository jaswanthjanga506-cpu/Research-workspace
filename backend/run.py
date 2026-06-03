import os
from app import create_app, db
from app.models import User, Workspace, Note, Document, Tag, Comment, VersionHistory, Dataset, Notification

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "User": User,
        "Workspace": Workspace,
        "Note": Note,
        "Document": Document,
        "Tag": Tag,
        "Comment": Comment,
        "VersionHistory": VersionHistory,
        "Dataset": Dataset,
        "Notification": Notification
    }

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database tables verified.")
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)