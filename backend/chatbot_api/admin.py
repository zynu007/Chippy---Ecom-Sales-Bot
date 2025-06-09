from django.contrib import admin
from .models import Product

@admin.register(Product) #decorator
class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_id','name','category','price','stock_quantity','created_at')
    search_fields = ('name','category','description','brand')
    list_filter = ('category',"brand",'stock_quantity')
    fieldsets = (
     ('Product Details', {
         'fields': ('name', 'product_id', 'category', 'brand', 'description', 'image_url')
     }),
     ('Pricing & Inventory', {
         'fields': ('price', 'stock_quantity')
     }),
    )