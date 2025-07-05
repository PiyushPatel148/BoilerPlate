export default function decorate(block) {
  [...block.children].forEach((row) => {
    let iter = 0;
    [...row.children].forEach((col) => {
      if (col.querySelector('picture')) {
        const picture = col.querySelector('picture');
        picture.classList.add(`hero-image-${iter}`);
        iter += 1;
      }
    });
  });
}
