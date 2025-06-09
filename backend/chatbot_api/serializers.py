from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        """fields = ['product_id', 'name', 'category', 'description',
                   'price', 'stock_quantity', 'image_url', 'brand']"""
        fields = '__all__'
