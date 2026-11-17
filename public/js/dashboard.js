const welcomeMessage = document.getElementById("WelcomeMessage");
const logoutButton = document.getElementById("logoutButton");
const logoutResult = document.getElementById("logoutResult");

//check authenticatedd user
async function loadUser(){
    try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if(!response.ok){
            window.location.href = "/login.html";
            return;
        }
        welcomeMessage.textContent = `Welcome ,${data.user.username}`;
    } catch (error) {
        welcomeMessage.textContent = "Couldn't load user information";
    }
}

//logoutiii
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

// const welcomeMessage = document.getElementById("welcomeMessage");
// const logoutButton = document.getElementById("logoutButton");
// const logoutResult = document.getElementById("logoutResult");

// // Check authenticated user
// async function loadUser() {
//     try {
//         const response = await fetch("/api/auth/me");
//         const data = await response.json();

//         if (!response.ok) {
//             window.location.href = "/login.html";
//             return;
//         }

//         welcomeMessage.textContent =
//             `Welcome, ${data.user.username}!`;

//     } catch (error) {
//         console.error(error);
//         welcomeMessage.textContent =
//             "Could not load user information.";
//     }
// }

// // Logout
// logoutButton.addEventListener("click", async () => {
//     try {
//         const response = await fetch("/api/auth/logout", {
//             method: "POST"
//         });

//         const data = await response.json();

//         if (response.ok && data.success) {
//             window.location.href = "/login.html";
//         } else {
//             logoutResult.textContent = data.message;
//         }

//     } catch (error) {
//         console.error(error);
//         logoutResult.textContent = "Logout failed.";
//     }
// });

// loadUser();