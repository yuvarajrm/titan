// document.addEventListener("DOMContentLoaded", () => {
//   const emailInput = document.getElementById("email");
//   const otpInput = document.getElementById("otp");
//   const sendOtpBtn = document.getElementById("sendOtpBtn");
//   const verifyOtpBtn = document.getElementById("verifyOtpBtn");
//   const messageDiv = document.getElementById("message");
//   let resendTimer = null;
//   const RESEND_COOLDOWN = 60; // seconds

//   function showMessage(msg, type = "") {
//     messageDiv.textContent = msg;
//     messageDiv.className = `message ${type}`;
//     clearTimeout(messageDiv._hideT);
//     messageDiv._hideT = setTimeout(() => {
//       messageDiv.textContent = "";
//       messageDiv.className = "message";
//     }, 3500);
//   }

//   function validateEmail(email) {
//     // simple email regex (not perfect but usable)
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   }

//   function startResendCooldown(seconds = RESEND_COOLDOWN) {
//     let remaining = seconds;
//     sendOtpBtn.disabled = true;
//     sendOtpBtn.textContent = `Resend in ${remaining}s`;
//     resendTimer = setInterval(() => {
//       remaining -= 1;
//       if (remaining <= 0) {
//         clearInterval(resendTimer);
//         sendOtpBtn.disabled = false;
//         sendOtpBtn.textContent = "Resend OTP";
//       } else {
//         sendOtpBtn.textContent = `Resend in ${remaining}s`;
//       }
//     }, 1000);
//   }

//   sendOtpBtn.addEventListener("click", async () => {
//     const email = emailInput.value.trim();
//     if (!email) {
//       showMessage("Please enter your email first.", "error");
//       return;
//     }
//     if (!validateEmail(email)) {
//       showMessage("Enter a valid email address.", "error");
//       return;
//     }

//     sendOtpBtn.disabled = true;
//     sendOtpBtn.style.opacity = "0.6";

//     try {
//       const res = await fetch("https://your-api.example.com/send-otp", { // use HTTPS in prod
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         // credentials: "include", // only if you actually need cookies
//         body: JSON.stringify({ email })
//       });

//       let data;
//       try {
//         data = await res.json();
//       } catch (e) {
//         // non-JSON response
//         showMessage("Server error while sending OTP", "error");
//         sendOtpBtn.disabled = false;
//         sendOtpBtn.style.opacity = "1";
//         return;
//       }

//       // IMPORTANT: server should NOT send the OTP back in the response
//       showMessage(data.message ?? (data.success ? "OTP sent" : "Failed to send OTP"), data.success ? "success" : "error");

//       if (data.success) {
//         otpInput.disabled = false;
//         verifyOtpBtn.disabled = false;
//         otpInput.value = "";
//         startResendCooldown(60); // begin 60s cooldown
//       } else {
//         sendOtpBtn.disabled = false;
//       }
//     } catch (err) {
//       console.error("Send OTP error:", err);
//       showMessage("Network error sending OTP", "error");
//       sendOtpBtn.disabled = false;
//       sendOtpBtn.style.opacity = "1";
//     } finally {
//       sendOtpBtn.style.opacity = "1";
//     }
//   });

//   verifyOtpBtn.addEventListener("click", async () => {
//     const email = emailInput.value.trim();
//     const otp = otpInput.value.trim();

//     if (!email || !otp) {
//       showMessage("Email and OTP are required", "error");
//       return;
//     }
//     if (!validateEmail(email)) {
//       showMessage("Invalid email", "error");
//       return;
//     }
//     if (!/^\d{4,8}$/.test(otp)) { // validate OTP is 4-8 digits (adjust to your OTP length)
//       showMessage("Enter a valid numeric OTP", "error");
//       otpInput.value = "";
//       return;
//     }

//     verifyOtpBtn.disabled = true;

//     try {
//       const res = await fetch("https://your-api.example.com/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         // credentials: "include",
//         body: JSON.stringify({ email, otp })
//       });

//       let data;
//       try {
//         data = await res.json();
//       } catch (e) {
//         showMessage("Server error verifying OTP", "error");
//         verifyOtpBtn.disabled = false;
//         return;
//       }

//       showMessage(data.message ?? (data.success ? "Verified" : "Invalid OTP"), data.success ? "success" : "error");

//       if (data.success) {
//         // Clear sensitive fields
//         emailInput.value = "";
//         otpInput.value = "";

//         // Redirect - ensure this is same-origin and safe
//         window.location.href = "/dashboard.html";
//       } else {
//         otpInput.value = ""; // clear only OTP
//       }
//     } catch (err) {
//       console.error("Verify OTP error:", err);
//       showMessage("Network error verifying OTP", "error");
//       otpInput.value = "";
//     } finally {
//       verifyOtpBtn.disabled = false;
//     }
//   });

//   // small enhancements to OTP input (set attributes in DOM)
//   otpInput.setAttribute("inputmode", "numeric");
//   otpInput.setAttribute("autocomplete", "one-time-code");
//   otpInput.setAttribute("maxlength", "8"); // adjust to your otp length

