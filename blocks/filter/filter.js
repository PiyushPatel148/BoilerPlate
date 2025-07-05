export default async function decorate(block) {
  // Add class to the filter button container
  const filterButton = block.firstElementChild;
  filterButton.classList.add('filter-buttons');

  // Select all filter buttons (assuming structure: .filter-buttons > div > p)
  const filterButtons = block.querySelectorAll('.filter-buttons > div > p');

  // Function to update food items based on filter
  function filterFoodItems(filter) {
    const foodItems = document.querySelectorAll('.food-card');
    foodItems.forEach((foodItem) => {
      const type = foodItem.dataset.type?.toLowerCase() || '';
      if (filter === 'all' || type === filter) {
        foodItem.style.display = '';
      } else {
        foodItem.style.display = 'none';
      }
    });
  }

  // Add click event to each filter button
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Remove 'active' class from all buttons, add to clicked button
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.textContent.trim().toLowerCase();
      filterFoodItems(filter);
    });
  });

  // Optionally, activate the first filter by default
  if (filterButtons.length) {
    filterButtons[0].classList.add('active');
    filterFoodItems(filterButtons[0].textContent.trim().toLowerCase());
  }
}
