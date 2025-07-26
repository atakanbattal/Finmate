
// Test script to navigate to Goals page
console.log('Navigating to Goals page...');
// Try to find React component and trigger navigation
const buttons = document.querySelectorAll('button');
const goalsButton = Array.from(buttons).find(btn => btn.textContent.includes('Hedefler'));
if (goalsButton) {
  console.log('Found Goals button, clicking...');
  goalsButton.click();
} else {
  console.log('Goals button not found');
}

