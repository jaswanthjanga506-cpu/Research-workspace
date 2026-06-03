import pytest
from app import create_app, db
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    # Setup test app
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-jwt-secret-key",
        "SECRET_KEY": "test-secret-key"
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(app):
    def _headers(user_id):
        with app.app_context():
            token = create_access_token(identity=str(user_id))
            return {"Authorization": f"Bearer {token}"}
    return _headers
