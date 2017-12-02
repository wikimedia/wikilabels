from .routes_fixture import app  # noqa


def test_root(client):
    assert client.get("/")._status_code == 200
