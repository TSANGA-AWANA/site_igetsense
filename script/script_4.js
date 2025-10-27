/***************************************
 * VARIABLES GLOBALES ET CONFIGURATION *
 ***************************************/
//let formData = {};
window.formData = {
    nom: document.getElementById('nom')?.value || '',
    prenom: document.getElementById('prenom')?.value || '',
    email: document.getElementById('email')?.value || '',
    telephone: document.getElementById('telephone')?.value || '',
    genre: document.getElementById('genre')?.value || '',
    type: document.getElementById('type')?.value || '',
    specialite: document.getElementById('specialite')?.value || '',
    serie: document.getElementById('serie')?.value || '',
    classe: document.getElementById('classe')?.value || '',
    etablissement: document.getElementById('etablissement')?.value || '',
    examen: document.getElementById('examen')?.value || '' // <-- Ajouté
    // Ajoute tous les autres champs nécessaires
};

// Configuration des séries par spécialité
const seriesOptions = {
    industriel: ["E", "F1", "F2", "F3", "F4-BA", "F4-TP", "F4-BE", "F5",
        "F6-BIPE", "F6-COPH", "F6-MIPE", "F7-BIOLAP", "F7-BIOTECH", "F7-BIOLO", "F7-BIOCH",
        "F8", "MISE", "GT", "CI", "MEM", "MEB", "ISRH", "AMEB", "MAGE",
        "CMA-MVPL", "CMA-MVT", "MHB", "IB", "EF", "PA", "PV", "TP", "BIJO", "IH", "AG","EE", "MACO"],
    commerciale: ["ACA", "ACC", "SES", "AAT", "AV", "CG", "ESF", "TOUR", "FIG","ESF", "ESCOM"],
};

/********************
 * FONCTIONS PRINCIPALES *
 ********************/

/**
 * Met à jour les options de série en fonction de la spécialité sélectionnée
 */
function updateSeries() {
    const specialiteSelect = document.getElementById('specialite');
    const serieSelect = document.getElementById('serie');

    if (!specialiteSelect || !serieSelect) {
        console.error("Éléments introuvables !");
        return;
    }

    const selectedSpecialite = specialiteSelect.value.toLowerCase();
    const series = seriesOptions[selectedSpecialite] || [];

    // Réinitialiser et remplir le selecteur de série
    serieSelect.innerHTML = '<option value="">Choisissez une série</option>';
    
    series.forEach(serie => {
        const option = document.createElement('option');
        option.value = serie;
        option.textContent = serie;
        serieSelect.appendChild(option);
    });
}

/**
 * Affiche/masque les champs spécialité et série selon le type d'études
 */
function toggleSpecialiteAndSerie() {
    const typeSelect = document.getElementById('type');
    const specialiteGroup = document.getElementById('specialite-group');
    const specialiteSelect = document.getElementById('specialite');
    const serieSelect = document.getElementById('serie');
    const type = typeSelect.value;

    if (type === 'Technicien') {
        specialiteGroup.style.display = 'block';
        specialiteSelect.required = true;
        
        // Force la mise à jour des séries
        updateSeries();
    } else {
        // Masquer le champ spécialité pour les généralistes
        specialiteGroup.style.display = 'none';
        specialiteSelect.required = false;
        specialiteSelect.value = '';
        
        // Réinitialiser les séries
        serieSelect.innerHTML = '<option value="">Choisissez une série</option>';
        
        if (type === 'Generaliste') {
            // Séries par défaut pour les généralistes
            ["A1", "A2", "A3", "A4", "A5", "C", "D", "E", "TI", "ABI", "SH", "AC"].forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                serieSelect.appendChild(option);
            });
        }
    }
}

/**
 * Ouvre un modal spécifique
 * @param {number} step - Numéro du modal à afficher
 */
function openModal(step) {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById(`modal${step}`).style.display = 'flex';
    updateProgress(step);
}

/**
 * Met à jour la barre de progression
 * @param {number} step - Étape actuelle
 */
function updateProgress(step) {
    document.querySelectorAll('.progress-steps').forEach(progress => {
        const steps = progress.querySelectorAll('.step');
        steps.forEach((s, index) => {
            s.classList.toggle('active', index < step);
        });
    });
}

/**
 * Valide le formulaire
 * @param {number} step - Étape à valider
 * @returns {boolean} True si le formulaire est valide
 */
