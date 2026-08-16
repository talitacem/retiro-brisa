document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progress-bar');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const form = document.getElementById('brisa-form');
    
    // Diet logic
    const dietSelect = document.getElementById('diet');
    const dietOtherGroup = document.getElementById('diet-other-group');
    const dietOtherInput = document.getElementById('dietOther');

    // Health logic
    const hasMedicalCondition = document.getElementById('hasMedicalCondition');
    const medicalConditionDescGroup = document.getElementById('medicalConditionDesc-group');
    const medicalConditionDesc = document.getElementById('medicalConditionDesc');

    hasMedicalCondition.addEventListener('change', (e) => {
        if (e.target.value === 'yes') {
            medicalConditionDescGroup.classList.remove('hidden');
            medicalConditionDesc.setAttribute('required', 'true');
        } else {
            medicalConditionDescGroup.classList.add('hidden');
            medicalConditionDesc.removeAttribute('required');
            medicalConditionDesc.value = '';
        }
    });

    const hasMedication = document.getElementById('hasMedication');
    const medicationDescGroup = document.getElementById('medicationDesc-group');
    const medicationDesc = document.getElementById('medicationDesc');

    hasMedication.addEventListener('change', (e) => {
        if (e.target.value === 'yes') {
            medicationDescGroup.classList.remove('hidden');
            medicationDesc.setAttribute('required', 'true');
        } else {
            medicationDescGroup.classList.add('hidden');
            medicationDesc.removeAttribute('required');
            medicationDesc.value = '';
        }
    });

    // Payment logic
    const payRadios = document.querySelectorAll('input[name="paymentType"]');
    const installmentsGroup = document.getElementById('installments-group');
    const installmentsSelect = document.getElementById('installments');

    payRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'installments') {
                installmentsGroup.classList.remove('hidden');
                installmentsSelect.setAttribute('required', 'true');
            } else {
                installmentsGroup.classList.add('hidden');
                installmentsSelect.removeAttribute('required');
                installmentsSelect.value = '';
            }
        });
    });

    let currentStep = 0;

    // Handle diet 'other' option
    dietSelect.addEventListener('change', (e) => {
        if (e.target.value === 'other') {
            dietOtherGroup.classList.remove('hidden');
            dietOtherInput.setAttribute('required', 'true');
        } else {
            dietOtherGroup.classList.add('hidden');
            dietOtherInput.removeAttribute('required');
            dietOtherInput.value = '';
        }
    });

    // Handle Next
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateFormSteps();
            }
        });
    });

    // Handle Prev
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateFormSteps();
        });
    });

    // Handle Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-symbols-outlined">sync</span> Processando...';
            submitBtn.disabled = true;

            const FORMSPREE_URL = 'https://formspree.io/f/xrpzqooz';
            const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbybiWhU3MYT4-qM2npdXC8xVOZTgdymehRUNwGTDrLrnzYZXUi8cfE5LjOhucWECJc_/exec';
            
            const rawData = new FormData(form);
            const cleanData = new FormData();

            // Mapping to Portuguese readable headers for the spreadsheet
            const mapping = {
                fullName: "Nome Completo",
                email: "E-mail",
                phone: "Telefone / WhatsApp",
                birthdate: "Data de Nascimento",
                profession: "Profissão",
                maritalStatus: "Estado Civil",
                transport: "Transporte",
                accommodation: "Acomodação Principal",
                accommodationMsg: "Obs. Acomodação",
                diet: "Restrições Alimentares",
                dietOther: "Obs. Alimentação",
                emergencyName: "Nome Emergência",
                emergencyPhone: "Tel Emergência",
                hasMedicalCondition: "Tem condição médica?",
                medicalConditionDesc: "Desc. Condição Médica",
                hasMedication: "Usa medicamento?",
                medicationDesc: "Desc. Medicamento",
                experience: "Nível de Yoga",
                previousRetreat: "Já participou de retiro?",
                howDidYouHear: "Como soube?",
                expectations: "Expectativas",
                imageRelease: "Autoriza Imagem?",
                declaration: "Aceita Declaração?",
                paymentType: "Forma de Pagamento",
                installments: "Opção Parcelamento"
            };

            for (let [key, value] of rawData.entries()) {
                cleanData.append(mapping[key] || key, value);
            }

            // Enviar APENAS para o Google Sheets (agora ele é nosso servidor principal)
            fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                body: cleanData,
                mode: 'no-cors' // Ignora o bloqueio de segurança do navegador (CORS)
            })
            .then(() => {
                // Como usamos no-cors, assumimos sucesso quando a requisição termina
                steps.forEach(step => step.classList.remove('active'));
                document.getElementById('step-success').classList.add('active');
                
                document.querySelector('.progress-container').style.display = 'none';
                document.querySelector('.form-header').style.display = 'none';
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Verifique sua conexão com a internet e tente novamente.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        }
    });

    function updateFormSteps() {
        // Update Steps
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Update Indicators
        stepIndicators.forEach((indicator, index) => {
            if (index < currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
                indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.2rem;">check</span>';
            } else if (index === currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
                indicator.innerHTML = index + 1;
            } else {
                indicator.classList.remove('active', 'completed');
                indicator.innerHTML = index + 1;
            }
        });

        // Update Progress Bar
        const progress = (currentStep / (stepIndicators.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function validateStep(stepIndex) {
        const currentStepEl = steps[stepIndex];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            const group = input.closest('.input-group') || input.closest('.radio-cards')?.closest('.input-group');
            
            if (!input.checkValidity()) {
                isValid = false;
                if (group) group.classList.add('invalid');
                
                // Specific listener to remove error on input
                input.addEventListener('input', () => {
                    if(input.checkValidity() && group) {
                        group.classList.remove('invalid');
                    }
                }, { once: true });

                input.addEventListener('change', () => {
                    if(input.checkValidity() && group) {
                        group.classList.remove('invalid');
                    }
                }, { once: true });
            } else {
                if (group) group.classList.remove('invalid');
            }
        });

        // Specific check for radio buttons (Accommodation)
        if (stepIndex === 1) {
            const radios = currentStepEl.querySelectorAll('input[name="accommodation"]');
            const isChecked = Array.from(radios).some(radio => radio.checked);
            const radioGroup = radios[0]?.closest('.input-group');
            
            if (!isChecked && radioGroup) {
                isValid = false;
                radioGroup.classList.add('invalid');
                
                radios.forEach(r => r.addEventListener('change', () => {
                    radioGroup.classList.remove('invalid');
                }));
            }
        }

        // Specific check for radio buttons (Payment)
        if (stepIndex === 4) {
            const paymentRadios = currentStepEl.querySelectorAll('input[name="paymentType"]');
            const isPaymentChecked = Array.from(paymentRadios).some(radio => radio.checked);
            const paymentRadioGroup = paymentRadios[0]?.closest('.input-group');
            
            if (!isPaymentChecked && paymentRadioGroup) {
                isValid = false;
                paymentRadioGroup.classList.add('invalid');
                
                paymentRadios.forEach(r => r.addEventListener('change', () => {
                    paymentRadioGroup.classList.remove('invalid');
                }));
            }
        }

        return isValid;
    }
});
