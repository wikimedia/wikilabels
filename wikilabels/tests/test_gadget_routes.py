from .routes_test_fixture import app  # noqa


def test_gadget(client):
    assert client.get("/gadget/")._status_code == 200
