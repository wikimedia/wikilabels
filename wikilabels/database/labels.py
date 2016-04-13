import logging
import psycopg2
from psycopg2.extras import Json

from .collection import Collection

logger = logging.getLogger(__name__)


class Labels(Collection):

    def upsert(self, task_id, user_id, data):
        user_id = int(user_id)

        # T130872#2203274
        result = self.update(task_id, user_id, data)
        if not result:
            try:
                return self.insert(task_id, user_id, data)
            except psycopg2.IntegrityError:
                return self.update(task_id, user_id, data)
        else:
            return result

    def insert(self, task_id, user_id, data):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()

            cursor.execute("""
            INSERT INTO label VALUES
              (%(task_id)s, %(user_id)s, NOW(), %(data)s)
            RETURNING *
            """, {'task_id': task_id, 'user_id': user_id, 'data': Json(data)})
            logger.info(
                'Insert {data} for {task} by {user}'.format(
                    data=data,
                    task=task_id,
                    user=user_id))
            for row in cursor:
                return row

    def update(self, task_id, user_id, data):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
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
            logger.info(
                'Update {data} for {task} by {user}'.format(
                    data=data,
                    task=task_id,
                    user=user_id))
            for row in cursor:
                return row
