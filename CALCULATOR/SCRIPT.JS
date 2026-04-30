// Get display element
let display = document.getElementById("display");

// Add value to display
function addValue(value) {
  display.value += value; // Append clicked value
}

// Clear display
function clearDisplay() {
  display.value = ""; // Empty the screen
}

// Calculate result
function calculate() {
  try {
    display.value = eval(display.value); // Evaluate expression
  } catch {
    display.value = "Error"; // Handle invalid input
  }
}
