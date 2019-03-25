from .routes_test_fixture import app  # noqa


def test_versions(client):
    assert client.get("/versions/")._status_code == 200
