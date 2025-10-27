const client = new Appwrite.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c08acf000251b3be4d');

const account = new Appwrite.Account(client);
const database = new Appwrite.Databases(client);
const userid = Appwrite.ID.unique();
const password = Appwrite.ID.unique(30);

// === Vérifie consentement cookie ===
function checkCookieConsent() {
    let consent = localStorage.getItem("cookie_consent");
    if (!consent) {
        document.getElementById("cookie-banner").style.display = "block";
    }
}

document.getElementById("acceptCookies").addEventListener("click", () => {
    localStorage.setItem("cookie_consent", "accepted");
    document.getElementById("cookie-banner").style.display = "none";
    console.log("Cookies acceptés ✅");
});

document.getElementById("rejectCookies").addEventListener("click", () => {
    localStorage.setItem("cookie_consent", "rejected");
    document.getElementById("cookie-banner").style.display = "none";
    console.log("Cookies refusés ❌");
});
window.createAppwriteAccount = async function(formData) {
    try {
        const result = await account.create(
            userid,
            formData.email,
            password,
            `${formData.nom} ${formData.prenom}`
        );
         await account.createEmailSession(formData.email,password);
        console.log("Session créée avec succès !");

        // 3. Sauvegarde des préférences utilisateur
        await saveUserPrefs(formData);
        console.log("Compte et préférences configurés !");
        // 4. Vérifier consentement avant de sauvegarder les préférences
        if (localStorage.getItem("cookie_consent") === "accepted") {
            await saveUserPrefs(formData);
            localStorage.setItem("theme", "light");
            console.log("Préférences enregistrées ✅");
        } else {
            console.log("Pas de préférences enregistrées (cookies refusés)");
        }
        return result;
    } catch (error) {
        console.error("Erreur lors de la création du compte :", error.message);
        throw error;
    }  
};

// fonction de connexion avec l'utilisateur
async function loginWithUserId(email, password) {
    try {
        await account.createEmailSession(email, password);
        alert("Connexion réussie !");
        // window.location.href = "accueil.html";
    } catch (error) {
        console.error("Erreur de connexion : " + error.message);
    }
}

async function saveUserPrefs(formData) {
    try {
        await account.updatePrefs({
            telephone: formData.telephone,
            sexe: formData.genre,
            type: formData.type,
            specialite: formData.specialite,
            serie: formData.serie,
            classe: formData.classe,
            ecole: formData.etablissement,
            examen: formData.examen, // <-- Ajouté
            typeCompte: "free" // Ajout du type de compte par défaut
        });
        console.log("Préférences enregistrées !");
    } catch (error) {
        console.error("Erreur :", error.message);
    }
}

async function loginAndLoadPrefs(userid, password) {
    try {
        await account.createSession(userid, password);
        const prefs = await account.getPrefs();
        console.log("Prefs utilisateur :", prefs);
    } catch (error) {
        console.error("Erreur :", error.message);
    }
}

// Appelle cette fonction après que l'utilisateur ait saisi ses identifiants
// loginAndLoadPrefs('user@email.com', 'motdepasse');
// === Vérifier si déjà inscrit ===
async function checkIfLoggedIn() {
  try {
    const user = await account.get(); // Vérifie si une session existe
    if (user) {
      console.log("Utilisateur déjà connecté :", user);
      window.location.href = "accueil.html";
    }
  } catch (err) {
    console.log("Pas encore connecté :", err.message);
    // Fallback localStorage
    if (localStorage.getItem("inscription_ok") === "true") {
      window.location.href = "accueil.html";
    }
  }
}

// Lancer vérification au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    checkCookieConsent();
    checkIfLoggedIn();
});

window.database = database;

