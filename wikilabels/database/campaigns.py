from .collection import Collection
from .errors import NotFoundError


class Campaigns(Collection):
    def get(self, campaign_id, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT
                    campaign.id,
                    campaign.name,
                    campaign.form,
                    campaign.view,
                    campaign.wiki,
                    EXTRACT(EPOCH FROM campaign.created) AS created,
                    labels_per_task,
                    tasks_per_assignment,
                    active
                FROM campaign
                WHERE id = %(campaign_id)s;
            """, {'campaign_id': campaign_id})

            try:
                doc = next(cursor)
                if stats:
                    doc['stats'] = self.stats_for(campaign_id)
                return doc
            except StopIteration:
                raise NotFoundError("campaign_id={0}".format(campaign_id))

    def stats_for(self, campaign_id):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT
                    COUNT(DISTINCT task.id) AS tasks,
                    SUM(label.task_id IS NOT NULL::int) AS labels,
                    COUNT(DISTINCT label.user_id) AS coders,
                    (SELECT COUNT(*)
                     FROM workset_task
                     INNER JOIN task ON workset_task.task_id = task.id
                     WHERE task.campaign_id = %(campaign_id)s)
                    AS assignments
                FROM task
                LEFT JOIN label ON label.task_id = task.id
                WHERE task.campaign_id = %(campaign_id)s;
            """, {'campaign_id': campaign_id})

            return next(cursor)

    def has_open_tasks(self, campaign_id, user_id):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            # Check if there are tasks to assign that haven't already been
            # labeled by this user.
            cursor.execute("""
                SELECT
                  task.id
                FROM campaign
                INNER JOIN task ON task.campaign_id = campaign.id
                LEFT JOIN label ON label.task_id = task.id
                WHERE campaign.id = %(campaign_id)s
                GROUP BY task.id, campaign.labels_per_task
                HAVING
                  COUNT(label.task_id) < campaign.labels_per_task AND
                  SUM((label.user_id IS NOT NULL AND
                       label.user_id = %(user_id)s)::int) = 0
                LIMIT 1
            """, {'campaign_id': campaign_id,
                  'user_id': user_id})

            rows = cursor.fetchall()
            return len(rows) > 0

    def for_wiki(self, wiki, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT
                    campaign.id,
                    campaign.name,
                    campaign.form,
                    campaign.view,
                    campaign.wiki,
                    EXTRACT(EPOCH FROM campaign.created) AS created,
                    labels_per_task,
                    tasks_per_assignment,
                    active
                FROM campaign
                WHERE
                    wiki = %(wiki)s AND
                    active
            """, {'wiki': wiki})

            rows = []
            for row in cursor:
                if stats:
                    row['stats'] = self.stats_for(row['id'])
                rows.append(row)

            return rows

    def for_user(self, user_id, stats=False):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT DISTINCT
                    campaign.id,
                    campaign.name,
                    campaign.form,
                    campaign.view,
                    campaign.wiki,
                    EXTRACT(EPOCH FROM campaign.created) AS created,
                    labels_per_task,
                    tasks_per_assignment,
                    active
                FROM workset
                INNER JOIN campaign ON campaign_id = campaign.id
                WHERE user_id = %(user_id)s
                ORDER BY campaign.id
            """, {'user_id': user_id})

            rows = []
            for row in cursor:
                if stats:
                    row['stats'] = self.stats_for(row['id'])
                rows.append(row)

            return rows

    def wikis(self):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT DISTINCT wiki
                FROM campaign
                WHERE active
                ORDER BY wiki
            """)

            return [row['wiki'] for row in cursor]

    def get_campaign(self, name, wiki):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                SELECT *
                FROM campaign
                WHERE name = %(name)s
                AND wiki = %(wiki)s
            """, {'name': name, 'wiki': wiki})
            for row in cursor:
                return row

    def new_campaign(self, wiki, name, form_name, diff_type, workset_size):
        with self.db.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute("""
                INSERT INTO campaign
                (name, wiki, form, view, created, labels_per_task,
                 tasks_per_assignment, active)
                VALUES
                (%(name)s, %(wiki)s, %(c_type)s, %(d_type)s, NOW(), 1,
                 %(num)d, True)
            """, {'name': name, 'wiki': wiki, 'c_type': form_name,
                  'd_type': diff_type, 'num': workset_size})
            for row in cursor:
                return row
