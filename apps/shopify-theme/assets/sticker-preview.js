/**
 * Prodigi PDP: require a JPG/PNG upload. No live mockup overlay.
 */
(function () {
  var fileInput = document.querySelector('[data-sticker-file]');
  if (!fileInput) return;

  var product = fileInput.closest('.product') || document;
  var filenameInput = product.querySelector('[data-sticker-filename]');
  var statusEl = product.querySelector('[data-sticker-status]');
  var addBtn = product.querySelector('[data-add-to-cart]');
  var form = product.querySelector('#product-form') || fileInput.form;
  var MAX_BYTES = 15 * 1024 * 1024;

  if (form) form.setAttribute('enctype', 'multipart/form-data');

  function setReady(ready) {
    if (!addBtn) return;
    addBtn.setAttribute('data-sticker-ready', ready ? 'true' : 'false');
    if (/sold out/i.test((addBtn.textContent || '').trim())) {
      addBtn.disabled = true;
      return;
    }
    addBtn.disabled = !ready;
    addBtn.textContent = 'Add to cart';
  }

  function onFile() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      if (filenameInput) filenameInput.value = '';
      if (statusEl) {
        statusEl.hidden = true;
        statusEl.textContent = '';
      }
      setReady(false);
      return;
    }

    var okType =
      /image\/(jpeg|jpg|png)/i.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!okType) {
      fileInput.value = '';
      if (filenameInput) filenameInput.value = '';
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = 'Please upload a JPG or PNG.';
      }
      setReady(false);
      return;
    }

    if (file.size > MAX_BYTES) {
      fileInput.value = '';
      if (filenameInput) filenameInput.value = '';
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = 'That file is too large. Please use a photo under 15 MB.';
      }
      setReady(false);
      return;
    }

    if (filenameInput) filenameInput.value = file.name;
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = file.name + ' attached. We’ll mock up and confirm before dispatch.';
    }
    setReady(true);
  }

  fileInput.addEventListener('change', onFile);

  if (form) {
    form.addEventListener(
      'submit',
      function (e) {
        if (!fileInput.files || !fileInput.files[0]) {
          e.preventDefault();
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = 'Please upload a JPG or PNG first.';
          }
          fileInput.focus();
        }
      },
      true
    );
  }

  setReady(false);
})();
