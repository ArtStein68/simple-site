document.addEventListener('DOMContentLoaded', function() {
    // --- 1. ПОЛУЧАЕМ ВСЕ НУЖНЫЕ ЭЛЕМЕНТЫ СО СТРАНИЦЫ ---
    var leadFormModalElement = document.getElementById('leadFormModal');
    var leadFormModal = bootstrap.Modal.getOrCreateInstance(leadFormModalElement, {
        backdrop: 'static',
        keyboard: false
    });
    var minimizedLeadForm = document.getElementById('minimizedLeadForm');
    var showModalIcon = document.getElementById('showModalIcon');
    const fullNameInput = document.getElementById('fullName');
    const nameError = document.getElementById('nameError');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const submitOrderBtn = document.getElementById('submitOrderBtn');

    // --- 2. ИНИЦИАЛИЗАЦИЯ НОВОЙ БИБЛИОТЕКИ INTl-TEL-INPUT ---
    let iti = null; // Эта переменная будет хранить экземпляр библиотеки
    if (phoneInput) {
        iti = intlTelInput(phoneInput, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js", // <-- Обязательно для валидации!
            initialCountry: "auto",
            geoIpLookup: function(callback) {
                fetch("https://ipapi.co/json")
                  .then(res => res.json())
                  .then(data => callback(data.country_code))
                  .catch(() => callback("us")); // Запасной вариант - США
            },
            separateDialCode: true,
        });
    }

    // --- 3. ФУНКЦИИ ВАЛИДАЦИИ И УПРАВЛЕНИЯ КНОПКОЙ ---
    function validateName(name) { return !/d/.test(name) && name.length > 0; }

    function updateSubmitButtonState() {
        if (!submitOrderBtn || !fullNameInput || !iti) return;
        const isNameValid = validateName(fullNameInput.value);
        // ИСПОЛЬЗУЕМ МЕТОД НОВОЙ БИБЛИОТЕКИ
        const isPhoneValid = iti.isValidNumber();
        submitOrderBtn.disabled = !(isNameValid && isPhoneValid);
    }

    // --- 4. НАСТРОЙКА ВАЛИДАЦИИ ПОЛЕЙ ВВОДА ---
    // Новый обработчик для телефона
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            if (iti.isValidNumber()) {
                phoneInput.classList.remove('is-invalid'); phoneInput.classList.add('is-valid');
                if (phoneError) phoneError.style.display = 'none';
            } else {
                phoneInput.classList.remove('is-valid');
                if (phoneInput.value.trim().length > 0) {
                    phoneInput.classList.add('is-invalid');
                    if (phoneError) phoneError.style.display = 'block';
                } else {
                    phoneInput.classList.remove('is-invalid');
                    if (phoneError) phoneError.style.display = 'none';
                }
            }
            updateSubmitButtonState();
        });
    }

    // Валидация имени (остается без изменений)
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
                    if (nameError) phoneError.style.display = 'none';
                }
            }
            updateSubmitButtonState();
        });
    }

    // --- 5. ОСНОВНАЯ ЛОГИКА МОДАЛЬНОГО ОКНА И КНОПОК ---
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
        const minimizeModalButton = document.getElementById('minimizeModalButton');

        if (minimizeModalButton) {
            minimizeModalButton.addEventListener('click', function() { leadFormModal.hide(); });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
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
                // --- ИЗМЕНЕНИЕ: ОТПРАВЛЯЕМ НОМЕР В МЕЖДУНАРОДНОМ ФОРМАТЕ ---
                formData.append('phone', iti.getNumber()); 
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

    // --- 6. ВАША ФУНКЦИЯ ЗАГРУЗКИ ФУТЕРА (ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ) ---
    async function loadFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            try {
                const response = await fetch('../footer.html'); // Changed path here
                if (response.ok) {
                    const footerHtml = await response.text();
                    footerPlaceholder.innerHTML = footerHtml;
                } else {
                    console.error('Ошибка загрузки футера:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при получении файла футера:', error);
            }
        }
    }

    loadFooter();
});