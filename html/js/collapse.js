document.addEventListener('DOMContentLoaded', function () {
    // For each collapsible section, set up event listeners
    const collapses = document.querySelectorAll('.collapse');
    collapses.forEach(function (collapse) {
        const btn = document.querySelector('[data-bs-target="#' + collapse.id + '"]');
        if (btn) {
            collapse.addEventListener('shown.bs.collapse', function () {
                btn.textContent = 'Show less';
            });
            collapse.addEventListener('hidden.bs.collapse', function () {
                btn.textContent = 'Show more';
            });
        }
    });
});