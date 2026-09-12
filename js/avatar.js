/* ------------------------------------------
    Avatar dress-up: click a swatch, swap that layer's image
------------------------------------------ */
document.querySelectorAll('[data-layer]').forEach(button => {
    button.addEventListener('click', function () {
        document.getElementById(this.dataset.layer).src = this.dataset.src;
    });
});
