// Show toast notification
function showCartNotification() {
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = '✅ Item added to cart';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

export default async function decorate(block) {
  const classList = ['food-image', 'food-type', 'menu-food-name', 'price-name', 'food-category'];

  [...block.children].forEach((row) => {
    row.classList.add('food-card');
    const cols = [...row.children];

    // Assign column classes
    cols.forEach((col, index) => {
      col.classList.add(classList[index]);
    });

    // Set data attributes and category styling
    if (cols.length >= 5) {
      const categoryText = cols[4].textContent.trim().toLowerCase();

      row.setAttribute('data-type', cols[1].textContent.trim());
      row.setAttribute('data-name', cols[2].textContent.trim());
      row.setAttribute('data-price', cols[3].textContent.trim());
      row.setAttribute('data-image', cols[0].querySelector('img')?.src || '');
      row.setAttribute('data-category', categoryText);

      // Add class only to the category column
      if (categoryText === 'veg') {
        cols[4].classList.add('veg-item');
      } else {
        cols[4].classList.add('non-veg-item');
      }
    }

    // Wrap food details inside a container
    const foodDescWrapper = document.createElement('div');
    foodDescWrapper.classList.add('food-description');

    for (let i = 1; i <= 3; i += 1) {
      foodDescWrapper.appendChild(cols[i]);
    }

    const referenceNode = row.querySelector('.food-image');
    referenceNode.after(foodDescWrapper);
  });

  function getCartItems() {
    const cart = localStorage.getItem('cartItems');
    return cart ? JSON.parse(cart) : [];
  }

  function updateCartBadge() {
    const cartItems = getCartItems();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'cartItems') updateCartBadge();
  });
  window.addEventListener('cartUpdated', updateCartBadge);
  document.addEventListener('DOMContentLoaded', updateCartBadge);

  function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  function addToCart(item) {
    const cartItems = getCartItems();
    const existing = cartItems.find((ci) => ci.name === item.name);

    let { price } = item;
    if (typeof price === 'string') {
      const match = price.match(/(\d+(\.\d+)?)/);
      price = match ? parseFloat(match[1]) : 0;
    }

    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({
        id: Date.now(),
        name: item.name,
        price,
        quantity: 1,
        image: item.image,
        type: item.type,
      });
    }
    saveCartItems(cartItems);
    showCartNotification();
  }

  const foodItems = document.querySelectorAll('.food-card');
  foodItems.forEach((foodItem) => {
    foodItem.addEventListener('mouseenter', () => {
      const orderButton = document.createElement('button');
      orderButton.textContent = 'Order Now';
      orderButton.className = 'order-now-button';
      orderButton.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart({
          name: foodItem.dataset.name,
          price: foodItem.dataset.price,
          type: foodItem.dataset.type,
          image: foodItem.dataset.image,
        });
      });
      foodItem.appendChild(orderButton);
    });

    foodItem.addEventListener('mouseleave', () => {
      const btn = foodItem.querySelector('.order-now-button');
      if (btn) btn.remove();
    });
  });
}
