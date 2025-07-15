export default async function decorate(block) {
  const container = block.closest('.success-screen-container') || block;

  // Hide the container initially
  container.style.setProperty('display', 'none');

  function showSuccessScreen() {
    // Prevent background scroll
    document.body.classList.add('success-modal-open');
    container.style.setProperty('display', 'flex');
    setTimeout(() => {
      container.style.setProperty('display', 'none');
      document.body.classList.remove('success-modal-open');
    }, 3000);
  }

  window.addEventListener('orderPlaced', showSuccessScreen);
}
