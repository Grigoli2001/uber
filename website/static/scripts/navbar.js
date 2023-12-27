const signInButton = document.getElementById('signInButton');
const signUpButton = document.getElementById('signUpButton');
const dropDownMenuReg = document.getElementById('dropDownMenuReg');
const dropDownMenuLog = document.getElementById('dropDownMenuLog');
const closeBtnReg = document.getElementById('closeBtnReg');
const closeBtnLog = document.getElementById('closeBtnLog');


signInButton.addEventListener('click', () => {
    if (dropDownMenuReg.classList.contains('show')) {
        dropDownMenuReg.classList.toggle('hidden');
        dropDownMenuReg.classList.toggle('show');
    }
    dropDownMenuLog.classList.toggle('hidden');
    dropDownMenuLog.classList.toggle('show');
});
signUpButton.addEventListener('click', () => {
    if (dropDownMenuLog.classList.contains('show')) {
        dropDownMenuLog.classList.toggle('hidden');
        dropDownMenuLog.classList.toggle('show');
    }
    dropDownMenuReg.classList.toggle('hidden');
    dropDownMenuReg.classList.toggle('show');
});

closeBtnReg.addEventListener('click', () => {
    dropDownMenuReg.classList.toggle('hidden');
    dropDownMenuReg.classList.toggle('show');
});

closeBtnLog.addEventListener('click', () => {
    dropDownMenuLog.classList.toggle('hidden');
    dropDownMenuLog.classList.toggle('show');
});