<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Configuration de la base (identique à db.php)
$servername = "localhost";
$username = "votre_utilisateur_mysql";
$password = "votre_mot_de_passe_mysql";
$dbname = "quiz_app";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Échec de la connexion : " . $conn->connect_error);
}

// Récupérer les 10 meilleurs scores
$result = $conn->query("
    SELECT name, score 
    FROM leaderboard 
    ORDER BY score DESC 
    LIMIT 10
");

$leaderboard = [];
while ($row = $result->fetch_assoc()) {
    $leaderboard[] = $row;
}

echo json_encode($leaderboard);

$conn->close();
?>