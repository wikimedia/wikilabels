from .routes_fixture import app  # noqa


def test_users(client):
    response = client.get("/users/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'users' in result
