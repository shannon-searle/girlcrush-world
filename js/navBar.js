const starConnectors = document.querySelectorAll(".nav-star-connector");

starConnectors.forEach(star => {
    star.addEventListener("mouseenter", () => {
        if (star.classList.contains("spin")) return;

        star.classList.remove("spin");
        void star.offsetWidth; // reset animation
        star.classList.add("spin");

        star.addEventListener("animationend", () => {
            star.classList.remove("spin");
        }, { once: true });
    });
});