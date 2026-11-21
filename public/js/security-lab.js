const labModeBadge = document.getElementById("labModeBadge");
const currentTransport = document.getElementById("currentTransport");

const readCookiesButton = document.getElementById("readCookies");
const cookieVerdict = document.getElementById("cookieVerdict");
const cookieOutput = document.getElementById("cookieOutput");
const toggleCookieValue = document.getElementById("toggleCookieValue");

const checkSessionButton = document.getElementById("checkSessionButton");
const sessionStatus = document.getElementById("sessionStatus");
const sessionResult = document.getElementById("sessionResult");

const showTrafficSteps = document.getElementById("showTrafficSteps");
const trafficSteps = document.getElementById("trafficSteps");

const logoutButton = document.getElementById("logoutButton");
const logoutResult = document.getElementById("logoutResult");

let labConfig = null;
let readableCookie = "";
let cookieIsVisible = false;

function showResult(element, message, type) {
    element.textContent = message;
    element.classList.remove("is-good", "is-risk");

    if (type) {
        element.classList.add(type);
    }
}

async function loadLabConfig() {
    try {
        const response = await fetch("/api/status", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Konfigurimi nuk u ngarkua");
        }

        labConfig = await response.json();
        currentTransport.textContent = labConfig.protocol;

        if (labConfig.protocol === "HTTPS") {
            labModeBadge.textContent = "HTTPS · Lidhje e koduar";
        } else {
            labModeBadge.textContent = "HTTP · Lidhje e pakoduar";
            labModeBadge.classList.add("is-insecure");
        }

        readCookiesButton.disabled = false;
    } catch (error) {
        console.error(error);
        labModeBadge.textContent = "Konfigurimi nuk u ngarkua";
        currentTransport.textContent = "Nuk dihet";
    }
}

async function checkSession() {
    try {
        const response = await fetch("/api/auth/me", {
            cache: "no-store"
        });

        if (response.status === 401) {
            sessionStatus.textContent = "Nuk je i kyçur.";
            showResult(
                sessionResult,
                "Sesioni ka skaduar ose është anuluar.",
                "is-risk"
            );
            return;
        }

        if (!response.ok) {
            throw new Error("Kontrolli i sesionit dështoi");
        }

        const data = await response.json();

        sessionStatus.textContent =
            `I kyçur si ${data.user.username}`;

        showResult(
            sessionResult,
            "Sesioni është aktiv. Serveri të njeh.",
            "is-good"
        );
    } catch (error) {
        console.error(error);
        showResult(
            sessionResult,
            "Nuk u arrit lidhja me serverin.",
            "is-risk"
        );
    }
}

function maskedCookie() {
    const name = labConfig.cookie.name;
    const value = readableCookie.slice(name.length + 1);

    return `${name}=${value.slice(0, 6)}…${value.slice(-4)} (vlera e fshehur)`;
}

readCookiesButton.addEventListener("click", () => {
    if (!labConfig) {
        return;
    }

    const name = labConfig.cookie.name;
    const cookieParts = document.cookie.split("; ");

    readableCookie =
        cookieParts.find((part) => part.startsWith(`${name}=`)) || "";

    cookieIsVisible = false;
    toggleCookieValue.hidden = true;
    toggleCookieValue.textContent = "Shfaq vlerën";

    if (readableCookie) {
        showResult(
            cookieVerdict,
            "Cookie-ja e sesionit u lexua nga JavaScript.",
            "is-risk"
        );

        cookieOutput.textContent = maskedCookie();
        toggleCookieValue.hidden = false;
    } else {
        const explanation = labConfig.cookie.httpOnly
            ? "HttpOnly është aktiv; cookie-ja e sesionit nuk shfaqet në document.cookie."
            : "Cookie-ja e sesionit nuk u gjet në document.cookie.";

        showResult(cookieVerdict, explanation, "is-good");
        cookieOutput.textContent =
            "Asnjë vlerë e cookie-së së sesionit nuk u lexua.";
    }
});

toggleCookieValue.addEventListener("click", () => {
    if (!readableCookie) {
        return;
    }

    cookieIsVisible = !cookieIsVisible;

    cookieOutput.textContent =
        cookieIsVisible ? readableCookie : maskedCookie();

    toggleCookieValue.textContent =
        cookieIsVisible ? "Fshihe vlerën" : "Shfaq vlerën";
});

checkSessionButton.addEventListener("click", checkSession);

showTrafficSteps.addEventListener("click", () => {
    trafficSteps.hidden = !trafficSteps.hidden;

    showTrafficSteps.setAttribute(
        "aria-expanded",
        String(!trafficSteps.hidden)
    );

    showTrafficSteps.textContent = trafficSteps.hidden
        ? "Shiko hapat për Wireshark"
        : "Fshihi hapat";
});

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

loadLabConfig();
checkSession();