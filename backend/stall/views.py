import csv
from datetime import datetime
from django.http import HttpResponse, JsonResponse
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MenuItem, Order, OrderItem
from .serializers import MenuItemSerializer, OrderSerializer

DEFAULT_MENU_ITEMS = [
    # Maggi & Taco Section
    {
        "name": "Simple Maggie",
        "category": "maggi_taco",
        "brand": "maggie",
        "price_single": 49,
        "description": "The classic college favorite noodles, cooked to perfection with special seasoning.",
        "badge": "Classic",
        "has_wafer_options": False,
        "order_rank": 1
    },
    {
        "name": "Classic Cheesy",
        "category": "maggi_taco",
        "brand": "maggie",
        "price_single": 79,
        "description": "Rich melted cheese blend folded over piping hot spicy Maggi.",
        "badge": "Cheesy",
        "has_wafer_options": False,
        "order_rank": 2
    },
    {
        "name": "Cheesy Massala",
        "category": "maggi_taco",
        "brand": "maggie",
        "price_single": 99,
        "description": "Double blast of roasted Indian masala sauce with a gooey cheese crown.",
        "badge": "Spicy & Cheesy",
        "has_wafer_options": False,
        "order_rank": 3
    },
    {
        "name": "Tandooriyat e Khaas",
        "category": "maggi_taco",
        "brand": "maggie",
        "price_single": 119,
        "description": "Smoky char tandoori sauce, aromatic whole spices, and festival heat.",
        "badge": "Chef Special",
        "has_wafer_options": False,
        "order_rank": 4
    },
    {
        "name": "Maggie Crunch Box",
        "category": "maggi_taco",
        "brand": "maggie",
        "price_single": 149,
        "description": "Signature loaded box! Choose 2 of your favorite crunchy wafers to toss in.",
        "badge": "Craveyard Star ⭐",
        "has_wafer_options": True,
        "order_rank": 5
    },
    {
        "name": "Tandoori Taco Blast",
        "category": "maggi_taco",
        "brand": "taco",
        "price_single": 179,
        "description": "Crispy golden tacos loaded with spicy smoked noodles, cheese sauce & crunchy seasoning.",
        "badge": "Must Try",
        "has_wafer_options": False,
        "order_rank": 6
    },

    # BYOB - Balaji
    {
        "name": "Balaji Masala Masti",
        "category": "byob",
        "brand": "balaji",
        "price_small": 59,
        "price_large": 99,
        "description": "Crispy wafers tossed with spicy chatpata masala.",
        "badge": "Popular",
        "has_wafer_options": False,
        "order_rank": 10
    },
    {
        "name": "Balaji Chat Chaska",
        "category": "byob",
        "brand": "balaji",
        "price_small": 59,
        "price_large": 99,
        "description": "Tangy, zesty Indian street-style chat flavours.",
        "badge": "",
        "has_wafer_options": False,
        "order_rank": 11
    },
    {
        "name": "Balaji Crunchex",
        "category": "byob",
        "brand": "balaji",
        "price_small": 59,
        "price_large": 99,
        "description": "Extra crunchy ridged potato chips seasoned with fine spices.",
        "badge": "",
        "has_wafer_options": False,
        "order_rank": 12
    },
    {
        "name": "Balaji Rumbles",
        "category": "byob",
        "brand": "balaji",
        "price_small": 59,
        "price_large": 99,
        "description": "Deep-cut wavy crunch with savory spice dusting.",
        "badge": "",
        "has_wafer_options": False,
        "order_rank": 13
    },
    {
        "name": "Balaji Flamigo",
        "category": "byob",
        "brand": "balaji",
        "price_small": 59,
        "price_large": 99,
        "description": "Fiery flaming hot punch for high-tolerance snack lovers.",
        "badge": "Hot",
        "has_wafer_options": False,
        "order_rank": 14
    },

    # BYOB - Doritos
    {
        "name": "Doritos",
        "category": "byob",
        "brand": "doritos",
        "price_small": None,
        "price_large": 149,
        "description": "Mega crunch triangular corn tortilla chips packed with bold nacho flavour.",
        "badge": "Premium",
        "has_wafer_options": False,
        "order_rank": 20
    },

    # BYOB - Bingo
    {
        "name": "Bingo PeriPeri",
        "category": "byob",
        "brand": "bingo",
        "price_small": None,
        "price_large": 109,
        "description": "African bird's eye chili kick with tangy zesty swirls.",
        "badge": "Spicy",
        "has_wafer_options": False,
        "order_rank": 25
    },
    {
        "name": "Bingo Achari",
        "category": "byob",
        "brand": "bingo",
        "price_small": None,
        "price_large": 109,
        "description": "Traditional pickle spice mix loaded on crispy curved chips.",
        "badge": "Tangy",
        "has_wafer_options": False,
        "order_rank": 26
    },

    # BYOB - Kurkure
    {
        "name": "Kurkure Solid Masti",
        "category": "byob",
        "brand": "kurkure",
        "price_small": None,
        "price_large": 69,
        "description": "Twisted corn crunch with explosive Indian street seasoning.",
        "badge": "",
        "has_wafer_options": False,
        "order_rank": 30
    },
    {
        "name": "Kurkure Green Chatni",
        "category": "byob",
        "brand": "kurkure",
        "price_small": None,
        "price_large": 69,
        "description": "Minty, coriander herbaceous street chutney blast.",
        "badge": "",
        "has_wafer_options": False,
        "order_rank": 31
    },
    {
        "name": "Kurkure Chili Chataka",
        "category": "byob",
        "brand": "kurkure",
        "price_small": None,
        "price_large": 69,
        "description": "Red chili chatpata twists that pack an addictive punch.",
        "badge": "Spicy",
        "has_wafer_options": False,
        "order_rank": 32
    },

    # BYOB - Lays
    {
        "name": "Lays Masala Magic",
        "category": "byob",
        "brand": "lays",
        "price_small": 69,
        "price_large": 109,
        "description": "India's all-time favorite spicy blue packet magic chips.",
        "badge": "Best Seller",
        "has_wafer_options": False,
        "order_rank": 35
    },
    {
        "name": "Lays Chilli Lemon",
        "category": "byob",
        "brand": "lays",
        "price_small": 69,
        "price_large": None,
        "description": "Tangy lemon punch with sharp green chili zest.",
        "badge": "",
        "has_wafer_options": False,
        "order_rank": 36
    },
    {
        "name": "Lays Sizzling Hot",
        "category": "byob",
        "brand": "lays",
        "price_small": 69,
        "price_large": None,
        "description": "Intense spicy chili heat in every feather-light wafer.",
        "badge": "Extra Hot",
        "has_wafer_options": False,
        "order_rank": 37
    },

    # BYOB - Nachos
    {
        "name": "Cheese Nachos",
        "category": "byob",
        "brand": "nachos",
        "price_single": None,
        "price_small": None,
        "price_large": 149,
        "description": "Crispy corn nachos loaded with warm melted cheese dip.",
        "badge": "Cheese Flavour",
        "has_wafer_options": False,
        "order_rank": 40
    },
    {
        "name": "Jalapenos Nachos",
        "category": "byob",
        "brand": "nachos",
        "price_single": None,
        "price_small": None,
        "price_large": 149,
        "description": "Crispy corn nachos loaded with zesty pickled jalapeno peppers & cheese.",
        "badge": "Jalapeno Flavour",
        "has_wafer_options": False,
        "order_rank": 41
    },
]

