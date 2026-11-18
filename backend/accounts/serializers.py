from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='user', required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'age', 'phone', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.get('role', 'user')
        if role == 'admin':
            validated_data['is_staff'] = True
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'age', 'phone', 'role', 'is_staff', 'created_at']
        read_only_fields = ['id', 'created_at']
