const loginForm = document.getElementById("loginForm");
const loginResult = document.getElementById("loginResult");

loginForm.addEventListener("submit",async(event) =>{
event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/auth/login",{
            method : "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password    
            })
        });

        const data = await response.json();

        loginResult.textContent = data.message;

        if(response.ok && data.success){
                loginResult.style.color = "green";

                setTimeout(() =>{
                    window.location.href = "/dashboard";
                },1000);
            }
            else{
                loginResult.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        loginResult.textContent = "Couldn't connect to the server";
        loginResult.style.color = "red";
    }
});
