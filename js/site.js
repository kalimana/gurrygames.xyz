/* Gurry Games — the only script on the site. Prints the current year in the footer. */
(function () {
  'use strict';

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();