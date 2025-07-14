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
}
