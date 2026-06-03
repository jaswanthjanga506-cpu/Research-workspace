from pydantic import BaseModel, field_validator, EmailStr
from typing import Optional, Literal

# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Literal["user", "admin"] = "user"

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("username")
    @classmethod
    def username_length(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateSchema(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

# ── Workspace ─────────────────────────────────────────────────────────────────
class WorkspaceCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_length(cls, v):
        if not v.strip():
            raise ValueError("Workspace name cannot be empty")
        return v

class WorkspaceUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# ── Member management ─────────────────────────────────────────────────────────
class AddMemberSchema(BaseModel):
    email: EmailStr
    ws_role: Literal["admin", "member", "viewer"] = "member"

class ChangeRoleSchema(BaseModel):
    ws_role: Literal["admin", "member", "viewer"]

# ── Note ──────────────────────────────────────────────────────────────────────
class NoteCreateSchema(BaseModel):
    title: str
    content: Optional[str] = ""
    workspace_id: int

    @field_validator("title")
    @classmethod
    def title_length(cls, v):
        if not v.strip():
            raise ValueError("Note title cannot be empty")
        return v

class NoteUpdateSchema(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

# ── Document ──────────────────────────────────────────────────────────────────
class DocumentCreateSchema(BaseModel):
    title: str
    content: Optional[str] = ""
    file_path: Optional[str] = None
    workspace_id: int

    @field_validator("title")
    @classmethod
    def title_length(cls, v):
        if not v.strip():
            raise ValueError("Document title cannot be empty")
        return v

class DocumentUpdateSchema(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    file_path: Optional[str] = None

# ── Tag ───────────────────────────────────────────────────────────────────────
class TagCreateSchema(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def clean_name(cls, v):
        cleaned = v.strip().lower()
        if not cleaned:
            raise ValueError("Tag name cannot be empty")
        return cleaned

# ── Comment ───────────────────────────────────────────────────────────────────
class CommentCreateSchema(BaseModel):
    content: str
    note_id: int

    @field_validator("content")
    @classmethod
    def clean_content(cls, v):
        if not v.strip():
            raise ValueError("Comment content cannot be empty")
        return v

# ── Dataset ───────────────────────────────────────────────────────────────────
class DatasetCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    workspace_id: int

    @field_validator("name")
    @classmethod
    def name_length(cls, v):
        if not v.strip():
            raise ValueError("Dataset name cannot be empty")
        return v
