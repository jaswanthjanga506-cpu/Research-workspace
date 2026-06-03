from app.models.user import User
from app.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository):
    model = User

    def get_by_email(self, email):
        return self.model.query.filter_by(email=email).first()

    def get_by_username(self, username):
        return self.model.query.filter_by(username=username).first()
