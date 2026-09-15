from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, ai
router = DefaultRouter()
router.register('activities', views.ActivityViewSet, basename='activity')
urlpatterns = [
    path('health/', views.health),
    path('auth/register/', views.register), path('auth/login/', views.login),
    path('auth/me/', views.me), path('auth/logout/', views.logout), path('auth/refresh/', views.refresh),
    path('auth/forgot-password/', views.forgot_password), path('auth/reset-password/', views.reset_password),
    path('explore/', views.explore), path('favorites/', views.favorites),
    path('activities/<uuid:pk>/duplicate/', views.duplicate),
    path('games/<str:code>/', views.game_entry),
    path('game-sessions/<uuid:pk>/<str:operation>/', views.game_action),
    path('ai/generate-activity/', ai.generate),
    path('', include(router.urls)),
]
