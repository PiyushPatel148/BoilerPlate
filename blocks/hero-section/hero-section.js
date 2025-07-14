export default function decorate(block) {
  [...block.children].forEach((row, index) => {
    let iter = 0;
    if (index === 1) {
      row.classList.add('hero-content');
    }
    [...row.children].forEach((col) => {
      if (col.querySelector('picture')) {
        const picture = col.querySelector('picture');
        picture.classList.add(`hero-image-${iter}`);
        iter += 1;
      }
    });
  });

  const mediaQuery = window.matchMedia('(max-width: 768px)');

  function handleViewportChange(e) {
    if (e.matches) {
      const img = block.querySelector('.hero-image-0');
      img.style.display = 'none';
      // Screen is 480px or less

    // document.body.classList.add('mobile');
    } else {
    // Screen is wider than 480px
      const img = block.querySelector('.hero-image-0');
      img.style.display = 'block';
      document.body.classList.remove('mobile');
    }
  }

  // Initial check
  handleViewportChange(mediaQuery);

  // Listen for changes
  mediaQuery.addEventListener('change', handleViewportChange);
}
