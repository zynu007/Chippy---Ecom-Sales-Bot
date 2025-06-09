import random
from django.core.management.base import BaseCommand
from faker import Faker
from chatbot_api.models import Product

class Command(BaseCommand):
    help = 'Populates the database with mock products data'

    def add_arguments(self, parser):
        # this is used for specifying number of products we want to create
        parser.add_argument(
            '--num_products',
            type=int,
            default=100,
            help='The of mock products to create'
        )
    

    def handle(self, *args, **options):
        # main logic for the mannagement command
        
        num_products = options['num_products']
        fake = Faker('en_US')

        # common product categories we want
        electronics_subcategories = ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Smartwatches',
                                      'Cameras', 'Televisions', 'Gaming Consoles', 'Drones', 'Speakers']
        brands = ['Samsung', 'Apple', 'Sony', 'Dell', 'HP', 'Lenovo',
                  'Bose', 'Microsoft', 'Logitech', 'Google', 'Xiaomi', 'OnePlus']
        features = ['high-resolution display', 'long battery life', 'fast processor', 'noise-cancelling',
                     'waterproof', '4K Ultra HD', 'AMOLED screen', 'dual camera', 'gaming-grade']
        
        self.stdout.write(self.style.SUCCESS(f'Deleting existing products...'))
        Product.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(f'Creating (num_products) mock Eectronics products...'))


        for i in range(num_products):
            category = 'Electronics'
            brand = random.choice(brands)
            subcategory = random.choice(electronics_subcategories)

            product_name = f'{brand} {subcategory} {fake.word().capitalize()} {fake.random_int(min=1000, max=9999)} Series.'

            # generate more detailed mock descriptions
            description = (
                f'Introducing the all new {product_name}. This {subcategory} features a '
                f"{random.choice(features)} and offers {random.choice(features)}."
                f"{fake.paragraph(nb_sentences=2)}."
            )

            # adjustinf the price range
            # min:299 max:200,000
            price = fake.pydecimal(left_digits=6, right_digits=2, positive=True, min_value=299, max_value=200000)

            product_id = f"TECH-{fake.unique.random_number(digits=6)}"
            stock_quantity = random.randint(0,299)
            image_url = fake.image_url(width=800, height=600)

            Product.objects.create(
                product_id=product_id,
                name=product_name,
                category=category, #Always 'Electronics'
                description=description,
                price=price,
                stock_quantity=stock_quantity,
                image_url=image_url,
                brand=brand #always a brand is assigned
            )