function validateForm(step) {
    let isValid = true;
    const modal = document.getElementById(`modal${step}`);

    // Validation des champs requis
    modal.querySelectorAll('[required]').forEach(input => {
        const group = input.closest('.input-group');
        const error = group.querySelector('.error-message');

        if (!input.checkValidity()) {
            isValid = false;
            group.classList.add('error');
            error.style.display = 'block';
        } else {
            group.classList.remove('error');
            error.style.display = 'none';
        }
    });

    // Validation spécifique pour l'étape 
    if (step === 2) {
        const type = document.getElementById('type').value;
        const specialite = document.getElementById('specialite');
        const specialiteGroup = document.getElementById('specialite-group');

        if (type === 'Technicien' && !specialite.value) {
            specialiteGroup.classList.add('error');
            specialiteGroup.querySelector('.error-message').style.display = 'block';
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Passe au modal suivant
 * @param {number} current - Modal actuel
 * @param {number} next - Modal suivant
 */
function nextModal(current, next) {
    if (!validateForm(current)) return;

    // Sauvegarde des données du formulaire
    document.querySelectorAll(`#modal${current} input, #modal${current} select`).forEach(input => {
    if (input.type === 'radio') {
        if (input.checked) formData[input.name] = input.value;
    } else {
        formData[input.id] = input.value;
    }
});

    if (next === 3) updateRecap();
    openModal(next);
}

/**
 * Retourne au modal précédent
 * @param {number} current - Modal actuel
 * @param {number} previous - Modal précédent
 */
function prevModal(current, previous) {
    openModal(previous);
}

/**
 * Met à jour le récapitulatif
 */
function updateRecap() {
    const recap = document.getElementById('recap-content');
    recap.innerHTML = `
        <div class="recap-item"><strong>Nom complet:</strong> ${formData.prenom} ${formData.nom}</div>
        <div class="recap-item"><strong>Coordonnées:</strong><br>📧 ${formData.email}<br>📱 ${formData.telephone}</div>
        <div class="recap-item"><strong>Genre:</strong> ${formData.genre || 'Non spécifié'}</div>
        <div class="recap-item"><strong>Études:</strong> ${formData.type}
        ${formData.specialite ? `<br><strong>Spécialité:</strong> ${formData.specialite}` : ''}</div>
        <div class="recap-item"><strong>Examen:</strong> ${formData.examen}</div>
        <div class="recap-item"><strong>Classe:</strong> ${formData.classe} (${formData.serie})</div>
        <div class="recap-item"><strong>Établissement:</strong> ${formData.etablissement}</div>
    `;
}

/**
 * Soumet le formulaire
 */

async function submitForm() {
    try {
        // Vérification du numéro via la Cloud Function
        const phone = window.formData.telephone;
        const response = await fetch(`https://getuseridbyemailappwrite.vercel.app/get_user_ids_by_phone?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (data && data.userIds && data.userIds.length > 0) {
                showRedirectPopup();
             return;
        }
        // Si le numéro est unique, continuer la création du compte
        // Création du compte (vérifie l'email)
        const result = await window.createAppwriteAccount(window.formData);
        console.log("Compte créé, redirection...");
        setTimeout(() => {
            window.location.href = "accueil.html";
        }, 500); // Redirige après 0,5 secondes pour laisser voir le message
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        window.formData = {};
    } catch (error) {
        if (error.code === 409) {
            //alert("Ce compte existe déjà. Vous allez être redirigé vers la connexion.");
            showRedirectPopup();
            return; // Ne pas rediriger vers accueil si conflit
        } else {
           // alert("Une erreur est survenue : " + error.message);
            // Ici, on laisse la redirection se faire dans finally
        }
    } finally {
        // Redirection vers accueil sauf si déjà redirigé vers connexion
        //setTimeout(() => {
            //window.location.href = "accueil.html";
       //}, 2000); // Redirige après 2 secondes pour laisser voir le message
    }
}

/**
 * Redirige vers la page de connexion si le numéro existe déjà
 */
 function showRedirectPopup() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById("redirectModal").style.display = "flex";
  }
  function goConnexion() {
    window.location.href = "connexion.html";
  }

  function stayHere() {
    document.getElementById("redirectModal").style.display = "none";
    window.location.reload();
  }
  //redirection vers accueil
function redirectToAccueil() {
    window.location.href = "accueil.html";
}

/********************
 * INITIALISATION *
 ********************/
document.addEventListener('DOMContentLoaded', () => {
    // Écouteurs pour la navigation
    document.getElementById('btn-start')?.addEventListener('click', () => openModal(1));
    
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => prevModal(parseInt(btn.dataset.current), parseInt(btn.dataset.previous)));
    });
    
    // Écouteurs pour les sélecteurs
    const typeSelect = document.getElementById('type');
    const specialiteSelect = document.getElementById('specialite');
    
    if (typeSelect) {
        typeSelect.addEventListener('change', toggleSpecialiteAndSerie);
        // Initialiser l'état au chargement
        toggleSpecialiteAndSerie();
    }
    
    if (specialiteSelect) {
        specialiteSelect.addEventListener('change', updateSeries);
    }

    // Soumission du formulaire
    document.getElementById('registrationForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm();
    });
});

// Attachez toutes vos fonctions à window
window.openModal = openModal;
window.updateProgress = updateProgress;
window.nextModal = nextModal;
window.prevModal = prevModal;
window.submitForm = submitForm;
window.toggleSpecialiteAndSerie = toggleSpecialiteAndSerie;
window.updateSeries = updateSeries;
window.redirectToAccueil = redirectToAccueil;