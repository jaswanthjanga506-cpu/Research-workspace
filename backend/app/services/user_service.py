from app.repositories.user_repository import UserRepository
from app.models.user import User
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.exceptions import Conflict, BadRequest, NotFound

class UserService:
    def __init__(self):
        self.user_repo = UserRepository()

    def register(self, username, email, password, role="user"):
        if self.user_repo.get_by_email(email):
            raise Conflict("Email already registered")
        if self.user_repo.get_by_username(username):
            raise Conflict("Username already taken")
            
        user = User(username=username, email=email, role=role)
        user.set_password(password)
        
        self.user_repo.save(user)
        return user.to_dict()

    def login(self, email, password):
        user = self.user_repo.get_by_email(email)
        if not user or not user.check_password(password):
            raise BadRequest("Invalid email or password")
            
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }

    def get_profile(self, user_id):
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFound("User not found")
        return user.to_dict()

    def update_profile(self, user_id, username=None, password=None, avatar_url=None):
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFound("User not found")
            
        if username:
            existing = self.user_repo.get_by_username(username)
            if existing and existing.id != user_id:
                raise Conflict("Username already taken")
            user.username = username
            
        if password:
            user.set_password(password)
            
        if avatar_url is not None:
            user.avatar_url = avatar_url
            
        self.user_repo.commit()
        return user.to_dict()

    def get_all_users(self):
        users = self.user_repo.get_all()
        return [u.to_dict() for u in users]

    def update_global_role(self, user_id, role):
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFound("User not found")
        if role not in ("admin", "user"):
            raise BadRequest("Invalid role")
        user.role = role
        self.user_repo.commit()
        return user.to_dict()
