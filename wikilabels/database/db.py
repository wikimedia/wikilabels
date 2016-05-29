import logging
from contextlib import contextmanager

from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

from .campaigns import Campaigns
from .labels import Labels
from .tasks import Tasks
from .worksets import Worksets

logger = logging.getLogger(__name__)

class DB:
    def __init__(self, *args, **kwargs):
        self.pool_params = (args, kwargs)
        self.pool = None

        self.campaigns = Campaigns(self)
        self.worksets = Worksets(self)
        self.tasks = Tasks(self)
        self.labels = Labels(self)
        self.logger = logging.getLogger(__name__)

    def _initialize_pool(self):
        if self.pool is None:
            logger.info("Initializing connection pool.")
            args, kwargs = self.pool_params
            self.pool = ThreadedConnectionPool(
                *args, cursor_factory=RealDictCursor, **kwargs)

    def execute(self, sql):
        with self.transaction() as transactor:
            cursor = transactor.cursor()
            cursor.execute(sql)
            return cursor

    @contextmanager
    def transaction(self):
        """Provides a transactional scope around a series of operations."""
        self._initialize_pool()
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
    def from_config(cls, config):
        # Copy config as kwargs
        params = {k: v for k, v in config['database'].items()}
        params['minconn'] = params.get('minconn', 1)
        params['maxconn'] = params.get('maxconn', 5)

        return cls(**params)
