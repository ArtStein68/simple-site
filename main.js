document.addEventListener('DOMContentLoaded', function() {
    var leadFormModalElement = document.getElementById('leadFormModal');
    var leadFormModal = bootstrap.Modal.getOrCreateInstance(leadFormModalElement, {
        backdrop: 'static',
        keyboard: false
    });

    const fullNameInput = document.getElementById('fullName');
    const nameError = document.getElementById('nameError');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const submitOrderBtn = document.getElementById('submitOrderBtn');
    let phoneMask = null; 

    function validateName(name) { return !/\d/.test(name) && name.length > 0; }

    function updateSubmitButtonState() {
        if (!submitOrderBtn || !fullNameInput || !phoneMask) return;
        const isNameValid = validateName(fullNameInput.value);
        const isPhoneValid = phoneMask.masked.isComplete;
        submitOrderBtn.disabled = !(isNameValid && isPhoneValid);
    }

    if (phoneInput) {
        phoneMask = IMask(phoneInput, { mask: '(000) 000-0000', lazy: false });
        phoneMask.on('accept', function() {
            if (phoneMask.masked.isComplete) {
                phoneInput.classList.remove('is-invalid'); phoneInput.classList.add('is-valid');
                if (phoneError) phoneError.style.display = 'none';
            } else {
                phoneInput.classList.remove('is-valid');
                if (phoneMask.value.length > 0) phoneInput.classList.add('is-invalid');
                else phoneInput.classList.remove('is-invalid');
            }
            updateSubmitButtonState();
        });
    }

    if (fullNameInput) {
        fullNameInput.addEventListener('input', function() {
            const isValid = validateName(this.value);
            if (isValid) {
                this.classList.remove('is-invalid'); this.classList.add('is-valid');
                if (nameError) nameError.style.display = 'none';
            } else {
                this.classList.remove('is-valid');
                if (this.value.length > 0) {
                    this.classList.add('is-invalid');
                    if (nameError) nameError.style.display = 'block';
                } else {
                    this.classList.remove('is-invalid');
                    if (nameError) nameError.style.display = 'none';
                }
            }
            updateSubmitButtonState();
        });
    }

    var minimizedLeadForm = document.getElementById('minimizedLeadForm');
    var showModalIcon = document.getElementById('showModalIcon');
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') { leadFormModal.show(); }
    showModalIcon.addEventListener('click', function() { minimizedLeadForm.style.display = 'none'; leadFormModal.show(); });
    leadFormModalElement.addEventListener('hidden.bs.modal', function () { const b = document.querySelector('.modal-backdrop'); if (b) b.remove(); minimizedLeadForm.style.display = 'block'; });
    document.addEventListener('click', function (e) { const i = leadFormModalElement.contains(e.target); if (leadFormModalElement.classList.contains('show') && !i) e.stopPropagation(); }, true);

    leadFormModalElement.addEventListener('shown.bs.modal', function () {
        const formPage1 = document.getElementById('formPage1');
        const formPage2 = document.getElementById('formPage2');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const pageIndicator = document.querySelector('.modal-page-indicator');
        const backPageBtn = document.getElementById('backPageBtn');

        if (minimizeModalButton) {
            minimizeModalButton.addEventListener('click', function() {
                leadFormModal.hide(); // Просто скрываем модальное окно
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                // ПРОВЕРКА: можно перейти дальше, даже если ничего не выбрано, но есть текст в "Другом"
                const anyCheckboxChecked = document.querySelector('#formPage1 input[type="checkbox"]:checked');
                const otherText = document.getElementById('otherOptionText').value;
                if (!anyCheckboxChecked && !otherText) { alert('Пожалуйста, выберите хотя бы одну услугу или опишите ваши пожелания.'); return; }
                
                formPage1.style.display = 'none';
                formPage2.style.display = 'block';
                nextPageBtn.style.display = 'none';
                submitOrderBtn.style.display = 'block';
                backPageBtn.style.display = 'block';
                if (pageIndicator) pageIndicator.textContent = '2/2';
                updateSubmitButtonState();
            });
        }
        if (backPageBtn) {
            backPageBtn.addEventListener('click', function() {
                formPage2.style.display = 'none';
                formPage1.style.display = 'block';
                backPageBtn.style.display = 'none';
                submitOrderBtn.style.display = 'none';
                nextPageBtn.style.display = 'block';
                if (pageIndicator) pageIndicator.textContent = '1/2';
            });
        }

        if (submitOrderBtn) {
            submitOrderBtn.addEventListener('click', function(event) {
                event.preventDefault();
                if (submitOrderBtn.disabled) return;
                
                const formSuccessMessage = document.getElementById('formSuccessMessage');
                const formErrorMessage = document.getElementById('formErrorMessage');
                submitOrderBtn.disabled = true;
                submitOrderBtn.textContent = 'Отправка...';

                const formData = new FormData();
                formData.append('name', fullNameInput.value);
                formData.append('phone', phoneInput.value);
                formData.append('other_details', document.getElementById('otherOptionText').value);
                document.querySelectorAll('#formPage1 input[type="checkbox"]:checked').forEach(c => formData.append(c.value, 'true'));
                
                const scriptURL = 'https://script.google.com/macros/s/AKfycbxxDLgpbYZzN0Q2L-xEyOQY9vPnBU5-RVJbRTipeRCGBlGvPBa961VX7opuf75r_6cHig/exec';

                fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
                .then(() => {
                    formPage1.style.display = 'none';
                    formPage2.style.display = 'none';
                    document.querySelector('.modal-footer').style.display = 'none';
                    if (formSuccessMessage) formSuccessMessage.style.display = 'block';
                })
                .catch(error => {
                    console.error('Критическая ошибка при отправке:', error);
                    if (formErrorMessage) formErrorMessage.style.display = 'block';
                    submitOrderBtn.disabled = false;
                    submitOrderBtn.textContent = 'Отправить';
                });
            });
        }
    });

    async function includeHTML() {
        let includes = document.getElementsByTagName('include');
        for (var i = 0; i < includes.length; i++) {
            let file = includes[i].getAttribute('src');
            if (file) {
                let response = await fetch(file);
                if (response.ok) { let text = await response.text(); includes[i].outerHTML = text; }
                else { includes[i].outerHTML = "Page not found."; }
            }
        }
    }
    includeHTML();
});