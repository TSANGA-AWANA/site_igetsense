<?php
header('Content-Type: application/json');
$servername = "localhost";
$username = "root"; // Remplace par ton utilisateur MySQL
$password = ""; // Remplace par ton mot de passe MySQL
$dbname = "quiz_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connexion échouée"]));
}

$sql = "SELECT id, question, answer1, answer2, answer3, answer4, correct_answer FROM questions";
$result = $conn->query($sql);

$questions = [];
while ($row = $result->fetch_assoc()) {
    $questions[] = [
        "question" => $row["question"],
        "answers" => [$row["answer1"], $row["answer2"], $row["answer3"], $row["answer4"]],
        "correct" => $row["correct_answer"] - 1
    ];
}

echo json_encode($questions);
$conn->close();
?>
