const registerForm = document.getElementById("registerForm");
const registerResult = document.getElementById("registerResult");

registerForm.addEventListener("submit", async(event) =>{
    event.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if( password != confirmPassword){
        registerResult.textContent = "Fjalekalimet nuk perputhen ndermjet veti";
        registerResult.style.color = "red";
        return;
    }
    try {
        const response = await fetch ("/api/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username,password})
        });
         const data = await response.json();
        registerResult.textContent = data.message;
        registerResult.style.color =
            response.ok && data.success ? "green" : "red";

       if (response.ok && data.success) {
       window.location.href = "/login.html";
}
    } catch (error) {
        console.error(error);
        registerResult.textContent = "Nuk u arrit lidhja me serverin";
        registerResult.style.color = "red";
    }
});