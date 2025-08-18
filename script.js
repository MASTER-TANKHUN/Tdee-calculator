document.addEventListener('DOMContentLoaded', function() {
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            const groupName = radio.name;
            document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
                r.closest('.radio-option').classList.remove('active');
            });

            this.classList.add('active');
        });
    });

    const macroButtons = document.querySelectorAll('.macro-btn');
    macroButtons.forEach(button => {
        button.addEventListener('click', function() {
            macroButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectMacro(this.dataset.macro);
        });
    });

    const form = document.getElementById('tdeeForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    let currentGoalCalories = 0;
    let currentWeight = 0;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        loading.style.display = 'block';
        results.style.display = 'none';

        const age = parseInt(document.getElementById('age').value);
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const activity = parseFloat(document.getElementById('activity').value);
        const goal = document.querySelector('input[name="goal"]:checked');

        if (!goal) {
            alert('กรุณาเลือกเป้าหมายของคุณ');
            loading.style.display = 'none';
            return;
        }
        
        const goalValue = goal.value;

        setTimeout(() => {
            let bmr;
            if (gender === 'male') {
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            } else {
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            }

            const tdee = bmr * activity;

            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);

            let bmiStatus;
            if (bmi < 18.5) bmiStatus = 'น้ำหนักน้อย';
            else if (bmi < 25) bmiStatus = 'น้ำหนักปกติ';
            else if (bmi < 30) bmiStatus = 'น้ำหนักเกิน';
            else bmiStatus = 'อ้วน';

            let goalCalories, goalTitle, goalIcon;
            let proteinMultiplier, fatPercentage;
            
            switch(goalValue) {
                case 'cutting':
                    goalCalories = tdee - 500;
                    goalTitle = 'ลดน้ำหนัก';
                    goalIcon = 'fa-weight-hanging';
                    proteinMultiplier = 2.4;
                    fatPercentage = 0.20;
                    break;
                case 'maintain':
                    goalCalories = tdee;
                    goalTitle = 'รักษาน้ำหนัก';
                    goalIcon = 'fa-balance-scale';
                    proteinMultiplier = 2.0;
                    fatPercentage = 0.25;
                    break;
                case 'bulking':
                    goalCalories = tdee + 300;
                    goalTitle = 'เพิ่มน้ำหนัก';
                    goalIcon = 'fa-dumbbell';
                    proteinMultiplier = 2.2;
                    fatPercentage = 0.30;
                    break;
            }

            currentGoalCalories = goalCalories;
            currentWeight = weight;

            const proteinGrams = weight * proteinMultiplier;
            const proteinCalories = proteinGrams * 4;
            const fatCalories = goalCalories * fatPercentage;
            const fatGrams = fatCalories / 9;
            const carbsCalories = goalCalories - proteinCalories - fatCalories;
            const carbsGrams = Math.max(0, carbsCalories / 4);

            let waterMultiplier = 35;
            if (goalValue === 'cutting') waterMultiplier = 40;
            if (goalValue === 'bulking') waterMultiplier = 45;
            const waterIntake = ((weight * waterMultiplier) + 500) / 1000;

            const elements = {
                bmrValue: Math.round(bmr),
                tdeeValue: Math.round(tdee),
                bmiValue: bmi.toFixed(1),
                bmiStatus: bmiStatus,
                goalValue: Math.round(goalCalories),
                carbsValue: Math.round(carbsGrams),
                proteinValue: Math.round(proteinGrams),
                fatValue: Math.round(fatGrams),
                waterValue: waterIntake.toFixed(1)
            };

            Object.keys(elements).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = elements[key];
                }
            });

            const goalTitleElement = document.getElementById('goalTitle');
            const goalIconElement = document.getElementById('goalIcon');
            
            if (goalTitleElement) goalTitleElement.textContent = goalTitle;
            if (goalIconElement) goalIconElement.className = `fas ${goalIcon}`;

            loading.style.display = 'none';
            results.style.display = 'block';

            // Animate result cards
            const resultCards = document.querySelectorAll('.result-card');
            resultCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                }, index * 100);
            });

            selectMacro('moderate');
        }, 2000);
    });

    function selectMacro(macroType) {
        let proteinPercentage, fatPercentage, carbsPercentage;
        switch(macroType) {
            case 'moderate':
                proteinPercentage = 0.30;
                fatPercentage = 0.35;
                carbsPercentage = 0.35;
                break;
            case 'lowcarb':
                proteinPercentage = 0.40;
                fatPercentage = 0.40;
                carbsPercentage = 0.20;
                break;
            case 'highcarb':
                proteinPercentage = 0.30;
                fatPercentage = 0.20;
                carbsPercentage = 0.50;
                break;
        }

        const proteinCalories = currentGoalCalories * proteinPercentage;
        const proteinGrams = proteinCalories / 4;
        const fatCalories = currentGoalCalories * fatPercentage;
        const fatGrams = fatCalories / 9;
        const carbsCalories = currentGoalCalories * carbsPercentage;
        const carbsGrams = carbsCalories / 4;

        const macroElements = {
            proteinValue: Math.round(proteinGrams),
            fatValue: Math.round(fatGrams),
            carbsValue: Math.round(carbsGrams)
        };

        Object.keys(macroElements).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = macroElements[key];
            }
        });
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

function smoothScrollToResults() {
    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}