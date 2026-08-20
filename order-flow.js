// Shared helpers used by customer-details.js and checkout.js
var CadreOrderFlow = (function () {
  'use strict';

  function formatRupees(n) {
    return '\u20b9' + Number(n).toLocaleString('en-IN');
  }

  function getOrder() {
    try {
      var raw = sessionStorage.getItem('cadre_order');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function getCustomer() {
    try {
      var raw = sessionStorage.getItem('cadre_customer');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function saveCustomer(data) {
    try {
      sessionStorage.setItem('cadre_customer', JSON.stringify(data));
      return true;
    } catch (err) {
      return false;
    }
  }

  return {
    formatRupees: formatRupees,
    getOrder: getOrder,
    getCustomer: getCustomer,
    saveCustomer: saveCustomer
  };
})();
