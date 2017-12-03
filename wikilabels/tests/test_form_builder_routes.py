from .routes_test_fixture import app  # noqa


def test_form_builder(client):
    assert client.get("/form_builder/")._status_code == 200
