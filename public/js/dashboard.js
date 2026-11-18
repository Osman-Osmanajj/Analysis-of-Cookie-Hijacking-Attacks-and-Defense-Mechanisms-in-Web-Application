const welcomeMessage = document.getElementById("WelcomeMessage");
const logoutButton = document.getElementById("logoutButton");
const logoutResult = document.getElementById("logoutResult");

async function loadUser(){
    try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if(!response.ok){
            window.location.href = "/login.html";
            return;
        }
        welcomeMessage.textContent = `Welcome, ${data.user.username}!`;
    } catch (error) {
        welcomeMessage.textContent = "Couldn't load user information";
    }
}

logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST"
        });
        const data = await response.json();

        if(response.ok && data.success){
            window.location.href = "/login.html";
        }else{
            logoutResult.textContent = data.message;
        }
    } catch (error) {
          console.error(error);
        logoutResult.textContent = "Logout Failed";
    }
});
loadUser();
