from app.models.workspace import Workspace, workspace_members
from app.models.user import User
from app.repositories.base_repository import BaseRepository
from app.database import db
from sqlalchemy import insert, delete as sa_delete, update as sa_update, select

class WorkspaceRepository(BaseRepository):
    model = Workspace

    def get_user_role(self, user_id, workspace_id):
        stmt = select(workspace_members.c.ws_role).where(
            workspace_members.c.user_id == user_id,
            workspace_members.c.workspace_id == workspace_id
        )
        row = db.session.execute(stmt).fetchone()
        return row[0] if row else None

    def add_member(self, user_id, workspace_id, role="member"):
        stmt = insert(workspace_members).values(
            user_id=user_id,
            workspace_id=workspace_id,
            ws_role=role
        )
        db.session.execute(stmt)
        db.session.commit()

    def update_member_role(self, user_id, workspace_id, role):
        stmt = sa_update(workspace_members).where(
            workspace_members.c.user_id == user_id,
            workspace_members.c.workspace_id == workspace_id
        ).values(ws_role=role)
        db.session.execute(stmt)
        db.session.commit()

    def remove_member(self, user_id, workspace_id):
        stmt = sa_delete(workspace_members).where(
            workspace_members.c.user_id == user_id,
            workspace_members.c.workspace_id == workspace_id
        )
        db.session.execute(stmt)
        db.session.commit()

    def get_members(self, workspace_id):
        stmt = select(
            workspace_members.c.user_id,
            workspace_members.c.ws_role,
            workspace_members.c.joined_at
        ).where(workspace_members.c.workspace_id == workspace_id)
        
        rows = db.session.execute(stmt).fetchall()
        
        members_list = []
        for r in rows:
            u = User.query.get(r[0])
            if u:
                member_data = u.to_dict()
                member_data["ws_role"] = r[1]
                member_data["joined_at"] = r[2].isoformat()
                members_list.append(member_data)
        return members_list

    def get_user_workspaces(self, user_id):
        # Retrieve all workspaces where user is owner or member
        owned = self.model.query.filter_by(owner_id=user_id).all()
        
        # Joined workspaces
        stmt = select(workspace_members.c.workspace_id).where(
            workspace_members.c.user_id == user_id
        )
        ws_ids = [r[0] for r in db.session.execute(stmt).fetchall()]
        
        joined = self.model.query.filter(self.model.id.in_(ws_ids)).all() if ws_ids else []
        
        # Unique list
        unique_ws = {ws.id: ws for ws in (owned + joined)}
        return list(unique_ws.values())
