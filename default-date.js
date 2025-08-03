document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("inspection_date");
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
});