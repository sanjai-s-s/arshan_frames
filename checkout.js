(function () {
  'use strict';

  var order = CadreOrderFlow.getOrder();
  var customer = CadreOrderFlow.getCustomer();

  var payBtn = document.getElementById('payBtn');

  if (!order || !customer) {
    // Nothing to check out — send the customer back to the right step.
    if (payBtn) payBtn.disabled = true;
  }

  // ---------- Order block ----------
  function renderOrderBlock() {
    var photoImg = document.getElementById('checkoutPhoto');
    var photoPlaceholder = document.getElementById('checkoutPhotoPlaceholder');
    var specs = document.getElementById('checkoutSpecs');

    if (!order) {
      specs.innerHTML = '<p class="empty-note">No order found. <a href="configurator.html">Start building your frame</a>.</p>';
      return;
    }

    if (order.photo) {
      photoImg.src = order.photo;
      photoImg.hidden = false;
      photoPlaceholder.hidden = true;
    }

    specs.innerHTML =
      '<dl class="summary-row"><dt>Frame</dt><dd>' + order.frameLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Colour</dt><dd>' + order.colourLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Size</dt><dd>' + order.sizeLabel + ' \u00b7 ' + order.sizeDim + '</dd></dl>' +
      '<dl class="summary-row"><dt>Quantity</dt><dd>' + order.qty + '</dd></dl>';
  }

  // ---------- Customer block ----------
  function renderCustomerBlock() {
    var el = document.getElementById('checkoutCustomer');
    if (!customer) {
      el.innerHTML = '<p class="empty-note">No details found. <a href="customer-details.html">Add your details</a>.</p>';
      return;
    }

    var rows =
      '<dl class="summary-row"><dt>Name</dt><dd>' + escapeHtml(customer.fullName) + '</dd></dl>' +
      '<dl class="summary-row"><dt>Mobile</dt><dd>' + escapeHtml(customer.mobile) + '</dd></dl>';

    if (customer.email) {
      rows += '<dl class="summary-row"><dt>Email</dt><dd>' + escapeHtml(customer.email) + '</dd></dl>';
    }

    rows +=
      '<dl class="summary-row"><dt>Address</dt><dd>' + escapeHtml(customer.address) + '</dd></dl>' +
      '<dl class="summary-row"><dt>City</dt><dd>' + escapeHtml(customer.city) + '</dd></dl>' +
      '<dl class="summary-row"><dt>State</dt><dd>' + escapeHtml(customer.state) + '</dd></dl>' +
      '<dl class="summary-row"><dt>Pincode</dt><dd>' + escapeHtml(customer.pincode) + '</dd></dl>';

    if (customer.notes) {
      rows += '<dl class="summary-row"><dt>Notes</dt><dd>' + escapeHtml(customer.notes) + '</dd></dl>';
    }

    el.innerHTML = rows;
  }

  // ---------- Final summary sidebar ----------
  function renderFinalSummary() {
    var body = document.getElementById('finalSummaryBody');
    if (!order) return; // placeholder already in markup

    body.innerHTML =
      '<dl class="summary-row"><dt>Frame</dt><dd>' + order.frameLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Colour</dt><dd>' + order.colourLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Size</dt><dd>' + order.sizeLabel + '</dd></dl>' +
      '<dl class="summary-row"><dt>Quantity</dt><dd>' + order.qty + '</dd></dl>' +
      '<div class="summary-divider"></div>' +
      '<dl class="summary-row total"><dt>Total</dt><dd>' + CadreOrderFlow.formatRupees(order.total) + '</dd></dl>';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  renderOrderBlock();
  renderCustomerBlock();
  renderFinalSummary();

  // ---------- Placeholder payment ----------
  if (payBtn) {
    payBtn.addEventListener('click', function () {
      if (payBtn.disabled) return;
      // Cashfree integration will be wired up here later.
      payBtn.classList.add('is-loading');
      var label = payBtn.querySelector('span');
      var originalText = label ? label.textContent : '';
      if (label) label.textContent = 'Redirecting…';
      setTimeout(function () {
        payBtn.classList.remove('is-loading');
        if (label) label.textContent = originalText;
        alert('Cashfree payment integration is not yet connected. This button is a placeholder.');
      }, 500);
    });
  }
})();
