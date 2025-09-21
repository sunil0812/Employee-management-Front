// Track required fields
const requiredFields = [
    "companyName", "companyDomain", "companyPhone",
    "No", "Street", "Pin", "Country",
    "adminName", "adminEmail", "adminPhone", "dob", "gender",
    "accountNumber", "ifscCode",
    "adminNo", "adminStreet", "adminPin", "adminCountry"
];

function checkFormCompletion() {
    let allValid = true;

    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const value = el.value.trim();
        if (!value) {
            allValid = false;
        }
        // Also check for existing error messages
        const errorEl = document.getElementById(id + "Error");
        if (errorEl && errorEl.textContent !== "") {
            allValid = false;
        }
    });

    document.getElementById("registerBtn").disabled = !allValid;
    console.log("check valid fields: " + allValid)
}

async function validateField(field, value) {
    if (!value) return;
    const errorEl = document.getElementById(field + "Error");

    // Phone number validation
    if (field === "phone" || field === "companyPhone") {
        const errorEl = document.getElementById(field + "Error");
        const regex = /^[0-9]{10}$/;
        if (!regex.test(value)) {
            errorEl.textContent = "Not a valid phone number";
            return;
        } else {
            errorEl.textContent = "";
        }
    }

    try {
        const res = await fetch("http://localhost:8080/register/validate-details", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                field,
                value
            })
        });
        const message = await res.text();
        errorEl.textContent = "";
        console.log(message);
        if (!message.includes("Validated ")) {

            errorEl.textContent = message;
        }
    } catch (err) {
        console.error("Validation failed", err);
    }
    checkFormCompletion();

}

// Register Company and Admin details in backend
async function registerCompany() {
    const payload = {
        name: document.getElementById("adminName").value,
        email: document.getElementById("adminEmail").value,
        phone: "+91" + document.getElementById("adminPhone").value,
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        companyDetails: {
            name: document.getElementById("companyName").value,
            domain: document.getElementById("companyDomain").value,
            phone: document.getElementById("companyPhone").value,
            address: {
                no: document.getElementById("No").value,
                street: document.getElementById("Street").value,
                pinCode: document.getElementById("Pin").value,
                country: document.getElementById("Country").value
            }
        },
        bankDetails: {
            accountNo: document.getElementById("accountNumber").value,
            ifscCode: document.getElementById("ifscCode").value
        },
        address: {
            no: document.getElementById("adminNo").value,
            street: document.getElementById("adminStreet").value,
            pinCode: document.getElementById("adminPin").value,
            country: document.getElementById("adminCountry").value
        }
    };

    showLoader("Registering your account...");

    fetch("http://localhost:8080/register/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(response => {
            hideLoader();
            if (response.ok) {
                showToast("Registration successful! Please Complete the Verification process sent to your email", "success");
            } else {
                showToast("Registration failed. Please try again.", "error");
            }
        })
        .catch(error => {
            hideLoader();
            showToast("Something went wrong. Please try again later.", "error");
        });
}

// loading screen
function showLoader(message = "Processing your request...") {
    let loader = document.getElementById("loader");
    loader.querySelector("p").innerText = message;
    loader.classList.remove("hidden");
}

function hideLoader() {
    document.getElementById("loader").classList.add("hidden");
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    // Set message + type
    toast.innerText = message;
    toast.className = `toast ${type} show`;

    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.className = "toast hidden";
    }, 4000);
}

window.onload = () => {
    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", checkFormCompletion);
            el.addEventListener("blur", () => checkFormCompletion());
        }
    });
    checkFormCompletion();
};