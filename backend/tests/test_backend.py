import json
from app.models.user import User
from app.models.workspace import Workspace
from app.models.note import Note
from app.models.tag import Tag
from app.models.comment import Comment
from app.models.dataset import Dataset
from app.models.version_history import VersionHistory

def test_register_and_login(client):
    # Register
    res = client.post("/api/auth/register", json={
        "username": "tester",
        "email": "tester@test.com",
        "password": "password123"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["username"] == "tester"
    
    # Login
    res = client.post("/api/auth/login", json={
        "email": "tester@test.com",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["user"]["username"] == "tester"

def test_workspace_crud_and_members(client, auth_headers):
    # Setup users
    user1 = User(username="user1", email="user1@test.com")
    user1.set_password("pass123")
    user2 = User(username="user2", email="user2@test.com")
    user2.set_password("pass123")
    from app.database import db
    db.session.add_all([user1, user2])
    db.session.commit()
    
    h1 = auth_headers(user1.id)
    h2 = auth_headers(user2.id)
    
    # Create workspace
    res = client.post("/api/workspaces/", json={
        "name": "Math Research",
        "description": "Calculus studies"
    }, headers=h1)
    assert res.status_code == 201
    ws = res.get_json()["data"]
    assert ws["name"] == "Math Research"
    ws_id = ws["id"]
    
    # Add member
    res = client.post(f"/api/workspaces/{ws_id}/members", json={
        "email": "user2@test.com",
        "ws_role": "viewer"
    }, headers=h1)
    assert res.status_code == 200
    assert res.get_json()["data"]["ws_role"] == "viewer"
    
    # List members
    res = client.get(f"/api/workspaces/{ws_id}/members", headers=h1)
    assert res.status_code == 200
    members = res.get_json()["data"]
    assert len(members) == 2
    
    # Check viewer permission (can read, cannot write)
    res = client.post("/api/notes/", json={
        "title": "Calculus notes",
        "content": "Limits and derivatives",
        "workspace_id": ws_id
    }, headers=h2)
    assert res.status_code == 403 # Viewer cannot create notes!

def test_note_crud_and_versioning(client, auth_headers):
    user = User(username="writer", email="writer@test.com")
    user.set_password("pass123")
    from app.database import db
    db.session.add(user)
    db.session.commit()
    
    h = auth_headers(user.id)
    
    # Create workspace
    res = client.post("/api/workspaces/", json={"name": "Physics Labs"}, headers=h)
    ws_id = res.get_json()["data"]["id"]
    
    # Create note (v1 auto saved)
    res = client.post("/api/notes/", json={
        "title": "Quantum Mechanics",
        "content": "Planck constant is h.",
        "workspace_id": ws_id
    }, headers=h)
    assert res.status_code == 201
    note_id = res.get_json()["data"]["id"]
    
    # Edit note (creates a version history entry of v1 content)
    res = client.put(f"/api/notes/{note_id}", json={
        "title": "Quantum Mechanics Revised",
        "content": "Planck constant is 6.626e-34 J s."
    }, headers=h)
    assert res.status_code == 200
    
    # Get versions
    res = client.get(f"/api/versions/note/{note_id}", headers=h)
    assert res.status_code == 200
    versions = res.get_json()["data"]
    # We should have v1 (initial save) and v2 (snapshot created before the update)
    assert len(versions) >= 2
    v1_id = versions[-1]["id"] # oldest version
    
    # Restore note
    res = client.post(f"/api/versions/note/{note_id}/restore/{v1_id}", headers=h)
    assert res.status_code == 200
    assert res.get_json()["data"]["content"] == "Planck constant is h."

def test_comments_and_tags(client, auth_headers):
    user = User(username="comm", email="comm@test.com")
    user.set_password("pass123")
    from app.database import db
    db.session.add(user)
    db.session.commit()
    
    h = auth_headers(user.id)
    
    # Create workspace
    res = client.post("/api/workspaces/", json={"name": "Chemistry"}, headers=h)
    ws_id = res.get_json()["data"]["id"]
    
    # Create note
    res = client.post("/api/notes/", json={
        "title": "Organic Chemistry",
        "content": "Benzene ring structure",
        "workspace_id": ws_id
    }, headers=h)
    note_id = res.get_json()["data"]["id"]
    
    # Create tag
    res = client.post("/api/tags/", json={"name": "chemistry"}, headers=h)
    assert res.status_code == 201
    tag_id = res.get_json()["data"]["id"]
    
    # Bind tag
    res = client.post(f"/api/notes/{note_id}/tags/{tag_id}", headers=h)
    assert res.status_code == 200
    assert len(res.get_json()["data"]["tags"]) == 1
    
    # Comment
    res = client.post("/api/comments/", json={
        "content": "This ring has resonance.",
        "note_id": note_id
    }, headers=h)
    assert res.status_code == 201
    
    # List comments
    res = client.get(f"/api/comments/note/{note_id}", headers=h)
    assert res.status_code == 200
    assert len(res.get_json()["data"]) == 1

def test_datasets(client, auth_headers):
    user = User(username="datauser", email="datauser@test.com")
    user.set_password("pass123")
    from app.database import db
    db.session.add(user)
    db.session.commit()
    
    h = auth_headers(user.id)
    
    # Create workspace
    res = client.post("/api/workspaces/", json={"name": "Data Lab"}, headers=h)
    ws_id = res.get_json()["data"]["id"]
    
    # Create dataset
    res = client.post("/api/datasets/", json={
        "name": "Genomics RNA Data",
        "description": "Expression rates",
        "source_url": "https://data.gov/rna.csv",
        "workspace_id": ws_id
    }, headers=h)
    assert res.status_code == 201
    ds_id = res.get_json()["data"]["id"]
    
    # List datasets
    res = client.get(f"/api/datasets/workspace/{ws_id}", headers=h)
    assert res.status_code == 200
    assert len(res.get_json()["data"]) == 1
    
    # Delete dataset
    res = client.delete(f"/api/datasets/{ds_id}", headers=h)
    assert res.status_code == 200
