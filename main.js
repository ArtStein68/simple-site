document.addEventListener('DOMContentLoaded', function () {
    // --- 1. GET ALL NEEDED ELEMENTS ---
    const leadFormModalElement = document.getElementById('leadFormModal');
    const leadFormModal = bootstrap.Modal.getOrCreateInstance(leadFormModalElement, {
        backdrop: 'static',
        keyboard: false
    });
    const minimizedLeadForm = document.getElementById('minimizedLeadForm');
    const showModalIcon = document.getElementById('showModalIcon');
    
    // Form elements
    const formPage1 = document.getElementById('formPage1');
    const formPage2 = document.getElementById('formPage2');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const submitOrderBtn = document.getElementById('submitOrderBtn');
    
    // Navigation elements
    const nextPageBtn = document.getElementById('nextPageBtn');
    const backPageBtn = document.getElementById('backPageBtn');
    const pageIndicator = document.querySelector('.modal-page-indicator');
    const minimizeModalButton = document.getElementById('minimizeModalButton');

    let iti = null; // To hold the intl-tel-input instance

    // --- 2. DYNAMIC CATEGORY TOGGLE LOGIC ---
    const mainCategoryToggles = document.querySelectorAll('.main-category-toggle');
    mainCategoryToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const targetId = this.dataset.bsTarget;
            const subcategoryList = document.querySelector(targetId);
            if (subcategoryList) {
                if (this.checked) {
                    slideDown(subcategoryList);
                } else {
                    slideUp(subcategoryList);
                }
            }
        });
    });

    // --- 3. PAGE NAVIGATION ---
    function showPage(pageNumber) {
        if (pageNumber === 1) {
            formPage1.style.display = 'block';
            formPage2.style.display = 'none';
            pageIndicator.textContent = '1/2';
            backPageBtn.style.display = 'none';
            nextPageBtn.style.display = 'block';
            submitOrderBtn.style.display = 'none';
        } else if (pageNumber === 2) {
            formPage1.style.display = 'none';
            formPage2.style.display = 'block';
            pageIndicator.textContent = '2/2';
            backPageBtn.style.display = 'block';
            nextPageBtn.style.display = 'none';
            submitOrderBtn.style.display = 'block';
            
            if (!iti) {
                initializeIntlTelInput();
            }
            updateSubmitButtonState();
        }
    }

    nextPageBtn.addEventListener('click', function() {
        const anySubcategoryChecked = document.querySelector('.subcategory-list input[type="checkbox"]:checked');
        const otherText = document.getElementById('otherOptionText').value;

        if (!anySubcategoryChecked && !otherText.trim()) {
            alert('Please select at least one service or describe your wishes.');
            return;
        }
        showPage(2);
    });

    backPageBtn.addEventListener('click', function() {
        showPage(1);
    });

    // --- 4. MODAL VISIBILITY AND RESETS ---
    minimizeModalButton.addEventListener('click', () => leadFormModal.hide());
    showModalIcon.addEventListener('click', () => {
        minimizedLeadForm.style.display = 'none';
        leadFormModal.show();
    });

    leadFormModalElement.addEventListener('shown.bs.modal', () => {
        showPage(1);
        // Reset form state on open
        document.querySelectorAll('.main-category-toggle, .subcategory-list input[type="checkbox"]').forEach(el => el.checked = false);
        document.querySelectorAll('.subcategory-list').forEach(el => el.style.display = 'none');
        document.getElementById('otherOptionText').value = '';
    });

    leadFormModalElement.addEventListener('hidden.bs.modal', function () {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        minimizedLeadForm.style.display = 'block';
    });

    if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {
        leadFormModal.show();
    }

    // --- 5. VALIDATION & SUBMIT LOGIC ---
    function updateSubmitButtonState() {
        if (!submitOrderBtn || !fullNameInput || !iti) return;
        const isNameValid = !/\d/.test(fullNameInput.value) && fullNameInput.value.length > 0;
        const isPhoneValid = iti.isValidNumber();
        submitOrderBtn.disabled = !(isNameValid && isPhoneValid);
    }

    function initializeIntlTelInput() {
        if (phoneInput && !iti) {
            iti = intlTelInput(phoneInput, {
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
                initialCountry: "auto",
                geoIpLookup: cb => fetch("https://ipapi.co/json").then(r => r.json()).then(d => cb(d.country_code)).catch(() => cb("us")),
                separateDialCode: true,
                dropdownContainer: leadFormModalElement
            });
            phoneInput.addEventListener('input', updateSubmitButtonState);
            phoneInput.addEventListener('countrychange', updateSubmitButtonState);
        }
    }
    
    if (fullNameInput) {
        fullNameInput.addEventListener('input', updateSubmitButtonState);
    }

    submitOrderBtn.addEventListener('click', function(event) {
        event.preventDefault();
        if (submitOrderBtn.disabled) return;

        submitOrderBtn.disabled = true;
        submitOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';
        
        const formData = new FormData();
        const selectedServices = [];
        
        document.querySelectorAll('.subcategory-list input[type="checkbox"]:checked').forEach(checkbox => {
            // value="Project Name_ServiceType" -> "Project Name - ServiceType"
            selectedServices.push(checkbox.value.replace('_', ' - '));
        });

        formData.append('name', fullNameInput.value);
        formData.append('phone', iti.getNumber());
        formData.append('selected_services', selectedServices.join('; '));
        formData.append('other_details', document.getElementById('otherOptionText').value);

        const scriptURL = 'https://script.google.com/macros/s/AKfycbxxDLgpbYZzN0Q2L-xEyOQY9vPnBU5-RVJbRTipeRCGBlGvPBa961VX7opuf75r_6cHig/exec'; 
        fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            formPage1.style.display = 'none';
            formPage2.style.display = 'none';
            document.querySelector('.modal-footer').style.display = 'none';
            document.getElementById('formSuccessMessage').style.display = 'block';
        })
        .catch(error => {
            console.error('Error!', error.message);
            document.getElementById('formErrorMessage').style.display = 'block';
            submitOrderBtn.disabled = false;
            submitOrderBtn.textContent = 'Submit';
        });
    });

    // --- 6. HELPER FUNCTIONS FOR ANIMATION ---
    function slideUp(element) {
        element.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out';
        element.style.height = element.scrollHeight + 'px';
        element.offsetHeight; // Trigger reflow
        element.style.opacity = '0';
        element.style.height = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    }

    function slideDown(element) {
        element.style.display = 'block';
        let height = element.scrollHeight + 'px';
        element.style.height = '0';
        element.style.opacity = '0';
        element.offsetHeight; // Trigger reflow
        element.style.transition = 'height 0.3s ease-in, opacity 0.3s ease-in';
        element.style.height = height;
        element.style.opacity = '1';
        element.addEventListener('transitionend', () => {
            element.style.height = null;
        }, { once: true });
    }

    // --- 7. FOOTER LOADING ---
    async function loadFooter() {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            try {
                const path = window.location.pathname.includes('/examples/') ? '../footer.html' : 'footer.html';
                const response = await fetch(path);
                if (response.ok) placeholder.innerHTML = await response.text();
            } catch (error) {
                console.error('Failed to load footer:', error);
            }
        }
    }
    loadFooter();
});