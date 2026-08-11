def test_django_settings_load(settings):
    assert settings.ROOT_URLCONF == "config.urls"
