window.togglePasswordVisibility = (passwordInputId, isChecked) => {
    const passwordInput = document.getElementById(passwordInputId);
    if (passwordInput) {
        passwordInput.type = isChecked ? 'text' : 'password';
    }
};

window.toggleMultiplePasswordVisibility = (oldPasswordId, newPasswordId, confirmPasswordId, isChecked) => {
    const oldPasswordInput = document.getElementById(oldPasswordId);
    const newPasswordInput = document.getElementById(newPasswordId);
    const confirmPasswordInput = document.getElementById(confirmPasswordId);

    if (oldPasswordInput) {
        oldPasswordInput.type = isChecked ? 'text' : 'password';
    }
    if (newPasswordInput) {
        newPasswordInput.type = isChecked ? 'text' : 'password';
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.type = isChecked ? 'text' : 'password';
    }
};