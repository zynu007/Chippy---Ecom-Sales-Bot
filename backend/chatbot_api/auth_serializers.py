from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    # tis serializer is user for user creation and validation

    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True, required = True)
    username = serializers.CharField(required=True, max_length=150)

    class Meta:
        model = User
        fields = ('email','username','password','password2')
        #extra_kwargs = {'username': {'required': False}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers. ValidationError({'password': "Passwords did't match."})
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email= validated_data['email'],
            password=validated_data['password']
        )
        return user
    

class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

class UserLoginSerializer(serializers.Serializer):

    email= serializers.EmailField(required=True)
    password= serializers.CharField(required=True, write_only=True)
    token=TokenPairSerializer(read_only=True)

    def validate(sef, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

        user = User.objects.filter(email=email).first()

        if not user:
            raise serializers.ValidationError("User with this email does not exist.")

        if not user.check_password(password):
            raise serializers.ValidationError("Incorrect password.")

        #if credentials are valid, generate JWT tokens
        refresh = RefreshToken.for_user(user)
        data['token'] = {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login')
        read_only_fields = fields