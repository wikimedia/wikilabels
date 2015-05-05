import psycopg2
from psycopg2.extras import Json

from .collection import Collection
from .errors import NotFoundError


class Labels(Collection):

    def upsert(self, task_id, user_id, data):
        user_id = int(user_id)
        try:
            return self.insert(task_id, user_id, data)
        except psycopg2.IntegrityError:
            return self.update(task_id, user_id, data)

    def insert(self, task_id, user_id, data):
        with self.db.conn.cursor() as cursor:
            try:
                cursor.execute("""
                INSERT INTO label VALUES
                  (%(task_id)s, %(user_id)s, NOW(), %(data)s)
                RETURNING *
                """, {'task_id': task_id, 'user_id': user_id, 'data': Json(data)})
                self.db.conn.commit()
            except Exception:
                self.db.conn.rollback()
                raise
            for row in cursor:
                return row

    def update(self, task_id, user_id, data):
        with self.db.conn.cursor() as cursor:
            try:
                cursor.execute("""
                UPDATE label
                SET
                    data = %(data)s,
                    timestamp = NOW()
                WHERE
                    task_id = %(task_id)s AND
                    user_id = %(user_id)s
                RETURNING *
                """, {'task_id': task_id, 'user_id': user_id, 'data': Json(data)})
                self.db.conn.commit()
            except Exception:
                self.db.conn.rollback()
                raise
            for row in cursor:
                return row
