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
        print("Database tables verified and created successfully.")
    app.run(debug=True, host="127.0.0.1", port=5000)
