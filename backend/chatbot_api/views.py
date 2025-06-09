from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Product
from .serializers import ProductSerializer
from .auth_serializers import UserLoginSerializer, UserProfileSerializer, UserRegisterSerializer


class ProductListAPIView(generics.ListAPIView):

    serializer_class = ProductSerializer

    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        #dynamically gets the queuryset based on search parameters

        queryset = Product.objects.all()
        search_query = self.request.query_params.get('search', None)

        if search_query:
            #case insensitive search across products data
            #imported Q objects for complex OR queries

            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__icontains=search_query) |
                Q(brand__icontains=search_query)
            )

        return queryset
    

class ProductDetailAPIView(generics.RetrieveAPIView):
    # api view to retrieve a single product details by it's product id

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field ='product_id'  #tells to look for 'product_id' instead of default 'pk'.

    permission_classes = [permissions.AllowAny]


class UserRegisterView(generics.CreateAPIView):
    # APIVIEW for user registration => POST /api/auth/register
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response(serializer.data, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    # APIVIEW for logout, blacklists refresh tokens => POST /api/auth/logout
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # looks for refresh token from request body or header
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(
                {'detail': 'Invalid token or token not found.', 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        

class UserProfileView(generics.RetrieveAPIView):
    # apiview to get logged in user's profile => GET /api/auth/me
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user  # returns currently authenticated user
    

