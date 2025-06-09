from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (ProductListAPIView, ProductDetailAPIView,
                    UserRegisterView, UserLoginView, UserLogoutView, UserProfileView)

from .chat_views import ChatHistoryAPIView


urlpatterns = [
    path('products/', ProductListAPIView.as_view(), name='products_list'),
    path('products/<str:product_id>/', ProductDetailAPIView.as_view(), name='products_detail'),
    #Authentication apis
    path('auth/register/', UserRegisterView.as_view(), name='auth_register'),
    path('auth/login/', UserLoginView.as_view(), name='auth_login'),
    path('auth/logout/', UserLogoutView.as_view(), name='auth_logout'),
    path('auth/me/', UserProfileView.as_view(), name='auth_profile'),
    #Jwt toke management urlss 
    path('auth/token/', TokenObtainPairView.as_view(), name='toke_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='toke_refresh'),
    #chat history apis
    path('chat/history/', ChatHistoryAPIView.as_view(), name='chat_history'),
    path('chat/save/', ChatHistoryAPIView.as_view(), name='chat_save'),
    path('chat/clear/', ChatHistoryAPIView.as_view(), name='chat_clear'),
]
