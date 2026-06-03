from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.user_repository import UserRepository
from app.models.workspace import Workspace
from app.services.notification_service import NotificationService
from werkzeug.exceptions import NotFound, Conflict, BadRequest, Forbidden

class WorkspaceService:
    def __init__(self):
        self.workspace_repo = WorkspaceRepository()
        self.user_repo = UserRepository()
        self.notif_service = NotificationService()

    def create_workspace(self, name, description, owner_id):
        ws = Workspace(name=name, description=description, owner_id=owner_id)
        self.workspace_repo.add(ws)
        self.workspace_repo.commit()
        
        # Creator automatically becomes workspace admin
        self.workspace_repo.add_member(owner_id, ws.id, "admin")
        
        # Create notification for owner
        self.notif_service.create_notification(
            user_id=owner_id,
            message=f"You created workspace '{name}'",
            notification_type="member_added",
            entity_id=ws.id
        )
        return ws.to_dict()

    def get_workspace(self, workspace_id):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
        return ws.to_dict()

    def update_workspace(self, workspace_id, name=None, description=None):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
            
        if name:
            ws.name = name
        if description is not None:
            ws.description = description
            
        self.workspace_repo.commit()
        return ws.to_dict()

    def delete_workspace(self, workspace_id):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
            
        # Send notifications to members before deleting
        members = self.workspace_repo.get_members(workspace_id)
        for m in members:
            self.notif_service.create_notification(
                user_id=m["id"],
                message=f"Workspace '{ws.name}' has been deleted by its owner.",
                notification_type="role_updated",
                entity_id=workspace_id
            )
            
        self.workspace_repo.delete(ws)
        self.workspace_repo.commit()
        return True

    def get_user_workspaces(self, user_id):
        workspaces = self.workspace_repo.get_user_workspaces(user_id)
        return [ws.to_dict() for ws in workspaces]

    def add_member(self, workspace_id, email, ws_role="member"):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
            
        new_user = self.user_repo.get_by_email(email)
        if not new_user:
            raise NotFound("No registered user found with that email")
            
        existing_role = self.workspace_repo.get_user_role(new_user.id, workspace_id)
        if existing_role:
            raise Conflict(f"User is already a member with role '{existing_role}'")
            
        self.workspace_repo.add_member(new_user.id, workspace_id, ws_role)
        
        # Trigger notification
        self.notif_service.create_notification(
            user_id=new_user.id,
            message=f"You were added to workspace '{ws.name}' as '{ws_role}'",
            notification_type="member_added",
            entity_id=workspace_id
        )
        return {
            "user": new_user.to_dict(),
            "ws_role": ws_role
        }

    def change_member_role(self, workspace_id, member_id, ws_role):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
            
        existing = self.workspace_repo.get_user_role(member_id, workspace_id)
        if not existing:
            raise NotFound("User is not a member of this workspace")
            
        if ws.owner_id == member_id:
            raise BadRequest("Cannot change the workspace owner's role")
            
        self.workspace_repo.update_member_role(member_id, workspace_id, ws_role)
        
        # Trigger notification
        self.notif_service.create_notification(
            user_id=member_id,
            message=f"Your role in workspace '{ws.name}' was updated to '{ws_role}'",
            notification_type="role_updated",
            entity_id=workspace_id
        )
        return {"member_id": member_id, "ws_role": ws_role}

    def remove_member(self, workspace_id, member_id):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
            
        existing = self.workspace_repo.get_user_role(member_id, workspace_id)
        if not existing:
            raise NotFound("User is not a member of this workspace")
            
        if ws.owner_id == member_id:
            raise BadRequest("Cannot remove the owner of the workspace")
            
        self.workspace_repo.remove_member(member_id, workspace_id)
        
        # Trigger notification
        self.notif_service.create_notification(
            user_id=member_id,
            message=f"You were removed from workspace '{ws.name}'",
            notification_type="role_updated",
            entity_id=workspace_id
        )
        return True

    def get_members(self, workspace_id):
        ws = self.workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise NotFound("Workspace not found")
        return self.workspace_repo.get_members(workspace_id)
