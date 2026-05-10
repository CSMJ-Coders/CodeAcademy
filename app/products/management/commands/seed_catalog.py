import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from cart.models import Cart, CartItem
from orders.models import Order, OrderItem
from products.models import Category, Chapter, Product, TableOfContentsEntry


FIXTURE_PATH = Path(__file__).resolve().parents[2] / 'fixtures' / 'initial_products.json'


class Command(BaseCommand):
    help = 'Carga o actualiza el catálogo inicial de productos, capítulos e índice de libros.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina categorías, productos y contenido relacionado antes de cargar el seed.',
        )

    def handle(self, *args, **options):
        if not FIXTURE_PATH.exists():
            raise FileNotFoundError(f'No se encontró la fixture: {FIXTURE_PATH}')

        with FIXTURE_PATH.open('r', encoding='utf-8') as file_handle:
            payload = json.load(file_handle)

        categories = [item for item in payload if item['model'] == 'products.category']
        products = [item for item in payload if item['model'] == 'products.product']
        chapters = [item for item in payload if item['model'] == 'products.chapter']
        toc_entries = [item for item in payload if item['model'] == 'products.tableofcontentsentry']

        if options['clear']:
            self.stdout.write(self.style.WARNING('Limpiando catálogo existente...'))
            CartItem.objects.all().delete()
            Cart.objects.all().delete()
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            Chapter.objects.all().delete()
            TableOfContentsEntry.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()

        with transaction.atomic():
            self.stdout.write('Cargando categorías...')
            for item in categories:
                fields = item['fields']
                Category.objects.update_or_create(
                    id=item['pk'],
                    defaults={
                        'name': fields['name'],
                        'icon': fields['icon'],
                    },
                )

            self.stdout.write('Cargando productos...')
            for item in products:
                fields = item['fields']
                category = Category.objects.get(id=fields['category'])
                Product.objects.update_or_create(
                    id=item['pk'],
                    defaults={
                        'title': fields['title'],
                        'type': fields['type'],
                        'category': category,
                        'author': fields['author'],
                        'description': fields['description'],
                        'price': fields['price'],
                        'original_price': fields['original_price'],
                        'level': fields['level'],
                        'language': fields['language'],
                        'image': fields['image'],
                        'rating': fields['rating'],
                        'duration': fields['duration'],
                        'pages': fields['pages'],
                        'is_new': fields['is_new'],
                        'is_featured': fields['is_featured'],
                        'is_active': fields['is_active'],
                    },
                )

            self.stdout.write('Cargando capítulos...')
            for item in chapters:
                fields = item['fields']
                product = Product.objects.get(id=fields['product'])
                Chapter.objects.update_or_create(
                    id=item['pk'],
                    defaults={
                        'product': product,
                        'order': fields['order'],
                        'title': fields['title'],
                        'duration': fields['duration'],
                        'video_url': fields['video_url'],
                        'is_preview': fields.get('is_preview', False),
                    },
                )

            self.stdout.write('Cargando índices de libros...')
            for item in toc_entries:
                fields = item['fields']
                product = Product.objects.get(id=fields['product'])
                TableOfContentsEntry.objects.update_or_create(
                    id=item['pk'],
                    defaults={
                        'product': product,
                        'order': fields['order'],
                        'entry': fields['entry'],
                        'is_preview': fields.get('is_preview', False),
                    },
                )

        self.stdout.write(self.style.SUCCESS(
            f'Catálogo cargado correctamente: {len(categories)} categorías, {len(products)} productos, '
            f'{len(chapters)} capítulos y {len(toc_entries)} entradas de índice.'
        ))
