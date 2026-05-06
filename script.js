document.addEventListener("DOMContentLoaded", () => {
    const reasonsList = document.getElementById("reasonsList");
    const reasonRows = Array.from(reasonsList.querySelectorAll(".reason"));
    const textarea = document.getElementById("moreInfo");
    const submitBtn = document.getElementById("submitBtn");
    const backBtn = document.getElementById("backBtn");

    // Initialize SweetAlert Toast
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom',
        showConfirmButton: false,
        timer: 2600,
        timerProgressBar: true,
        customClass: {
            popup: 'colored-toast'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    reasonRows.forEach(row => {
        const input = row.querySelector('input[type="checkbox"]');
        const label = row.querySelector('label');

        if (input.checked) row.classList.add("active");

        label.addEventListener("click", (e) => {
            requestAnimationFrame(() => {
                if (input.checked) row.classList.add("active");
                else row.classList.remove("active");
                updateSubmitState();
            });
        });

        label.addEventListener("keydown", (ev) => {
            if (ev.key === " " || ev.key === "Enter") {
                ev.preventDefault();
                input.checked = !input.checked;
                if (input.checked) row.classList.add("active");
                else row.classList.remove("active");
                updateSubmitState();
            }
        });

        label.setAttribute('tabindex', '0');
    });

    function updateSubmitState() {
        const anyChecked = reasonsList.querySelectorAll('input[type="checkbox"]:checked').length > 0;
        const fullText = textarea.value.trim().length > 0;
        submitBtn.disabled = !(anyChecked || fullText);
    }

    textarea.addEventListener("input", updateSubmitState);

    submitBtn.addEventListener("click", async (ev) => {
        ev.preventDefault();
        
        const selectedReasons = Array.from(document.querySelectorAll('input[name="reason"]:checked'))
            .map(i => i.value);
        const otherText = textarea.value.trim();

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Submit Report?',
            text: `You selected: ${selectedReasons.length > 0 ? selectedReasons.join(', ') : 'No specific reason'}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#000',
            cancelButtonColor: '#8d8d92',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            const payload = {
                reasons: selectedReasons,
                details: otherText
            };

            console.log("Report submitted:", payload);

            // Show success toast
            Toast.fire({
                icon: 'success',
                title: 'Report submitted — thank you!'
            });

            // Reset form
            document.querySelectorAll('input[name="reason"]').forEach(i => {
                i.checked = false;
                i.closest('.reason').classList.remove('active');
            });
            textarea.value = "";
            updateSubmitState();
        }
    });

    backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.history && window.history.length > 1) {
            window.history.back();
        } else {
            Toast.fire({
                icon: 'info',
                title: 'No history available'
            });
        }
    });

    updateSubmitState();
});