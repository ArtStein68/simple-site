document.addEventListener('DOMContentLoaded', function() {
    var leadFormModalElement = document.getElementById('leadFormModal');
    var leadFormModal = new bootstrap.Modal(leadFormModalElement, { backdrop: 'static', keyboard: false });
    var minimizedLeadForm = document.getElementById('minimizedLeadForm');
    var showModalIcon = document.getElementById('showModalIcon');

    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        leadFormModal.show();
    }

    showModalIcon.addEventListener('click', function() {
        minimizedLeadForm.style.display = 'none';
        leadFormModal.show();
    });

    leadFormModalElement.addEventListener('hidden.bs.modal', function () {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        minimizedLeadForm.style.display = 'block';
    });

    document.addEventListener('click', function (event) {
        const isClickInsideModal = leadFormModalElement.contains(event.target);
        const isClickOnMinimizedIcon = minimizedLeadForm.contains(event.target);
        if (leadFormModalElement.classList.contains('show') && !isClickInsideModal && !isClickOnMinimizedIcon) {
            event.stopPropagation();
        }
    }, true);

    leadFormModalElement.addEventListener('shown.bs.modal', function () {
        const formPage1 = document.getElementById('formPage1');
        const formPage2 = document.getElementById('formPage2');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const submitOrderBtn = document.getElementById('submitOrderBtn');
        const pageIndicator = document.querySelector('.modal-page-indicator');
        const minimizeModalButton = document.getElementById('minimizeModalButton');
        const backPageBtn = document.getElementById('backPageBtn');

        // === НАЧАЛО НОВОГО КОДА ДЛЯ ПОЛЯ "ДРУГОЕ" ===
        // Получаем доступ к новым элементам
        const otherOptionCheckbox = document.getElementById('otherOptionCheckbox');
        const otherOptionContainer = document.getElementById('otherOptionContainer');

        // Добавляем обработчик на чекбокс "Другое"
        if (otherOptionCheckbox) {
            otherOptionCheckbox.addEventListener('change', function() {
                // Если чекбокс отмечен, показываем текстовое поле, иначе - скрываем
                if (this.checked) {
                    otherOptionContainer.style.display = 'block';
                } else {
                    otherOptionContainer.style.display = 'none';
                }
            });
        }
        // === КОНЕЦ НОВОГО КОДА ДЛЯ ПОЛЯ "ДРУГОЕ" ===

        if (minimizeModalButton) {
            minimizeModalButton.addEventListener('click', function() {
                leadFormModal.hide();
                minimizedLeadForm.style.display = 'block';
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                formPage1.style.display = 'none';
                formPage2.style.display = 'block';
                nextPageBtn.style.display = 'none';
                submitOrderBtn.style.display = 'block';
                backPageBtn.style.display = 'block';
                if (pageIndicator) {
                    pageIndicator.textContent = '2/2';
                }
            });
        }

        if (backPageBtn) {
            backPageBtn.addEventListener('click', function() {
                formPage2.style.display = 'none';
                formPage1.style.display = 'block';
                backPageBtn.style.display = 'none';
                submitOrderBtn.style.display = 'none';
                nextPageBtn.style.display = 'block';
                if (pageIndicator) {
                    pageIndicator.textContent = '1/2';
                }
            });
        }

        // ОБНОВЛЕННЫЙ ОБРАБОТЧИК КНОПКИ "ОТПРАВИТЬ"
        if (submitOrderBtn) {
            submitOrderBtn.addEventListener('click', function(event) {
                event.preventDefault();

                const formSuccessMessage = document.getElementById('formSuccessMessage');
                const formErrorMessage = document.getElementById('formErrorMessage');

                submitOrderBtn.disabled = true;
                submitOrderBtn.textContent = 'Отправка...';

                const fullName = document.getElementById('fullName').value;
                const phone = document.getElementById('phone').value;

                if (!fullName || !phone) {
                    alert('Пожалуйста, введите ваше имя и телефон.');
                    submitOrderBtn.disabled = false;
                    submitOrderBtn.textContent = 'Отправить';
                    return;
                }
                
                // Получаем текст из поля "Другое"
                const otherDetailsText = document.getElementById('otherOptionText').value;

                const formData = new FormData();
                formData.append('name', fullName);
                formData.append('phone', phone);
                // Добавляем данные из "Другого" в отправку
                formData.append('other_details', otherDetailsText);

                const checkboxes = document.querySelectorAll('#formPage1 input[type="checkbox"]');
                checkboxes.forEach(function(checkbox) {
                    if (checkbox.checked) {
                        formData.append(checkbox.value, 'true');
                    }
                });

                // Убедитесь, что здесь ваш URL из Google Apps Script
                const scriptURL = 'https://script.google.com/macros/s/AKfycbxxDLgpbYZzN0Q2L-xEyOQY9vPnBU5-RVJbRTipeRCGBlGvPBa961VX7opuf75r_6cHig/exec';

                fetch(scriptURL, { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(data => {
                        if (data.result === 'success') {
                            formPage1.style.display = 'none';
                            formPage2.style.display = 'none';
                            document.querySelector('.modal-footer').style.display = 'none';
                            if (formSuccessMessage) formSuccessMessage.style.display = 'block';
                        } else {
                            throw new Error(data.message || 'Неизвестная ошибка скрипта');
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка при отправке заявки:', error);
                        if (formErrorMessage) formErrorMessage.style.display = 'block';
                        submitOrderBtn.disabled = false;
                        submitOrderBtn.textContent = 'Отправить';
                    });
            });
        }
    });

    // Функция includeHTML остается без изменений
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
    includeHTML();
});