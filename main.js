// Add JS here

document.addEventListener('DOMContentLoaded', function() {
  var leadFormModalElement = document.getElementById('leadFormModal');
  var leadFormModal = new bootstrap.Modal(leadFormModalElement);
  var minimizedLeadForm = document.getElementById('minimizedLeadForm');
  var minimizeModalButton = document.getElementById('minimizeModal');
  var showModalIcon = document.getElementById('showModalIcon');

  // Show modal on page load
  // leadFormModal.show();

  // Handle minimize button click
  minimizeModalButton.addEventListener('click', function() {
    leadFormModal.hide();
    minimizedLeadForm.style.display = 'block';
  });

  // Handle minimized icon click to show modal
  showModalIcon.addEventListener('click', function() {
    minimizedLeadForm.style.display = 'none';
    leadFormModal.show();
  });

  // Вызываем функцию включения HTML после загрузки DOM
  includeHTML();
});

async function includeHTML() {
  let includes = document.getElementsByTagName('include');
  for (var i = 0; i < includes.length; i++) {
    let file = includes[i].getAttribute('src');
    if (file) {
      let response = await fetch(file);
      if (response.ok) {
        let text = await response.text();
        includes[i].outerHTML = text;
      } else {
        includes[i].outerHTML = "Page not found.";
      }
    }
  }
}