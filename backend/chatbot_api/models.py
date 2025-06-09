from django.db import models

class Product(models.Model):
    product_id = models.CharField(max_length=50, unique=True, primary_key=True,
                                  help_text='Unique identifier for product.')
    name = models.CharField(max_length=255, help_text="name of the product.")
    category = models.CharField(max_length=100, help_text="Category of the product.")
    description = models.TextField(blank=True, null=True,
                                   help_text="Detailed description of the product")
    price = models.DecimalField(max_digits=10, decimal_places=2,
                                help_text='Price of the product')
    stock_quantity = models.IntegerField(default=0, help_text='current available stock quantity')
    image_url = models.URLField(max_length=500, blank=True, null=True,
                                help_text='URL to the product image.')
    brand = models.CharField(max_length=100, blank=True, null=True,
                             help_text='Brand of the product')
    created_at = models.DateTimeField(auto_now=True,
                                      help_text='Timestamp of when the product was added')
    updated_at = models.DateTimeField(auto_now=True,
                                      help_text='Timestamp of when the product was last updated')
    
    def __str__(self):
        return f"{self.name}({self.product_id})"
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
    

