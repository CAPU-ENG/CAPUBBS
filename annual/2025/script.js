'use strict';

document.querySelectorAll('.story-toggle').forEach(function (button) {
    var note = document.getElementById(button.getAttribute('aria-controls'));
    if (!note) return;
    button.hidden = false;
    button.addEventListener('click', function () {
        var expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        button.textContent = expanded ? '展开札记' : '收起札记';
        note.hidden = expanded;
    });
});
