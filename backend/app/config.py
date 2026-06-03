import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "..", "instance")

os.makedirs(INSTANCE_DIR, exist_ok=True)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "nexus-super-secret-key-123")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "nexus-jwt-secret-key-456")

    SQLALCHEMY_DATABASE_URI = (
        f"sqlite:///{os.path.join(INSTANCE_DIR, 'nexus.db')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_MINUTES", "60"))
    )

    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_DAYS", "30"))
    )

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024