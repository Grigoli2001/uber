const profileDiv = document.getElementById('profileDiv');
const dropDownMenu = document.getElementById('dropDownMenu');

profileDiv.addEventListener('mouseenter', () => {
  dropDownMenu.classList.toggle('hidden');
  dropDownMenu.classList.toggle('show');
});

profileDiv.addEventListener('mouseleave', () => {
  dropDownMenu.classList.toggle('hidden');
  dropDownMenu.classList.toggle('show');
});

dropDownMenu.addEventListener('mouseenter', () => {
  dropDownMenu.classList.toggle('hidden');
  dropDownMenu.classList.toggle('show');
});

dropDownMenu.addEventListener('mouseleave', () => {
  dropDownMenu.classList.toggle('hidden');
  dropDownMenu.classList.toggle('show');
});
