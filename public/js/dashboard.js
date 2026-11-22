const logoutButton = document.getElementById("logoutButton");
const logoutResult = document.getElementById("logoutResult");
const modeBadge = document.getElementById("modeBadge");

async function loadDashboard(){
    try {
        const [userResponse, statusResponse] = await Promise.all([
            fetch("/api/auth/me"),
            fetch("/api/status")
        ]);

        if(!userResponse.ok){
            window.location.href="/login.html";
            return;
        }
        if(!statusResponse.ok){
            throw new Error("Gjendja e laboratorit nuk u ngarkua");
        }
        const statusData = await statusResponse.json();
        document.getElementById("protocolValue").textContent = statusData.protocol;
        document.getElementById("httpOnlyValue").textContent= statusData.cookie.httpOnly ? "Aktiv" : "Joaktiv";
        document.getElementById("secureValue").textContent = statusData.cookie.secure ? "Aktiv" : " Joaktiv";
         document.getElementById("sameSiteValue").textContent =
            statusData.cookie.sameSite;
            document.getElementById("protocolCard").classList.toggle(
    "is-off",
    statusData.protocol !== "HTTPS"
);

document.getElementById("httpOnlyCard").classList.toggle(
    "is-off",
    !statusData.cookie.httpOnly
);

document.getElementById("secureCard").classList.toggle(
    "is-off",
    !statusData.cookie.secure
);

document.getElementById("sameSiteCard").classList.toggle(
    "is-off",
    String(statusData.cookie.sameSite).toLowerCase() === "none"
);

        document.getElementById("cookieName").textContent =
            statusData.cookie.name;

        if (statusData.protocol === "HTTPS") {
            modeBadge.textContent = "HTTPS · Lidhje e koduar";
        } else {
            modeBadge.textContent = "HTTP · Lidhje e pakoduar";
            modeBadge.classList.add("is-insecure");
        }
    } catch (error) {
        console.error(error);
        modeBadge.textContent = "Gjendja nuk dihet";
    }
}

logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST"
        });
        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = "/login.html";
        } else {
            logoutResult.textContent =
                data.message || "Dalja nga llogaria dështoi.";
        }
    } catch (error) {
        console.error(error);
        logoutResult.textContent =
            "Nuk u arrit lidhja me serverin.";
    }
});

loadDashboard();