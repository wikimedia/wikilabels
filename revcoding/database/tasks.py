from itertools import groupby

from .collection import Collection
from .errors import NotFoundError


class Tasks(Collection):

    def get(self, task_id):
        with self.db.conn.cursor() as cursor:
            cursor.execute("""
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
        with self.db.conn.cursor() as cursor:
            cursor.execute("""
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
            """, {'workset_id': workset_id})

            return self._group_task_labels(cursor)

    def for_campaign(self, campaign_id):
        with self.db.conn.cursor() as cursor:
            cursor.execute("""
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
        with self.db.conn.cursor() as cursor:

            conditions = ["workset.user_id = %(user_id)s"]
            if workset_id is not None:
                conditions.append("workset.id = %(workset_id)s")
            if campaign_id is not None:
                conditions.append("workset.campaign_id = %(campaign_id)s")

            where = "\nWHERE " + " AND ".join(conditions) + "\n"

            cursor.execute("""
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


    def _group_task_labels(self, cursor):
        extract_key = lambda r:(r['task_id'], r['task_data'], r['campaign_id'])

        tasks = []
        for (id, data, campaign_id), rows in groupby(cursor, key=extract_key):
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
