const createSessionButton = document.getElementById("createSession");
const readCookieButton = document.getElementById("readCookie");
const sessionResult = document.getElementById("sessionResult");
const cookieResult= document.getElementById("cookieResult");

createSessionButton.addEventListener("click",async() =>{
    try {
        const response = await fetch("/api/session-test");
        const data = await response.json();

        sessionResult.textContent = data.message;
    } catch (error) {
        sessionResult.textContent = "error creating session";
        
    }
});

readCookieButton.addEventListener("click", () =>{
    const cookies = document.cookie;

    cookieResult.textContent = cookies || "No readable cookies found";
})