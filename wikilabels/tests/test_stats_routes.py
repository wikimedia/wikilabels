from .routes_test_fixture import app  # noqa


def test_stats(client):
    assert client.get("/stats/")._status_code == 200
