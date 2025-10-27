 document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupération des valeurs du formulaire
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            
            // Ici, vous pouvez ajouter la logique de traitement du formulaire
            console.log('Formulaire soumis:', { firstName, lastName, phone, email });
            
            // Message de confirmation (à remplacer par une redirection ou autre)
            alert('Connexion en cours...');
        });
        
        // Gestion du bouton Google
        document.querySelector('.google-btn').addEventListener('click', function() {
            // Ici, vous pouvez ajouter la logique d'authentification Google
            alert('Connexion avec Google en cours...');
        });