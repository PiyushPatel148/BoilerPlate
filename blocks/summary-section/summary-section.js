export default async function decorate(block) {
  function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
  }

  function updateSummary() {
    const cartItems = getCartItems();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Find all <div> with <p> for values
    const summaryDivs = block.querySelectorAll('div > div > p');

    // Items count (second <div> > <p>)
    if (summaryDivs[1]) summaryDivs[1].textContent = totalItems;

    if (summaryDivs[3]) summaryDivs[3].textContent = `₹${subtotal.toFixed(2)}`;

    if (summaryDivs[5]) summaryDivs[5].textContent = `₹${tax.toFixed(2)}`;

    if (summaryDivs[7]) summaryDivs[7].textContent = `₹${total.toFixed(2)}`;

    // Dispatch event so other blocks can update if needed
    window.dispatchEvent(new Event('summaryUpdated'));
  }

  // Listen for cart updates
  window.addEventListener('cartUpdated', updateSummary);
  document.addEventListener('DOMContentLoaded', updateSummary);

  // Initial update
  updateSummary();

  [...block.children].forEach((row, i) => {
    if (i === 5) {
      row.classList.add('place-order-button');
      row.style.cursor = 'pointer';
      row.onclick = () => {
        const cartItems = getCartItems();
        if (!cartItems.length) {
          // Optionally, show an error or shake the button

          // alert('Your cart is empty!');

          return;
        }
        // Clear cart in localStorage
        localStorage.setItem('cartItems', JSON.stringify([]));
        window.dispatchEvent(new Event('cartUpdated'));
        // Show success modal
        window.dispatchEvent(new Event('orderPlaced'));
      };
    }
    if (i !== 0) {
      row.classList.add('summary-row');
    } else {
      row.classList.add('summary-heading');
    }
  });
}
