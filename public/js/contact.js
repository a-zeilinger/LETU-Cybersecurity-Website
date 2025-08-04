// Contact Form JavaScript for Cybersecurity Club Website

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    if (!contactForm) return;
    
    // Form validation and submission
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate all fields
        const isValid = validateAllFields();
        
        if (!isValid) {
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Additional client-side sanitization
            const sanitizedData = sanitizeFormData(data);
            
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess();
                contactForm.reset();
            } else {
                showError(result.message || 'An error occurred while sending your message.');
                
                // Display field-specific errors if any
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        if (error.path && error.msg) {
                            showFieldError(error.path[0], error.msg);
                        }
                    });
                }
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            setLoadingState(false);
        }
    }
    
    function validateAllFields() {
        let isValid = true;
        
        // Validate name
        const name = document.getElementById('name').value.trim();
        if (name.length < 2 || name.length > 50) {
            showFieldError('name', 'Name must be between 2 and 50 characters');
            isValid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            showFieldError('name', 'Name can only contain letters and spaces');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('email').value.trim();
        if (!window.validateEmail(email)) {
            showFieldError('email', 'Please provide a valid email address');
            isValid = false;
        }
        
        // Validate message
        const message = document.getElementById('message').value.trim();
        if (message.length < 10 || message.length > 1000) {
            showFieldError('message', 'Message must be between 10 and 1000 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateField(e) {
        const field = e.target;
        const fieldName = field.name;
        const value = field.value.trim();
        
        clearFieldError(fieldName);
        
        switch (fieldName) {
            case 'name':
                if (value.length < 2 || value.length > 50) {
                    showFieldError('name', 'Name must be between 2 and 50 characters');
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    showFieldError('name', 'Name can only contain letters and spaces');
                }
                break;
                
            case 'email':
                if (!window.validateEmail(value)) {
                    showFieldError('email', 'Please provide a valid email address');
                }
                break;
                
            case 'message':
                if (value.length < 10 || value.length > 1000) {
                    showFieldError('message', 'Message must be between 10 and 1000 characters');
                }
                break;
        }
    }
    
    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Add error styling to input
        const input = document.getElementById(fieldName);
        if (input) {
            input.style.borderColor = 'var(--error)';
            input.style.boxShadow = '0 0 0 3px rgba(248, 81, 73, 0.1)';
        }
    }
    
    function clearFieldError(e) {
        const fieldName = e.target ? e.target.name : e;
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Remove error styling from input
        const input = document.getElementById(fieldName);
        if (input) {
            input.style.borderColor = 'var(--border)';
            input.style.boxShadow = 'none';
        }
    }
    
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        // Reset input styling
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.borderColor = 'var(--border)';
            input.style.boxShadow = 'none';
        });
    }
    
    function sanitizeFormData(data) {
        return {
            name: data.name ? data.name.trim().replace(/[<>]/g, '') : '',
            email: data.email ? data.email.trim().toLowerCase() : '',
            subject: data.subject ? data.subject.trim() : '',
            message: data.message ? data.message.trim().replace(/[<>]/g, '') : ''
        };
    }
    
    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
    
    function showSuccess() {
        contactForm.style.display = 'none';
        formError.style.display = 'none';
        formSuccess.style.display = 'block';
        
        // Scroll to success message
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    function showError(message) {
        contactForm.style.display = 'block';
        formSuccess.style.display = 'none';
        formError.style.display = 'block';
        
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
        
        // Scroll to error message
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Add form security features
    let submitAttempts = 0;
    const maxAttempts = 3;
    
    function checkSubmitAttempts() {
        submitAttempts++;
        if (submitAttempts >= maxAttempts) {
            showError('Too many submission attempts. Please wait a few minutes before trying again.');
            submitBtn.disabled = true;
            setTimeout(() => {
                submitBtn.disabled = false;
                submitAttempts = 0;
            }, 300000); // 5 minutes
            return false;
        }
        return true;
    }
    
    // Override the form submission to include attempt checking
    const originalHandleFormSubmit = handleFormSubmit;
    contactForm.addEventListener('submit', function(e) {
        if (!checkSubmitAttempts()) {
            e.preventDefault();
            return;
        }
        originalHandleFormSubmit(e);
    });
    
    // Add honeypot protection (hidden field)
    const honeypotField = document.createElement('input');
    honeypotField.type = 'text';
    honeypotField.name = 'website';
    honeypotField.style.display = 'none';
    honeypotField.style.position = 'absolute';
    honeypotField.style.left = '-9999px';
    contactForm.appendChild(honeypotField);
    
    // Check honeypot on submission
    contactForm.addEventListener('submit', function(e) {
        if (honeypotField.value) {
            e.preventDefault();
            showError('Invalid form submission detected.');
            return false;
        }
    });
    
    // Add CSS for form states
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group textarea.error {
            border-color: var(--error) !important;
            box-shadow: 0 0 0 3px rgba(248, 81, 73, 0.1) !important;
        }
        
        .form-group input:focus.error,
        .form-group textarea:focus.error {
            border-color: var(--error) !important;
            box-shadow: 0 0 0 3px rgba(248, 81, 73, 0.2) !important;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .form-success,
        .form-error {
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🔒 Contact form security features enabled');
    console.log('Features: Client-side validation, XSS protection, honeypot, rate limiting');
}); 