import psycopg2
from psycopg2.extras import RealDictCursor

from .campaigns import Campaigns
from .labels import Labels
from .tasks import Tasks
from .worksets import Worksets


class DB:
    def __init__(self, conn):
        self.conn = conn

        self.campaigns = Campaigns(self)
        self.worksets = Worksets(self)
        self.tasks = Tasks(self)
        self.labels = Labels(self)

    def execute(self, sql):
        cursor = self.conn.cursor()
        cursor.execute(sql)
        self.conn.commit()
        return cursor

    @classmethod
    def from_config(cls, dbname, user, password, host):
        conn = psycopg2.connect(cursor_factory=RealDictCursor, dbname=dbname,
                                user=user, password=password, host=host)

        return cls(conn)
