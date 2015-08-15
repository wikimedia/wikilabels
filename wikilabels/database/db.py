import psycopg2
import yaml
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
    def from_params(cls, *args, **kwargs):
        conn = psycopg2.connect(cursor_factory=RealDictCursor, *args, **kwargs)

        return cls(conn)

    @classmethod
    def from_config(cls, config):
        # Copy config as kwargs
        params = {k: v for k, v in config['database'].items()}

        if 'creds' in params:
            creds = yaml.load(open(params['creds']))
            del params['creds']
            params.update(creds)

        return cls.from_params(**params)
