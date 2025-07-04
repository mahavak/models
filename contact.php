
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
    $message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);
    $newsletter = isset($_POST['newsletter']) ? true : false;

    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo "Please fill in all required fields.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Invalid email format.";
        exit;
    }

    $submission = [
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'newsletter' => $newsletter,
        'date' => date("Y-m-d H:i:s")
    ];

    $file = 'submissions.json';
    $current_data = file_get_contents($file);
    $array_data = json_decode($current_data, true);
    $array_data[] = $submission;
    $final_data = json_encode($array_data, JSON_PRETTY_PRINT);

    if (file_put_contents($file, $final_data)) {
        http_response_code(200);
        echo "Thank you for your message! We'll get back to you within 24 hours.";
    } else {
        http_response_code(500);
        echo "Something went wrong. Please try again later.";
    }
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
