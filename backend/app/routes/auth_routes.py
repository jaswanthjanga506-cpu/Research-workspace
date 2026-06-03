from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.services.user_service import UserService
from app.schemas import RegisterSchema, LoginSchema, ProfileUpdateSchema
from app.utils import success_response, error_response
from pydantic import ValidationError

auth_bp = Blueprint("auth", __name__)
user_service = UserService()

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = RegisterSchema(**request.get_json())
    except ValidationError as e:
        raise e # Handled by global error handler
        
    res = user_service.register(data.username, data.email, data.password, data.role)
    return success_response(res, "User registered successfully", 201)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = LoginSchema(**request.get_json())
    except ValidationError as e:
        raise e
        
    res = user_service.login(data.email, data.password)
    return success_response(res, "Login successful")

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)
    return success_response({"access_token": new_access_token}, "Token refreshed")

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    profile = user_service.get_profile(user_id)
    return success_response(profile)

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    try:
        data = ProfileUpdateSchema(**request.get_json())
    except ValidationError as e:
        raise e
        
    profile = user_service.update_profile(
        user_id=user_id,
        username=data.username,
        password=data.password,
        avatar_url=data.avatar_url
    )
    return success_response(profile, "Profile updated successfully")
