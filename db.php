<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Configuration de la base de données
$servername = "localhost";
$username = "votre_utilisateur_mysql";
$password = "votre_mot_de_passe_mysql";
$dbname = "quiz_app";

// Créer une connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die("Échec de la connexion : " . $conn->connect_error);
}

// Gérer les requêtes GET (récupérer les questions)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM questions");
    $questions = [];

    while ($row = $result->fetch_assoc()) {
        $questions[] = [
            'question' => $row['question'],
            'answers' => json_decode($row['answers']),
            'correct' => (int)$row['correct']
        ];
    }

    echo json_encode($questions);
}

// Gérer les requêtes POST (sauvegarder les scores)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Prévenir les injections SQL
    $stmt = $conn->prepare("INSERT INTO leaderboard (name, score) VALUES (?, ?)");
    $stmt->bind_param("si", $data['name'], $data['score']);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }

    $stmt->close();
}

$conn->close();
?>