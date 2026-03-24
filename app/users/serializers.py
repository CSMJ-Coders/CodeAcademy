from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.text import slugify
from rest_framework import serializers

from .models import User


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    purchased_products = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'name',
            'purchased_products',
            'preferred_language',
            'is_student',
            'date_joined',
        ]
        read_only_fields = ['id', 'email', 'username', 'is_student', 'date_joined']

    def get_name(self, obj):
        full_name = f'{obj.first_name} {obj.last_name}'.strip()
        return full_name or obj.username or obj.email

    def get_purchased_products(self, obj):
        return [str(product_id) for product_id in obj.purchased_products.values_list('id', flat=True)]


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password_confirm', 'preferred_language']

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Ya existe una cuenta con este correo electrónico.')
        return email

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})

        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        name = validated_data.pop('name').strip()
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        first_name, last_name = self._split_name(name)
        username = self._generate_username(validated_data['email'])

        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        return user

    def _split_name(self, full_name):
        parts = full_name.split()
        if not parts:
            return '', ''
        if len(parts) == 1:
            return parts[0], ''
        return parts[0], ' '.join(parts[1:])

    def _generate_username(self, email):
        base_username = slugify(email.split('@')[0]) or 'user'
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f'{base_username}-{counter}'
            counter += 1

        return username


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError('Credenciales inválidas.')

        if not user.is_active:
            raise serializers.ValidationError('Esta cuenta está desactivada.')

        attrs['user'] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
