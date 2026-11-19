const sessionStatus = document.getElementById("sessionStatus");
const cookieOutput = document.getElementById("cookieOutput");
const readCookiesButton = document.getElementById("readCookies");

async function checkSession(){
    try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if(!response.ok){
            window.location.href = "/login.html";
            return ;
        }
        sessionStatus.textContent = `Authenticated as: ${data.user.username}`;
    } catch (error) {
        sessionStatus.textContent = "Couldn't check session";
    }
}
readCookiesButton.addEventListener("click",() =>{
    const cookies = document.cookie;

    cookieOutput.textContent = cookies || "No cookies accessible to JS";
});
checkSession();
const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST"
        });
        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = "/login.html";
        } else {
            sessionStatus.textContent = data.message || "Dalja nga llogaria dështoi";
        }
    } catch (error) {
        console.error(error);
        sessionStatus.textContent = "Nuk u arrit lidhja me serverin";
    }
});