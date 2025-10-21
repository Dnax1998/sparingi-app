// auth-check.js
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  // Jeśli użytkownik NIE jest zalogowany, przekieruj na stronę logowania
  if (!isLoggedIn) {
    alert("Zaloguj się, aby uzyskać dostęp do tej strony.");
    window.location.replace("index.html");
  }
});
