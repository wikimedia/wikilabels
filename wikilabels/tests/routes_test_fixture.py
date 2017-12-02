import pytest
import os
import yamlconf
import glob

from ..wsgi import server


@pytest.fixture
def app():
    config_paths = os.path.join('config/', "*.yaml")
    config = yamlconf.load(*(open(p) for p in sorted(glob.glob(config_paths))))
    return server.configure(config)
