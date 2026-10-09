from django.db import models

class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('maggi_taco', 'Maggi & Taco'),
        ('byob', 'BYOB Section'),
    ]

    name = models.CharField(max_length=150)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=50, blank=True, help_text="e.g. balaji, lays, kurkure, bingo, doritos, nachos, taco, maggie")
    price_single = models.IntegerField(null=True, blank=True, help_text="Price when item has single fixed price")
    price_small = models.IntegerField(null=True, blank=True, help_text="Small size price for BYOB")
    price_large = models.IntegerField(null=True, blank=True, help_text="Large size price for BYOB")
    description = models.TextField(blank=True)
    badge = models.CharField(max_length=50, blank=True)
    has_wafer_options = models.BooleanField(default=False, help_text="True for Maggie Crunch Box")
    is_available = models.BooleanField(default=True)
    order_rank = models.IntegerField(default=0)

    class Meta:
        ordering = ['order_rank', 'id']

    def __str__(self):
        return f"{self.name} ({self.category})"


class Order(models.Model):
    PAYMENT_CHOICES = [
        ('upi', 'UPI'),
        ('cash', 'Cash'),
    ]

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('preparing', 'Preparing'),
        ('cancelled', 'Cancelled'),
    ]

    token_number = models.CharField(max_length=20, unique=True)
    customer_name = models.CharField(max_length=100, blank=True, default="Guest")
    customer_phone = models.CharField(max_length=20, blank=True)
    payment_mode = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='upi')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    subtotal = models.IntegerField(default=0)
    discount = models.IntegerField(default=0)
    total_amount = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Token #{self.token_number} - ₹{self.total_amount} ({self.payment_mode})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=150)
    category = models.CharField(max_length=50, blank=True)
    size = models.CharField(max_length=20, blank=True, default="Regular")
    unit_price = models.IntegerField(default=0)
    quantity = models.IntegerField(default=1)
    total_price = models.IntegerField(default=0)
    selected_wafers = models.JSONField(default=list, blank=True)
    notes = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.item_name} ({self.size})"
