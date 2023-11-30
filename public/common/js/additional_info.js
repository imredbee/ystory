document.addEventListener("DOMContentLoaded", function() {
    const steps = document.querySelectorAll(".step");
    const nextBtns = document.querySelectorAll(".next-btn");
    const form = document.getElementById("additionalInfoForm");
    const prevBtns = document.querySelectorAll(".prev-btn");
    let currentStep = 0;

    nextBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            steps[currentStep].classList.remove("active");
            currentStep = (currentStep + 1) % steps.length;
            steps[currentStep].classList.add("active");
            updateProgressBar();
        });
    });

    prevBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                steps[currentStep].classList.remove("active");
                currentStep = (currentStep - 1) % steps.length;
                steps[currentStep].classList.add("active");
                updateProgressBar();
            }
        });
    });

    // form.addEventListener("submit", (e) => {
    //     e.preventDefault();
    //     // TODO: 폼 제출 로직 추가
    //     console.log(e);
    //     alert("정보가 제출되었습니다!");
    // });

    function updateProgressBar() {
        const progress = document.getElementById("progress");
        progress.style.width = ((currentStep / (steps.length - 1)) * 100) + "%";
    }
});
