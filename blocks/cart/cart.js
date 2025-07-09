export default async function decorate(block) {
  // Helper to get cart items
  function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
  }
  // Helper to save cart items and refresh UI
  function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  // Render the cart UI
  function renderCart() {
    const cartItems = getCartItems();
    const cartDiv = block.querySelector('.cart > div:last-child > div');
    if (!cartDiv) {
      return;
    }
    cartDiv.classList.add('cart-items-container');
    cartDiv.innerHTML = '';

    if (cartItems.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-cart-container';
      emptyDiv.textContent = 'Your cart is empty.';
      cartDiv.appendChild(emptyDiv);
      return;
    }

    cartItems.forEach((item, idx) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';

      // Image
      const img = document.createElement('img');
      //   img.src = item.image || 'http://localhost:3000/media_19c7df6bf8549e24c7cf93e09675aae2139561fa6.png?width=750&format=png&optimize=medium';
      img.src = item.image;
      img.alt = item.name;
      itemDiv.appendChild(img);

      // Details
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'cart-item-details';

      // Name
      const name = document.createElement('div');
      name.textContent = item.name;
      detailsDiv.appendChild(name);

      // Price
      const price = document.createElement('div');
      price.textContent = `₹${Number(item.price).toFixed(2)}`;
      detailsDiv.appendChild(price);

      itemDiv.appendChild(detailsDiv);

      // Quantity controls
      const qtyDiv = document.createElement('div');
      qtyDiv.className = 'cart-qty-controls';

      const minusBtn = document.createElement('button');
      minusBtn.textContent = '−';
      minusBtn.className = 'cart-qty-btn';
      minusBtn.onclick = () => {
        if (item.quantity > 1) {
          item.quantity -= 1;
          cartItems[idx] = item;
          saveCartItems(cartItems);
          renderCart();
        }
      };

      const qtySpan = document.createElement('span');
      qtySpan.textContent = item.quantity;
      qtySpan.className = 'cart-qty-value';

      const plusBtn = document.createElement('button');
      plusBtn.textContent = '+';
      plusBtn.className = 'cart-qty-btn';
      plusBtn.onclick = () => {
        item.quantity += 1;
        cartItems[idx] = item;
        saveCartItems(cartItems);
        renderCart();
      };

      qtyDiv.appendChild(minusBtn);
      qtyDiv.appendChild(qtySpan);
      qtyDiv.appendChild(plusBtn);

      itemDiv.appendChild(qtyDiv);

      // Item total price (for this item only)
      const itemTotal = document.createElement('div');
      const totalPrice = Number(item.price) * item.quantity;
      itemTotal.textContent = `₹${totalPrice.toFixed(2)}`;
      itemTotal.className = 'cart-item-total';
      itemDiv.appendChild(itemTotal);

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.className = 'cart-remove-btn';
      removeBtn.title = 'Remove item';
      removeBtn.onclick = () => {
        cartItems.splice(idx, 1);
        saveCartItems(cartItems);
        renderCart();
      };
      itemDiv.appendChild(removeBtn);

      cartDiv.appendChild(itemDiv);
    });
  }

  // Listen for cart updates from anywhere
  window.addEventListener('cartUpdated', renderCart);

  // Initial render
  renderCart();
}
