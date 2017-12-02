from .routes_test_fixture import app  # noqa


def test_auth(client):
    response = client.get("/auth/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'initiate' in result['paths']
    assert 'whoami' in result['paths']
    assert 'logout' in result['paths']
