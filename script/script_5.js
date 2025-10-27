// Assure-toi que Appwrite est chargé via CDN dans le HTML
const client = new Appwrite.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c08acf000251b3be4d');
const account = new Appwrite.Account(client);

async function loadUserUI() {
    try {
        // Récupération des prefs
        const prefs = await account.getPrefs();

        // Mise à jour de l’UI
        document.getElementById("nom").value = prefs.nom || "";
        document.getElementById("prenom").value = prefs.prenom || "";
        document.getElementById("email").value = prefs.email || "";
        document.getElementById("tel").value = prefs.telephone || "";
        document.getElementById("genre").value = prefs.genre || "";
        document.getElementById("serie").value = prefs.serie || "";
        document.getElementById("classe").value = prefs.classe || "";
        document.getElementById("etablissement").value = prefs.etablissement || "";
        document.getElementById("studyType").value = prefs.type || "";
        document.getElementById("specialite").value = prefs.specialite || "";
    } catch (error) {
        console.error("Erreur lors du chargement du profil :", error.message);
    }
}

// Charger le profil après login
loadUserUI();

// Références aux éléments
  const studyType = document.getElementById('studyType');
  const specialiteContainer = document.querySelector('.specialite-container');
  const serie = document.getElementById('serie');
  const profilePhoto = document.getElementById('profilePhoto');
  const photoInput = document.getElementById('photoInput');
  let isEditMode = false;
  let currentPhoto = localStorage.getItem('profilePhoto') || profilePhoto.src;

  // Charger la photo sauvegardée
  profilePhoto.src = currentPhoto;

  // Gestion photo de profil
  photoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
              profilePhoto.src = e.target.result;
              localStorage.setItem('profilePhoto', e.target.result);
          };
          reader.readAsDataURL(file);
      }
  });

  // Mise à jour dynamique du formulaire
  function updateForm() {
      specialiteContainer.style.display = studyType.value === 'technicien' ? 'flex' : 'none';
      
      serie.innerHTML = '';
      const series = studyType.value === 'generaliste' 
          ? ['A', 'B', 'C', 'E'] 
          : ['F1', 'F2', 'F3', 'SES'];
      
      series.forEach(option => {
          const opt = document.createElement('option');
          opt.textContent = option;
          serie.appendChild(opt);
      });
  }

  // Gestionnaire d'événements
  studyType.addEventListener('change', updateForm);

  // Mode édition
  document.getElementById('editButton').addEventListener('click', function() {
      isEditMode = !isEditMode;
      const container = document.querySelector('.profile-photo-container');
      const elements = document.querySelectorAll('#profileForm input, #profileForm select');
      
      container.classList.toggle('edit-mode', isEditMode);
      elements.forEach(el => {
          if(el.tagName === 'INPUT') {
              el.readOnly = !isEditMode;
          } else {
              el.disabled = !isEditMode;
          }
          el.style.backgroundColor = isEditMode ? '#fff' : '#f8fafc';
      });

      if(isEditMode) studyType.dispatchEvent(new Event('change'));
      
      this.textContent = isEditMode ? '💾 Sauvegarder' : '✏️ Modifier';
      if(!isEditMode) alert('Modifications sauvegardées !');
  });

  // Gestion popup
  const popup = document.getElementById('profilePopup');
  document.getElementById('openPopup').addEventListener('click', () => popup.style.display = 'block');
  document.getElementById('closePopup').addEventListener('click', () => popup.style.display = 'none');
  window.addEventListener('click', (e) => e.target === popup && (popup.style.display = 'none'));

  // Déconnexion
  document.getElementById('logoutButton').addEventListener('click', () => {
      if(confirm('Voulez-vous vraiment vous déconnecter ?')) {
          alert('Déconnexion réussie !');
          popup.style.display = 'none';

          window.location.href = 'accueil.html';
      }
  });

  async function saveUserPrefsFromForm() {
    try {
        await account.updatePrefs({
            nom: document.getElementById("nom").value,
            prenom: document.getElementById("prenom").value,
            email: document.getElementById("email").value,
            telephone: document.getElementById("tel").value,
            genre: document.getElementById("genre").value,
            serie: document.getElementById("serie").value,
            classe: document.getElementById("classe").value,
            etablissement: document.getElementById("etablissement").value,
            type: document.getElementById("studyType").value,
            specialite: document.getElementById("specialite").value
        });
        alert("Profil mis à jour !");
        loadUserUI();
    } catch (error) {
        alert("Erreur lors de la mise à jour : " + error.message);
    }
}