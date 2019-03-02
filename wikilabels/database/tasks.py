from itertools import groupby

from psycopg2.extras import Json

from .collection import Collection
from .errors import NotFoundError


class Tasks(Collection):

    def get(self, task_id):
        cursor = self.db.execute("""
            SELECT
                task.id as task_id,
                task.data as task_data,
                task.campaign_id,
                label.user_id,
                label.data as label_data,
                EXTRACT(EPOCH FROM label.timestamp) as label_timestamp
            FROM task
            LEFT JOIN label ON task.id = label.task_id
            WHERE task.id = %(task_id)s
        """, {'task_id': task_id})

        try:
            return self._group_task_labels(cursor)[0]
        except IndexError:
            raise NotFoundError("task_id={0}".format(task_id))

    def for_workset(self, workset_id):
        cursor = self.db.execute("""
            SELECT
                task.id as task_id,
                task.data as task_data,
                task.campaign_id,
                label.user_id,
                label.data as label_data,
                EXTRACT(EPOCH FROM label.timestamp) as label_timestamp
            FROM workset
            INNER JOIN workset_task ON workset_id = workset.id
            INNER JOIN task ON workset_task.task_id = task.id
            LEFT JOIN label ON
                task.id = label.task_id AND
                label.user_id = workset.user_id
            WHERE workset.id = %(workset_id)s
            ORDER BY task.id
        """, {'workset_id': workset_id})

        return self._group_task_labels(cursor)

    def for_campaign(self, campaign_id):
        cursor = self.db.execute("""
            SELECT
                task.id as task_id,
                task.data as task_data,
                task.campaign_id,
                label.user_id,
                label.data as label_data,
                EXTRACT(EPOCH FROM label.timestamp) as label_timestamp
            FROM task
            LEFT JOIN label ON task.id = label.task_id
            WHERE task.campaign_id = %(campaign_id)s
            ORDER BY task_id, timestamp
        """, {'campaign_id': campaign_id})

        return self._group_task_labels(cursor)

    def for_user(self, user_id, workset_id=None, campaign_id=None):
        conditions = ["workset.user_id = %(user_id)s"]
        if workset_id is not None:
            conditions.append("workset.id = %(workset_id)s")
        if campaign_id is not None:
            conditions.append("workset.campaign_id = %(campaign_id)s")
        where = "\nWHERE " + " AND ".join(conditions) + "\n"
        cursor = self.db.execute("""
            SELECT
                task.id as task_id,
                task.data as task_data,
                task.campaign_id,
                label.user_id,
                label.data as label_data,
                EXTRACT(EPOCH FROM label.timestamp) as label_timestamp
            FROM workset
            INNER JOIN workset_task ON workset.id = workset_task.workset_id
            INNER JOIN task ON workset_task.task_id = task.id
            LEFT JOIN label ON
                task.id = label.task_id AND
                label.user_id = workset.user_id
            """ + where + """
            ORDER BY task_id, timestamp
        """, {'user_id': user_id,
              'workset_id': workset_id,
              'campaign_id': campaign_id})

        return self._group_task_labels(cursor)

    @staticmethod
    def extract_key(r):
        return r['task_id'], r['task_data'], r['campaign_id']

    def _group_task_labels(self, cursor):

        tasks = []
        for (id, data, campaign_id), rows in \
                groupby(cursor, key=self.extract_key):
            labels = []
            for row in rows:
                if row['label_data'] is not None:
                    labels.append({
                        'user_id': row['user_id'],
                        'timestamp': row['label_timestamp'],
                        'data': row['label_data']
                    })
            tasks.append({'id': id,
                          'data': data,
                          'campaign_id': campaign_id,
                          'labels': labels})

        return tasks

    def load(self, tasks, campaign_id):
        self.db.executemany("""
            INSERT INTO task (campaign_id, data)
            VALUES (%(campaign_id)s, %(data)s)
        """, ({'campaign_id': campaign_id, 'data': Json(task)}
              for task in tasks))
        return True

    def remove_expired_tasks(self):
        cursor = self.db.execute("""
            DELETE FROM workset_task
            USING workset_task AS wt
            JOIN workset AS w ON
                w.id = wt.workset_id
            LEFT JOIN label AS l ON
                l.task_id = wt.task_id AND
                l.user_id = w.user_id
            WHERE
                workset_task.task_id = wt.task_id AND
                workset_task.workset_id = wt.workset_id AND
                l.data is NULL AND
                w.expires < NOW()
        """)
        return cursor.rowcount