def ensure_menu_seeded():
    """Ensure all menu items exist in the database."""
    if MenuItem.objects.count() == 0:
        for item in DEFAULT_MENU_ITEMS:
            MenuItem.objects.create(**item)

@api_view(['GET'])
def menu_list(request):
    """Retrieve all menu items, grouped or flat."""
    ensure_menu_seeded()
    category = request.GET.get('category')
    items = MenuItem.objects.filter(is_available=True)
    if category:
        items = items.filter(category=category)
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def order_list_create(request):
    """Get all orders or create a new order with token number."""
    if request.method == 'GET':
        orders = Order.objects.all().prefetch_related('items')
        payment_mode = request.GET.get('payment')
        status_filter = request.GET.get('status')
        if payment_mode:
            orders = orders.filter(payment_mode=payment_mode)
        if status_filter:
            orders = orders.filter(status=status_filter)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        # Auto generate token if missing
        if not data.get('token_number'):
            today_count = Order.objects.count()
            data['token_number'] = f"CY-{101 + today_count}"

        serializer = OrderSerializer(data=data)
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
def order_detail(request, pk):
    """Retrieve, update or delete an order."""
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(OrderSerializer(order).data)

    elif request.method == 'PATCH':
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        order.delete()
        return Response({'message': 'Order deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def sales_stats(request):
    """Return aggregated sales intelligence for the billing portal."""
    all_orders = Order.objects.all()
    completed_orders = all_orders.exclude(status='cancelled')

    total_revenue = completed_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_orders_count = completed_orders.count()
    cancelled_count = all_orders.filter(status='cancelled').count()

    upi_revenue = completed_orders.filter(payment_mode='upi').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    cash_revenue = completed_orders.filter(payment_mode='cash').aggregate(Sum('total_amount'))['total_amount__sum'] or 0

    # Top selling items
    top_items_raw = OrderItem.objects.filter(order__in=completed_orders) \
        .values('item_name') \
        .annotate(total_qty=Sum('quantity'), total_sales=Sum('total_price')) \
        .order_by('-total_qty')[:7]

    # Category breakdown
    category_summary = {
        'maggi': OrderItem.objects.filter(order__in=completed_orders, item_name__icontains='maggie').aggregate(Sum('quantity'))['quantity__sum'] or 0,
        'taco': OrderItem.objects.filter(order__in=completed_orders, item_name__icontains='taco').aggregate(Sum('quantity'))['quantity__sum'] or 0,
        'byob': OrderItem.objects.filter(order__in=completed_orders, category='byob').aggregate(Sum('quantity'))['quantity__sum'] or 0,
    }

    recent_orders = OrderSerializer(all_orders[:10], many=True).data

    return Response({
        'total_revenue': total_revenue,
        'total_orders': total_orders_count,
        'cancelled_orders': cancelled_count,
        'upi_revenue': upi_revenue,
        'cash_revenue': cash_revenue,
        'avg_order_value': round(total_revenue / total_orders_count) if total_orders_count > 0 else 0,
        'top_items': list(top_items_raw),
        'category_summary': category_summary,
        'recent_orders': recent_orders,
    })


@api_view(['GET'])
def export_sales_csv(request):
    """Export all sales records as CSV for festival accounting."""
    response = HttpResponse(content_type='text/csv')
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    response['Content-Disposition'] = f'attachment; filename="craveyard_sales_{timestamp}.csv"'

    writer = csv.writer(response)
    writer.writerow(['Token', 'Date & Time', 'Customer', 'Payment Mode', 'Status', 'Items Details', 'Total Amount (INR)'])

    orders = Order.objects.all().prefetch_related('items')
    for order in orders:
        items_summary = "; ".join([
            f"{it.quantity}x {it.item_name} ({it.size})" + (f" [Wafers: {', '.join(it.selected_wafers)}]" if it.selected_wafers else "")
            for it in order.items.all()
        ])
        writer.writerow([
            order.token_number,
            order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            order.customer_name or "Guest",
            order.payment_mode.upper(),
            order.status.capitalize(),
            items_summary,
            order.total_amount
        ])

    return response


@api_view(['POST'])
def reset_or_demo_data(request):
    """Option to reset sales or populate demo orders for testing."""
    action = request.data.get('action')
    if action == 'reset':
        Order.objects.all().delete()
        return Response({'message': 'All orders reset successfully.'})
    elif action == 'seed_demo':
        # Create a few demo orders
        Order.objects.all().delete()
        demos = [
            {
                "token_number": "CY-101",
                "customer_name": "Aarav Sharma",
                "payment_mode": "upi",
                "status": "completed",
                "subtotal": 149,
                "total_amount": 149,
                "items": [
                    {"item_name": "Maggie Crunch Box", "category": "maggi_taco", "size": "Regular", "unit_price": 149, "quantity": 1, "total_price": 149, "selected_wafers": ["Lays Masala", "Balaji Masala Masti"]}
                ]
            },
            {
                "token_number": "CY-102",
                "customer_name": "Pooja Patel",
                "payment_mode": "cash",
                "status": "completed",
                "subtotal": 278,
                "total_amount": 278,
                "items": [
                    {"item_name": "Classic Cheesy", "category": "maggi_taco", "size": "Regular", "unit_price": 79, "quantity": 1, "total_price": 79, "selected_wafers": []},
                    {"item_name": "Tandoori Taco Blast", "category": "maggi_taco", "size": "Regular", "unit_price": 179, "quantity": 1, "total_price": 179, "selected_wafers": []},
                    {"item_name": "Balaji Masala Masti", "category": "byob", "size": "Small", "unit_price": 59, "quantity": 1, "total_price": 59, "selected_wafers": []}
                ]
            },
            {
                "token_number": "CY-103",
                "customer_name": "Rohan & Friends",
                "payment_mode": "upi",
                "status": "completed",
                "subtotal": 357,
                "total_amount": 357,
                "items": [
                    {"item_name": "Doritos", "category": "byob", "size": "Large", "unit_price": 149, "quantity": 1, "total_price": 149, "selected_wafers": []},
                    {"item_name": "Bingo PeriPeri", "category": "byob", "size": "Large", "unit_price": 109, "quantity": 1, "total_price": 109, "selected_wafers": []},
                    {"item_name": "Balaji Flamigo", "category": "byob", "size": "Large", "unit_price": 99, "quantity": 1, "total_price": 99, "selected_wafers": []}
                ]
            }
        ]
        for demo in demos:
            items_data = demo.pop('items')
            order = Order.objects.create(**demo)
            for it in items_data:
                OrderItem.objects.create(order=order, **it)
        return Response({'message': 'Demo orders created successfully.'})
    return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
