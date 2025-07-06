export default async function decorate(block) {
  const classList = ['food-image', 'food-type', 'menu-food-name', 'price-name'];

  [...block.children].forEach((row) => {
    row.classList.add('food-card');
    [...row.children].forEach((col, index) => {
      col.classList.add(classList[index]);
    });

    // Add data attributes using the same variable names
    const cols = [...row.children];
    if (cols.length >= 4) {
      row.setAttribute('data-type', cols[1].textContent.trim());
      row.setAttribute('data-name', cols[2].textContent.trim());
      row.setAttribute('data-price', cols[3].textContent.trim());
      row.setAttribute('data-image', cols[0].querySelector('img')?.src || '');
    }

    const foodDescWrapper = document.createElement('div');
    foodDescWrapper.classList.add('food-description');

    // Append clones of the elements into the new wrapper
    // and remove the originals from the row
    for (let i = 1; i <= 3; i += 1) {
      const col = cols[i];
      foodDescWrapper.appendChild(col); // move the original node
    }

    // Insert the wrapper after the first column
    const referenceNode = row.querySelector('.food-image');
    referenceNode.after(foodDescWrapper);
  });

  function getCartItems() {
    const cart = localStorage.getItem('cartItems');
    return cart ? JSON.parse(cart) : [];
  }

  // Count up all item quantities and update the little badge next to the cart icon.
  // If there are zero items, hide the badge.
  function updateCartBadge() {
    const cartItems = getCartItems();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  }

  // Whenever localStorage changes in this or another tab dispatch a "cartUpdated" event
  window.addEventListener('storage', (e) => {
    if (e.key === 'cartItems') updateCartBadge();
  });
  window.addEventListener('cartUpdated', updateCartBadge);
  document.addEventListener('DOMContentLoaded', updateCartBadge);

  // Save the given cart items array back to localStorage,
  // then a custom event so any open page knows to refresh its badge.
  function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  // Add one product to the cart.
  // Otherwise, add it as a new entry.
  function addToCart(item) {
    const cartItems = getCartItems();
    const existing = cartItems.find((ci) => ci.name === item.name);

    // Extract numeric price from string like "Price :149"
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
    // showCartNotification();
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
