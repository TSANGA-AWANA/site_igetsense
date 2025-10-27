// Récupérer les éléments du DOM
const epreuvesGrid = document.getElementById('epreuvesGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const btnUpload = document.getElementById('btnUpload');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.getElementById('closeModal');
const uploadForm = document.getElementById('uploadForm');

// Données simulées (à remplacer par une requête AJAX vers la base de données)
let epreuves = [
  {
    id: 1,
    titre: "Anglais - Groupe Scolaire Bilingue",
    etablissement: "Kolhouat",
    annee: "2019",
    taille: "800 Ko",
    fichier_path: "epreuves/anglais-kolhouat-2019.pdf",
    progression: 65,
    difficulte: 4,
    matiere: "anglais"
  },
  {
    id: 2,
    titre: "Natation - Championnat Régional",
    etablissement: "BETI",
    annee: "2021",
    taille: "709 Ko",
    fichier_path: "epreuves/natation-beti-2021.pdf",
    progression: 40,
    difficulte: 3,
    matiere: "natation"
  }
];

// Afficher les épreuves
function afficherEpreuves(epreuves) {
  epreuvesGrid.innerHTML = '';
  epreuves.forEach(epreuve => {
    const card = document.createElement('div');
    card.className = 'epreuve-card';
    card.innerHTML = `
      <div class="card-header">
        <img src="images/${epreuve.matiere}-icon.png" alt="${epreuve.matiere}" class="matiere-icon">
        <div class="metadata">
          <span class="annee">${epreuve.annee}</span>
          <span class="taille">${epreuve.taille}</span>
        </div>
      </div>
      <h3>${epreuve.titre}</h3>
      <p>${epreuve.etablissement}</p>
      <div class="rating">
        <span class="stars">${'★'.repeat(epreuve.difficulte)}${'☆'.repeat(5 - epreuve.difficulte)}</span>
        <span class="difficulty">Difficulté : ${epreuve.difficulte <= 2 ? 'Facile' : epreuve.difficulte <= 4 ? 'Moyenne' : 'Difficile'}</span>
      </div>
      <div class="progress-bar">
        <div class="progress" style="width: ${epreuve.progression}%"></div>
        <span>${epreuve.progression}% complété</span>
      </div>
      <a href="${epreuve.fichier_path}" class="btn-start">Télécharger ▶️</a>
    `;
    epreuvesGrid.appendChild(card);
  });
}

// Filtrer les épreuves
function filtrerEpreuves(filter) {
  let epreuvesFiltrees = epreuves;
  if (filter === "anglais") {
    epreuvesFiltrees = epreuves.filter(e => e.matiere === "anglais");
  } else if (filter === "natation") {
    epreuvesFiltrees = epreuves.filter(e => e.matiere === "natation");
  } else if (filter === "historique") {
    epreuvesFiltrees = epreuves.filter(e => e.annee < 2020); // Simule l'historique
  } else if (filter === "f3") {
    epreuvesFiltrees = epreuves.filter(e => e.titre.includes("F3"));
  } else if (filter === "bac") {
    epreuvesFiltrees = epreuves.filter(e => e.titre.includes("Baccalauréat"));
  } else if (filter === "favoris") {
    epreuvesFiltrees = epreuves.filter(e => e.progression > 70); // Simule les favoris
  }
  afficherEpreuves(epreuvesFiltrees);
}

// Recherche dynamique
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const epreuvesFiltrees = epreuves.filter(e => 
    e.titre.toLowerCase().includes(searchTerm) || 
    e.etablissement.toLowerCase().includes(searchTerm)
  );
  afficherEpreuves(epreuvesFiltrees);
});

// Gestion des filtres
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    filtrerEpreuves(button.dataset.filter);
  });
});

// Gestion du bouton "Envoyer une épreuve"
btnUpload.addEventListener('click', () => {
  uploadModal.style.display = 'flex';
});

// Fermer le modal
closeModal.addEventListener('click', () => {
  uploadModal.style.display = 'none';
});

// Soumission du formulaire d'envoi d'épreuve
uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const titre = document.getElementById('titre').value;
  const matiere = document.getElementById('matiere').value;
  const etablissement = document.getElementById('etablissement').value;
  const annee = document.getElementById('annee').value;
  const fichier = document.getElementById('fichier').files[0];

  if (titre && matiere && etablissement && annee && fichier) {
    const nouvelleEpreuve = {
      id: epreuves.length + 1,
      titre,
      etablissement,
      annee,
      taille: `${Math.round(fichier.size / 1024)} Ko`,
      fichier_path: URL.createObjectURL(fichier),
      progression: 0,
      difficulte: 3,
      matiere: matiere.toLowerCase()
    };

    epreuves.push(nouvelleEpreuve);
    afficherEpreuves(epreuves);
    uploadModal.style.display = 'none';
    uploadForm.reset();
  } else {
    alert("Veuillez remplir tous les champs.");
  }
});

// Charger les épreuves au démarrage
afficherEpreuves(epreuves);

// Récupérer les épreuves depuis la base de données
fetch('./get_epreuves.php') // Assurez-vous que le chemin est correct
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`); // Gère les erreurs HTTP
    }
    return response.json();
  })
  .then(data => {
    afficherEpreuves(data);
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des épreuves :", error);
    alert("Impossible de charger les épreuves. Veuillez vérifier votre connexion ou contacter l'administrateur.");
  });