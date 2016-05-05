import logging
from contextlib import contextmanager

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
        self.logger = logging.getLogger(__name__)

    def execute(self, sql):
        with self.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute(sql)
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

        return cls.from_params(**params)