// });

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DOM Elements & Configuration ---
    const emailInput = document.getElementById("email");
    const otpInput = document.getElementById("otp");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const messageDiv = document.getElementById("message");

    const RESEND_COOLDOWN = 60; // seconds
    // Assume OTP length is 6 digits based on common practice, adjust regex below
    const OTP_LENGTH = 6; 
    const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

    let resendTimer = null;
    let initialSendText = sendOtpBtn.textContent;
    let initialVerifyText = verifyOtpBtn.textContent;

    // --- 2. UX UTILITY FUNCTIONS ---

    /**
     * Shows a message with a specific type and auto-hides it.
     */
    function showMessage(msg, type = "") {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        clearTimeout(messageDiv._hideT);
        messageDiv._hideT = setTimeout(() => {
            messageDiv.textContent = "";
            messageDiv.className = "message";
        }, 4000); // Increased visibility time for better readability
    }
    
    /**
     * Manages button loading state using the CSS spinner class.
     * Requires the .spinner CSS class.
     */
    function setLoading(button, isLoading, loadingText = 'Processing...') {
        if (isLoading) {
            button.disabled = true;
            // Add spinner element to the button
            button.innerHTML = `<span class="spinner"></span> ${loadingText}`; 
        } else {
            button.disabled = false;
            // Restore original text
            if (button.id === 'sendOtpBtn') {
                button.textContent = initialSendText;
            } else if (button.id === 'verifyOtpBtn') {
                button.textContent = initialVerifyText;
            }
        }
    }

    /**
     * Client-side email validation.
     */
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // --- 3. COOLDOWN/TIMER LOGIC ---

    /**
     * Starts the resend countdown timer.
     */
    function startResendCooldown(seconds = RESEND_COOLDOWN) {
        let remaining = seconds;
        clearInterval(resendTimer); // Clear any existing timer
        sendOtpBtn.disabled = true;

        resendTimer = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(resendTimer);
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = "Resend OTP";
            } else {
                sendOtpBtn.textContent = `Resend in ${remaining}s`;
            }
        }, 1000);
    }

    // --- 4. EVENT LISTENERS ---

    // Initial state setup
    otpInput.disabled = true;
    verifyOtpBtn.disabled = true;

    // Enable/Disable buttons based on input validity
    emailInput.addEventListener('input', () => {
        sendOtpBtn.disabled = !validateEmail(emailInput.value.trim());
    });

    otpInput.addEventListener('input', () => {
        verifyOtpBtn.disabled = !OTP_REGEX.test(otpInput.value.trim());
    });


    // --- Send OTP Handler ---
    sendOtpBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            showMessage("Enter a valid email address.", "error");
            return;
        }

        setLoading(sendOtpBtn, true, 'Sending...'); // Show loading spinner
        
        // Clear message immediately to prevent flashing error text
        messageDiv.textContent = "";
        messageDiv.className = "message";

        try {
            const res = await fetch("https://your-api.example.com/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            
            if (data.success) {
                showMessage(data.message || "OTP sent successfully!", "success");
                otpInput.disabled = false;
                otpInput.focus();
                
                // Set max length based on known OTP length
                otpInput.setAttribute("maxlength", OTP_LENGTH); 

                // Start cooldown
                startResendCooldown(RESEND_COOLDOWN);
            } else {
                // Handle non-success response from server (e.g., rate limit)
                showMessage(data.message || "Failed to send OTP. Try again.", "error");
                sendOtpBtn.disabled = false;
            }
        } catch (err) {
            console.error("Send OTP error:", err);
            showMessage("Network error sending OTP. Check connection.", "error");
            sendOtpBtn.disabled = false;
        } finally {
            // Restore button visual state after fetch is complete, unless cooldown started
            if (!resendTimer || resendTimer === null) {
                setLoading(sendOtpBtn, false);
            }
        }
    });

    // --- Verify OTP Handler ---
    verifyOtpBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const otp = otpInput.value.trim();

        if (!OTP_REGEX.test(otp)) {
            showMessage(`Enter a valid ${OTP_LENGTH}-digit OTP.`, "error");
            otpInput.value = "";
            return;
        }

        setLoading(verifyOtpBtn, true, 'Verifying...'); // Show loading spinner
        clearInterval(resendTimer); // Stop resend timer during verification attempt

        try {
            const res = await fetch("https://your-api.example.com/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });

            const data = await res.json();

            if (data.success) {
                showMessage(data.message || "Verification successful. Redirecting...", "success");
                
                // Final success state
                verifyOtpBtn.disabled = true;
                sendOtpBtn.disabled = true;

                // Safely redirect after a short delay
                setTimeout(() => {
                    window.location.href = "/dashboard.html";
                }, 500);

            } else {
                showMessage(data.message || "Invalid OTP. Please try again.", "error");
                otpInput.value = ""; 
                otpInput.focus();
            }
        } catch (err) {
            console.error("Verify OTP error:", err);
            showMessage("Network error verifying OTP.", "error");
            otpInput.value = ""; 
        } finally {
            setLoading(verifyOtpBtn, false);
        }
    });

    // --- 5. Initial Enhancements for UX/Security ---
    otpInput.setAttribute("inputmode", "numeric");
    otpInput.setAttribute("autocomplete", "one-time-code");
    otpInput.setAttribute("maxlength", OTP_LENGTH);
});