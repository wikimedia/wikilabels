from contextlib import contextmanager

import psycopg2
import yaml
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

from .campaigns import Campaigns
from .labels import Labels
from .tasks import Tasks
from .worksets import Worksets


class DB:
    def __init__(self, pool):
        self.pool = pool

        self.campaigns = Campaigns(self)
        self.worksets = Worksets(self)
        self.tasks = Tasks(self)
        self.labels = Labels(self)

    def execute(self, sql):
        with self.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute(sql)
            self.conn.commit()
            return cursor

    @contextmanager
    def transaction(self):
        """Provides a transactional scope around a series of operations."""
        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except:
            conn.rollback()
            raise
        finally:
            self.pool.putconn(conn)

    @classmethod
    def from_params(cls, *args, minconn=10, maxconn=20, **kwargs):
        pool = ThreadedConnectionPool(*args, cursor_factory=RealDictCursor,
                                      minconn=minconn,
                                      maxconn=maxconn,
                                      **kwargs)

        return cls(pool)

    @classmethod
    def from_config(cls, config):
        # Copy config as kwargs
        params = {k: v for k, v in config['database'].items()}

        if 'creds' in params:
            creds = yaml.load(open(params['creds']))
            del params['creds']
            params.update(creds)

        return cls.from_params(**params)
