from app.database import db

class BaseRepository:
    model = None

    def get_by_id(self, id):
        return self.model.query.get(id)

    def get_all(self):
        return self.model.query.all()

    def add(self, entity):
        db.session.add(entity)
        return entity

    def delete(self, entity):
        db.session.delete(entity)
        return entity

    def commit(self):
        db.session.commit()

    def rollback(self):
        db.session.rollback()

    def save(self, entity):
        self.add(entity)
        self.commit()
        return entity
