/**
 * Strip broken Design preview / Supabase URLs from cart lines.
 * Keep Personalized print reassurance for checkout.
 */
(function () {
  var PRINT_NOTE_KEY = 'Personalized print';
  var PRINT_NOTE_VALUE =
    "We have your uploaded image and will print from the mockup you created — not the stock product photo.";

  function isBrokenPreviewUrl(val) {
    if (!val || typeof val !== 'string') return false;
    return /supabase\.co\/storage/i.test(val) || /design-previews\//i.test(val);
  }

  function looksLikeFilename(val) {
    return (
      typeof val === 'string' &&
      /\.(png|jpe?g|webp|gif)$/i.test(val.trim()) &&
      !/^https?:\/\//i.test(val)
    );
  }

  function isPersonalized(properties) {
    if (!properties) return false;
    var keys = Object.keys(properties);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i].toLowerCase();
      var val = properties[keys[i]];
      if (
        k.indexOf('customization') !== -1 ||
        k.indexOf('gelato') !== -1 ||
        k.indexOf('personal') !== -1 ||
        k === 'personalized print' ||
        k === 'artwork' ||
        k === 'artwork name' ||
        looksLikeFilename(val)
      ) {
        return true;
      }
    }
    return false;
  }

  function cleanedProperties(properties) {
    var props = {};
    var keys = Object.keys(properties || {});
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = properties[key];
      if (key.toLowerCase() === 'design preview') continue;
      if (isBrokenPreviewUrl(val)) continue;
      props[key] = val;
    }
    if (isPersonalized(Object.assign({}, properties, props))) {
      props[PRINT_NOTE_KEY] = PRINT_NOTE_VALUE;
    }
    return props;
  }

  function needsCleanup(properties) {
    var props = properties || {};
    var keys = Object.keys(props);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === 'design preview') return true;
      if (isBrokenPreviewUrl(props[keys[i]])) return true;
    }
    if (isPersonalized(props) && props[PRINT_NOTE_KEY] !== PRINT_NOTE_VALUE) return true;
    return false;
  }

  function updateLine(item, props) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: item.key,
        quantity: item.quantity,
        properties: props
      })
    }).then(function (r) {
      return r.ok;
    });
  }

  function wireCartPage() {
    fetch('/cart.js')
      .then(function (r) {
        return r.json();
      })
      .then(function (cart) {
        if (!cart.items || !cart.items.length) return;
        var updates = cart.items.map(function (item) {
          if (!needsCleanup(item.properties || {})) return Promise.resolve(false);
          return updateLine(item, cleanedProperties(item.properties));
        });
        return Promise.all(updates).then(function (results) {
          if (results.some(Boolean)) window.location.reload();
        });
      })
      .catch(function () {});
  }

  function ensurePrintNoteInput(form) {
    if (!form) return;
    var bad = form.querySelectorAll(
      'input[name="properties[Design preview]"], input[name="properties[design preview]"]'
    );
    for (var i = 0; i < bad.length; i++) bad[i].remove();

    var existing = form.querySelector('input[name="properties[' + PRINT_NOTE_KEY + ']"]');
    if (!existing) {
      existing = document.createElement('input');
      existing.type = 'hidden';
      existing.name = 'properties[' + PRINT_NOTE_KEY + ']';
      form.appendChild(existing);
    }
    existing.value = PRINT_NOTE_VALUE;
  }

  function wireProductPage() {
    var form = document.getElementById('product-form');
    if (!form) return;
    if (form.querySelector('[data-sticker-file]')) return;
    ensurePrintNoteInput(form);
    form.addEventListener(
      'submit',
      function () {
        ensurePrintNoteInput(form);
      },
      true
    );
  }

  if (document.body.classList.contains('template-cart')) wireCartPage();
  if (document.body.classList.contains('template-product')) wireProductPage();
})();
