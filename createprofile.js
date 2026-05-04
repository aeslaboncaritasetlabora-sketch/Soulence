// Gender button functionality
const genderBtns = document.querySelectorAll('.gender-btn');
genderBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    genderBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// Start function to initialize the page
function start() {
  console.log('Page initialized');
  // Add any initialization logic here
}

// Call the start function when the page loads
window.onload = start;