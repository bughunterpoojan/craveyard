from django.urls import path
from . import views

urlpatterns = [
    path('menu/', views.menu_list, name='menu_list'),
    path('orders/', views.order_list_create, name='order_list_create'),
    path('orders/<int:pk>/', views.order_detail, name='order_detail'),
    path('stats/', views.sales_stats, name='sales_stats'),
    path('export-sales/', views.export_sales_csv, name='export_sales_csv'),
    path('demo-action/', views.reset_or_demo_data, name='reset_or_demo_data'),
]
