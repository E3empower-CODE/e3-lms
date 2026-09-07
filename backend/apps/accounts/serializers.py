from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Safe representation of the authenticated user for the SPA."""

    name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "name", "role", "first_name", "last_name"]
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        request = self.context.get("request")
        user = authenticate(
            request=request, username=attrs["email"], password=attrs["password"]
        )
        # Same generic message whether the email is unknown or the password is
        # wrong, to avoid account enumeration.
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs
