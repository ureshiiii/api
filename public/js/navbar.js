// NAVBAR ATAS
const toggleButton = document.querySelector(".toggle-button");
const mainMenu = document.querySelector(".main-menu");
const overlay = document.querySelector(".overlay");
const submenuToggles = document.querySelectorAll(".submenu-toggle");

toggleButton.addEventListener("click", () => {
  mainMenu.classList.toggle("active");
  overlay.classList.toggle("active");

  if (mainMenu.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

overlay.addEventListener("click", () => {
  mainMenu.classList.remove("active");
  overlay.classList.remove("active");

  document.body.style.overflow = "";
});

submenuToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    const parentMenu = toggle.parentElement;
    const submenu = parentMenu.querySelector(".submenu");
    const link = toggle.querySelector("a");

    if (parentMenu.classList.contains("active")) {
      submenu.classList.add("fade-out");
      setTimeout(() => {
        submenu.classList.remove("fade-out");
        parentMenu.classList.remove("active");
        if (link) link.classList.remove("hover-reset");
      }, 500);
    } else {
      parentMenu.classList.add("active");
    }

    submenuToggles.forEach((otherToggle) => {
      if (otherToggle !== toggle && otherToggle.parentElement.classList.contains("active")) {
        const otherParentMenu = otherToggle.parentElement;
        const otherSubmenu = otherParentMenu.querySelector(".submenu");
        const otherLink = otherToggle.querySelector("a");

        otherSubmenu.classList.add("fade-out");
        setTimeout(() => {
          otherSubmenu.classList.remove("fade-out");
          otherParentMenu.classList.remove("active");
          if (otherLink) otherLink.classList.remove("hover-reset");

        }, 500);
      }
    });
  });
});

// NAVBAR BAWAHHH
let isScrolling;
const bottomBar = document.getElementById('bottom-bar');

window.addEventListener('scroll', () => {
    bottomBar.classList.add('hide');
    bottomBar.classList.remove('show');

    clearTimeout(isScrolling);

    isScrolling = setTimeout(() => {
        bottomBar.classList.remove('hide');
        bottomBar.classList.add('show');
    }, 1000); // Menunggu 1 detik setelah scrolling berhenti
});