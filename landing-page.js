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
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
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

function showToast(message, type) {
    const toast = document.getElementById("toast");

    // Set message + type
    toast.innerText = message;
    toast.className = `toast ${type} show`;

    // Auto hide after 15 seconds
    setTimeout(() => {
        toast.className = "toast hidden";
    }, 15000);
}
//  auto-complete address only for INDIA;
let autocomplete;

function initAutocomplete() {
    const input = document.getElementById("autocomplete");
    console.log("init auto complete");
    autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["address"], // Only addresses
        componentRestrictions: { country: "IN" } // Restrict to India (optional)
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        const addressComponents = {
            street_number: "",
            route: "",
            locality: "",
            administrative_area_level_1: "",
            country: "",
            postal_code: ""
        };

        place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes("street_number")) addressComponents.street_number = component.long_name;
            if (types.includes("route")) addressComponents.route = component.long_name;
            if (types.includes("locality")) addressComponents.locality = component.long_name;
            if (types.includes("administrative_area_level_1")) addressComponents.administrative_area_level_1 = component.long_name;
            if (types.includes("country")) addressComponents.country = component.long_name;
            if (types.includes("postal_code")) addressComponents.postal_code = component.long_name;
        });

        // Autofill the fields (read-only)
        document.getElementById("addressNo").value = addressComponents.street_number;
        document.getElementById("street").value = addressComponents.route;
        document.getElementById("city").value = addressComponents.locality;
        document.getElementById("state").value = addressComponents.administrative_area_level_1;
        document.getElementById("country").value = addressComponents.country;
        document.getElementById("pinCode").value = addressComponents.postal_code;
    });
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