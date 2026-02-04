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
        },
        additionalInfo: getAdditionalInfo()
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

// Additional Info management
let additionalInfoCounter = 0;

function addAdditionalInfoField() {
    additionalInfoCounter++;
    const container = document.getElementById("additionalInfoContainer");
    
    const fieldGroup = document.createElement("div");
    fieldGroup.className = "additional-info-group";
    fieldGroup.id = `additionalInfo-${additionalInfoCounter}`;
    fieldGroup.style.cssText = "display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: center; padding: 12px; background: rgba(18, 23, 42, 0.6); border-radius: 10px; border: 1px solid rgba(109, 140, 255, 0.15);";
    
    fieldGroup.innerHTML = `
        <input 
            type="text" 
            id="key-${additionalInfoCounter}" 
            placeholder="Field Name (e.g., Emergency Contact)"
            style="width: 100%; min-width: 250px; padding: 15px 14px; background: rgba(15, 19, 32, 0.8); border: 1px solid rgba(139, 147, 167, 0.25); border-radius: 8px; font-size: 14px; color: #e8ecf6; transition: all 0.2s ease;"
            onfocus="this.style.borderColor='rgba(109, 140, 255, 0.5)'; this.style.boxShadow='0 0 0 3px rgba(109, 140, 255, 0.1)';"
            onblur="this.style.borderColor='rgba(139, 147, 167, 0.25)'; this.style.boxShadow='none';"
        />
        <input 
            type="text" 
            id="value-${additionalInfoCounter}" 
            placeholder="Value (e.g., John Doe - 9876543210)"
            style="width: 100%; min-width: 250px; padding: 15px 14px; background: rgba(15, 19, 32, 0.8); border: 1px solid rgba(139, 147, 167, 0.25); border-radius: 8px; font-size: 14px; color: #e8ecf6; transition: all 0.2s ease;"
            onfocus="this.style.borderColor='rgba(109, 140, 255, 0.5)'; this.style.boxShadow='0 0 0 3px rgba(109, 140, 255, 0.1)';"
            onblur="this.style.borderColor='rgba(139, 147, 167, 0.25)'; this.style.boxShadow='none';"
        />
        <button 
            type="button" 
            onclick="removeAdditionalInfoField(${additionalInfoCounter})" 
            style="padding: 12px; background: rgba(255, 107, 107, 0.15); color: #ff6b6b; border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;"
            onmouseover="this.style.background='rgba(255, 107, 107, 0.25)'; this.style.transform='scale(1.05)';"
            onmouseout="this.style.background='rgba(255, 107, 107, 0.15)'; this.style.transform='scale(1)';"
            title="Remove field"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>
    `;
    
    container.appendChild(fieldGroup);
}

function removeAdditionalInfoField(id) {
    const fieldGroup = document.getElementById(`additionalInfo-${id}`);
    if (fieldGroup) {
        fieldGroup.remove();
    }
}

function getAdditionalInfo() {
    const additionalInfo = {};
    const container = document.getElementById("additionalInfoContainer");
    const groups = container.querySelectorAll(".additional-info-group");
    
    groups.forEach(group => {
        const keyInput = group.querySelector('input[id^="key-"]');
        const valueInput = group.querySelector('input[id^="value-"]');
        
        if (keyInput && valueInput && keyInput.value.trim() && valueInput.value.trim()) {
            additionalInfo[keyInput.value.trim()] = valueInput.value.trim();
        }
    });
    
    return additionalInfo;
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