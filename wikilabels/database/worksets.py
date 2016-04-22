import logging

from .collection import Collection
from .errors import IntegrityError, NotFoundError

logger = logging.getLogger(__name__)


class Worksets(Collection):
    def get(self, workset_id, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT
                    id, user_id,
                    campaign_id,
                    EXTRACT(EPOCH FROM created) AS created,
                    EXTRACT(EPOCH FROM expires) AS expires
                FROM workset
                WHERE id = %(workset_id)s
                ORDER BY id
            """, {'workset_id': workset_id})

            try:
                doc = next(cursor)
                if stats:
                    doc['stats'] = self.stats_for(workset_id)
                return doc
            except StopIteration:
                raise NotFoundError("workset_id={0}".format(workset_id))

    def stats_for(self, workset_id):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT
                    COUNT(workset_task.task_id) AS tasks,
                    COALESCE(SUM(label.task_id IS NOT NULL::int), 0) AS labeled
                FROM workset
                INNER JOIN workset_task ON workset_task.workset_id = workset.id
                LEFT JOIN label ON
                    label.task_id = workset_task.task_id AND
                    label.user_id = workset.user_id
                WHERE workset.id = %(workset_id)s
            """, {'workset_id': workset_id})

            try:
                return next(cursor)
            except StopIteration:
                raise NotFoundError("workset_id={0}".format(workset_id))

    def for_campaign(self, campaign_id, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT
                    id, user_id,
                    campaign_id,
                    EXTRACT(EPOCH FROM created) AS created,
                    EXTRACT(EPOCH FROM expires) AS expires
                FROM workset
                WHERE campaign_id = %(campaign_id)s
                ORDER BY id
            """, {'campaign_id': campaign_id})

            rows = []
            for row in cursor:
                if stats:
                    row['stats'] = self.stats_for(row['id'])
                rows.append(row)

            return rows

    def for_user(self, user_id, campaign_id=None, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()

            conditions = ["workset.user_id = %(user_id)s"]
            if campaign_id is not None:
                conditions.append("workset.campaign_id = %(campaign_id)s")

            where = "\nWHERE " + " AND ".join(conditions) + "\n"

            cursor.execute("""
                SELECT
                    id, user_id,
                    campaign_id,
                    EXTRACT(EPOCH FROM created) AS created,
                    EXTRACT(EPOCH FROM expires) AS expires
                FROM workset
                """ + where + """
                ORDER BY id
            """, {'user_id': user_id,
                  'campaign_id': campaign_id})

            rows = []
            for row in cursor:
                if stats:
                    row['stats'] = self.stats_for(row['id'])
                rows.append(row)

            return rows

    def open_workset_for_user(self, campaign_id, user_id):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            # Check if this user already has an open workset
            cursor.execute("""
                SELECT
                    workset.id
                FROM workset
                INNER JOIN workset_task ON workset.id = workset_task.workset_id
                INNER JOIN task ON workset_task.task_id = task.id
                LEFT JOIN label ON
                    task.id = label.task_id AND
                    workset.user_id = label.user_id
                WHERE workset.user_id = %(user_id)s AND
                      workset.campaign_id = %(campaign_id)s AND
                      label.task_id IS NULL
                LIMIT 1;
            """, {'user_id': user_id,
                  'campaign_id': campaign_id})

            rows = cursor.fetchall()
            if len(rows) > 0:
                return rows[0]['id']
            else:
                return None

    def assign(self, campaign_id, user_id, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            campaign = self.db.campaigns.get(campaign_id)
            if not campaign['active']:
                raise IntegrityError("Campaign {0} not active."
                                     .format(campaign_id))

            workset_id = self.open_workset_for_user(campaign_id, user_id)
            if workset_id is not None:
                raise IntegrityError(("Incomplete workset_id={0} already " +
                                      "assigned to user_id={1}")
                                     .format(workset_id, user_id))

            if not self.db.campaigns.has_open_tasks(campaign_id, user_id):
                raise IntegrityError(("No tasks available for user_id={0} " +
                                      "in campaign_id={1}")
                                     .format(user_id, campaign_id))

            # Create a new workset
            cursor.execute("""
                INSERT INTO workset VALUES
                  (DEFAULT, %(campaign_id)s, %(user_id)s, NOW(),
                   NOW() + INTERVAL '1 DAY') RETURNING id;
            """, {'campaign_id': campaign_id,
                  'user_id': user_id})

            logger.info(
                'Create new workset for {campaign} by {user}'.format(
                    campaign=campaign_id,
                    user=user_id))

            workset_id = cursor.fetchone()['id']

            # Assign tasks to the workset
            cursor.execute("""
                INSERT INTO workset_task
                SELECT
                  %(workset_id)s AS workset_id,
                  task.id AS task_id
                FROM campaign
                INNER JOIN task ON task.campaign_id = campaign.id
                LEFT JOIN label ON
                  label.task_id = task.id
                WHERE campaign.id = %(campaign_id)s
                GROUP BY task.id, campaign.labels_per_task
                HAVING
                  COUNT(label.task_id) < campaign.labels_per_task AND
                  SUM((label.user_id IS NOT NULL AND
                       label.user_id = %(user_id)s)::int) = 0
                ORDER BY RANDOM()
                LIMIT %(tasks_per_assignment)s
            """, {'campaign_id': campaign_id,
                  'workset_id': workset_id,
                  'user_id': user_id,
                  'tasks_per_assignment': campaign['tasks_per_assignment']})

            logger.info(
                'Assign tasks for the workset {workset} for campaign'
                ' {campaign} by {user}'.format(
                    campaign=campaign_id,
                    workset=workset_id,
                    user=user_id))

        return self.get(workset_id, stats)

    def users(self):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT DISTINCT user_id
                FROM workset
                ORDER BY user_id
            """)

            return [row['user_id'] for row in cursor]

    def abandon(self, workset_id, user_id):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()

            # Check if this user owns this workset
            cursor.execute("""
                SELECT 1 FROM workset
                WHERE id = %(workset_id)s AND
                      user_id = %(user_id)s
            """, {'workset_id': workset_id, 'user_id': user_id})

            if len(cursor.fetchall()) == 0:
                mssg = 'workset_id={0} does not belong to user_id={1}'
                mssg = mssg.format(workset_id, user_id)
                raise IntegrityError(mssg)

            # Clear incomplete assignements
            cursor.execute("""
                DELETE FROM workset_task
                WHERE
                    workset_id = %(workset_id)s AND
                    task_id IN (
                        SELECT workset_task.task_id
                        FROM workset_task
                        LEFT JOIN label ON
                            workset_task.task_id = label.task_id AND
                            label.user_id = %(user_id)s
                        WHERE
                            workset_id = %(workset_id)s AND
                            label.task_id IS NULL
                    )
            """, {'workset_id': workset_id, 'user_id': user_id})

            logger.info(
                'Clearing incomplete assignements for workset'
                ' {workset} by {user}'.format(
                    workset=workset_id,
                    user=user_id))

        return self.get(workset_id)

    def abandon_task(self, workset_id, user_id, task_id):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()

            # Check if this user owns this workset
            cursor.execute("""
                SELECT 1 FROM workset
                WHERE id = %(workset_id)s AND
                      user_id = %(user_id)s
            """, {'workset_id': workset_id, 'user_id': user_id})

            if len(cursor.fetchall()) == 0:
                mssg = 'workset_id={0} does not belong to user_id={1}'
                mssg = mssg.format(workset_id, user_id)
                raise IntegrityError(mssg)

            # Clear task
            cursor.execute("""
                DELETE FROM workset_task
                WHERE
                    workset_id = %(workset_id)s AND
                    task_id = %(task_id)s
            """, {'workset_id': workset_id, 'task_id': task_id})

            logger.info(
                'Clearing task {task_id} from workset'
                ' {workset} for user {user}'.format(
                    workset=workset_id,
                    task_id=task_id,
                    user=user_id))

        return self.get(workset_id)
