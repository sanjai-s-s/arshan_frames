(function () {
  'use strict';

  var order = CadreOrderFlow.getOrder();

  // ---------- Mini order summary ----------
  function renderMiniSummary() {
    var body = document.getElementById('miniSummaryBody');
    if (!order) return; // placeholder "empty" markup already in the HTML

    var photoHtml = order.photo
      ? '<div class="mini-photo"><img src="' + order.photo + '" alt="Your uploaded photo"></div>'
      : '';

    body.innerHTML =
      photoHtml +
      '<dl class="summary-row"><dt>Frame</dt><dd>' + order.frameLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Colour</dt><dd>' + order.colourLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Size</dt><dd>' + order.sizeLabel + ' \u00b7 ' + order.sizeDim + '</dd></dl>' +
      '<dl class="summary-row"><dt>Quantity</dt><dd>' + order.qty + '</dd></dl>' +
      '<div class="summary-divider"></div>' +
      '<dl class="summary-row total"><dt>Total</dt><dd>' + CadreOrderFlow.formatRupees(order.total) + '</dd></dl>';
  }
  renderMiniSummary();

  // ---------- Validation ----------
  var form = document.getElementById('detailsForm');

  var fields = {
    fullName: { required: true },
    mobile: { required: true, validate: validateMobile, message: 'Enter a valid 10-digit mobile number.' },
    email: { required: false, validate: validateEmail, message: 'Enter a valid email address.' },
    address: { required: true },
    city: { required: true },
    state: { required: true },
    pincode: { required: true, validate: validatePincode, message: 'Enter a valid 6-digit pincode.' }
  };

  function validateMobile(value) {
    return /^[6-9]\d{9}$/.test(value.trim());
  }

  function validateEmail(value) {
    if (!value.trim()) return true; // optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validatePincode(value) {
    return /^\d{6}$/.test(value.trim());
  }

  function setError(name, message) {
    var input = document.getElementById(name);
    var field = input.closest('.field');
    var errEl = document.getElementById('err-' + name);
    if (message) {
      field.classList.add('has-error');
      errEl.textContent = message;
    } else {
      field.classList.remove('has-error');
      errEl.textContent = '';
    }
  }

  function validateField(name) {
    var rule = fields[name];
    var input = document.getElementById(name);
    var value = input.value || '';

    if (rule.required && !value.trim()) {
      setError(name, 'This field is required.');
      return false;
    }
    if (rule.validate && !rule.validate(value)) {
      setError(name, rule.message);
      return false;
    }
    setError(name, '');
    return true;
  }

  Object.keys(fields).forEach(function (name) {
    var input = document.getElementById(name);
    input.addEventListener('blur', function () { validateField(name); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('has-error')) {
        validateField(name);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = true;
    Object.keys(fields).forEach(function (name) {
      if (!validateField(name)) valid = false;
    });

    if (!valid) {
      var firstError = form.querySelector('.field.has-error input, .field.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    var customer = {
      fullName: document.getElementById('fullName').value.trim(),
      mobile: document.getElementById('mobile').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      pincode: document.getElementById('pincode').value.trim(),
      notes: document.getElementById('notes').value.trim()
    };

    CadreOrderFlow.saveCustomer(customer);
    window.location.href = 'checkout.html';
  });
})();
