/**
 * Gelato PDPs: Add to cart and Personalize both open the designer
 * until a design is on the form. Native Add to cart stays in the DOM
 * so Gelato can still submit .btn-addtocart after upload.
 */
(function () {
  if (!document.body.classList.contains('template-product')) return;
  if (document.querySelector('[data-sticker-file]')) return;

  var gate = document.querySelector('[data-personalize-gate]');
  if (!gate) return;

  var form = gate.tagName === 'FORM' ? gate : gate.closest('form') || document.getElementById('product-form');
  if (!form) return;

  var addBtn = form.querySelector('[data-add-to-cart]');
  var slot = form.querySelector('[data-personalize-slot]');
  var trigger = form.querySelector('[data-personalize-trigger]');
  var root = document.querySelector('.main-product') || document;

  function hasDesign() {
    var inputs = form.querySelectorAll('input[name^="properties["], textarea[name^="properties["]');
    for (var i = 0; i < inputs.length; i++) {
      var name = (inputs[i].name || '').toLowerCase();
      var val = String(inputs[i].value || '').trim();
      if (!val) continue;
      if (name.indexOf('personalised print') !== -1 || name.indexOf('personalized print') !== -1) continue;
      if (name.indexOf('gelato') !== -1 || name.indexOf('customization') !== -1) return true;
      if (name.indexOf('artwork') !== -1) return true;
    }
    return false;
  }

  function isOurControl(el) {
    return (
      el === trigger ||
      el === addBtn ||
      (el.classList && el.classList.contains('btn-addtocart')) ||
      el.hasAttribute('data-add-to-cart') ||
      el.hasAttribute('data-personalize-trigger')
    );
  }

  function looksLikePersonalize(el) {
    if (!el || el.nodeType !== 1) return false;
    if (isOurControl(el)) return false;
    if (el.closest && el.closest('.pdp-sticky-bar')) return false;
    var tag = el.tagName;
    if (tag !== 'BUTTON' && tag !== 'A' && el.getAttribute('role') !== 'button') return false;
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    var cls = String(el.className || '').toLowerCase();
    var label = String(el.getAttribute('aria-label') || '').toLowerCase();
    if (cls.indexOf('upload') !== -1 || text.indexOf('upload') !== -1) return false;
    return (
      text.indexOf('personalize') !== -1 ||
      text.indexOf('personalise') !== -1 ||
      cls.indexOf('personalize') !== -1 ||
      cls.indexOf('personalise') !== -1 ||
      (cls.indexOf('gelato') !== -1 && text.indexOf('add') === -1) ||
      label.indexOf('personalize') !== -1 ||
      label.indexOf('personalise') !== -1
    );
  }

  function findGelatoButton() {
    var nodes = root.querySelectorAll('button, a, [role="button"]');
    for (var i = 0; i < nodes.length; i++) {
      if (looksLikePersonalize(nodes[i])) return nodes[i];
    }
    return null;
  }

  function openPersonalize() {
    var gelato = findGelatoButton();
    if (gelato && gelato !== trigger) {
      gelato.click();
      return;
    }
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      gelato = findGelatoButton();
      if (gelato && gelato !== trigger) {
        clearInterval(timer);
        gelato.click();
      } else if (attempts > 20) {
        clearInterval(timer);
      }
    }, 150);
  }

  function placeGelatoButton() {
    if (!slot) return;
    var gelato = findGelatoButton();
    if (!gelato) return;
    if (slot.contains(gelato)) {
      if (trigger) trigger.hidden = true;
      return;
    }
    slot.appendChild(gelato);
    if (trigger) trigger.hidden = true;
  }

  function blockNativeAdd(e) {
    if (hasDesign()) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    openPersonalize();
  }

  form.addEventListener('submit', blockNativeAdd, true);
  if (addBtn) {
    addBtn.addEventListener('click', blockNativeAdd, true);
  }
  if (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openPersonalize();
    });
  }

  placeGelatoButton();
  var observer = new MutationObserver(function () {
    placeGelatoButton();
  });
  observer.observe(root, { childList: true, subtree: true });
})();
