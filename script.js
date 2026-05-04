document.addEventListener("DOMContentLoaded", () => {
  const signoutBtn = document.getElementById("signoutBtn");
  const overlay = document.getElementById("overlay");
  const cancelBtn = document.getElementById("cancelBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  function openModal() {
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  }

  signoutBtn.addEventListener("click", openModal);

  signoutBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal();
    }
  });

  cancelBtn.addEventListener("click", closeModal);

  confirmBtn.addEventListener("click", () => {
    alert("Logging out...");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) {
      closeModal();
    }
  });
});
