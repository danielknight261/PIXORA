/**
 * Strip broken Design preview / Supabase URLs from cart lines.
 * Keep Personalised print reassurance for checkout.
 */
(function () {
  var PRINT_NOTE_KEY = 'Personalised print';
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
      if (k === 'personalized print' || k === 'personalised print') continue;
      if (
        k.indexOf('customization') !== -1 ||
        k.indexOf('gelato') !== -1 ||
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
      if (key.toLowerCase() === 'personalized print' || key.toLowerCase() === 'personalised print') continue;
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
    var hasNote = false;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i].toLowerCase();
      if (k === 'design preview') return true;
      if (k === 'personalized print' || k === 'personalised print') hasNote = true;
      if (isBrokenPreviewUrl(props[keys[i]])) return true;
    }
    if (isPersonalized(props) && props[PRINT_NOTE_KEY] !== PRINT_NOTE_VALUE) return true;
    if (hasNote && !isPersonalized(props)) return true;
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

  function wireProductPage() {
    var form = document.getElementById('product-form');
    if (!form) return;
    if (form.querySelector('[data-sticker-file]')) return;
    form.addEventListener(
      'submit',
      function () {
        var note = form.querySelector('input[name="properties[' + PRINT_NOTE_KEY + ']"]');
        if (!hasGelatoOrArtwork(form)) {
          if (note) note.remove();
          return;
        }
        if (!note) {
          note = document.createElement('input');
          note.type = 'hidden';
          note.name = 'properties[' + PRINT_NOTE_KEY + ']';
          form.appendChild(note);
        }
        note.value = PRINT_NOTE_VALUE;
      },
      true
    );
  }

  function hasGelatoOrArtwork(form) {
    var inputs = form.querySelectorAll('input[name^="properties["], textarea[name^="properties["]');
    for (var i = 0; i < inputs.length; i++) {
      var name = (inputs[i].name || '').toLowerCase();
      var val = String(inputs[i].value || '').trim();
      if (!val) continue;
      if (name.indexOf('personalised print') !== -1 || name.indexOf('personalized print') !== -1) continue;
      if (name.indexOf('gelato') !== -1 || name.indexOf('customization') !== -1 || name.indexOf('artwork') !== -1) {
        return true;
      }
    }
    return false;
  }

  if (document.body.classList.contains('template-cart')) wireCartPage();
  if (document.body.classList.contains('template-product')) wireProductPage();
})();
