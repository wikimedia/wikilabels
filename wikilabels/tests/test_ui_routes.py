from .routes_test_fixture import app  # noqa


def test_ui(client):
    assert client.get("/ui/")._status_code == 200
