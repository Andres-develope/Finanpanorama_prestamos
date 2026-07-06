/* ==========================================
   FINANPANORAMA - ADMIN LOGIN
   JavaScript de la página de login administrativo
   ========================================== */

// Verificar si ya está logueado
var token = localStorage.getItem('adminToken');
if (token) {
    fetch('/api/auth/verify', {
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(function (res) { return res.json(); }).then(function (data) {
        if (data.authenticated) {
            window.location.href = '/admin/clientes';
        }
    });
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('visible');

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    try {
        var res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        var data = await res.json();

        if (res.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = '/admin/clientes';
        } else {
            errorDiv.textContent = data.error || 'Credenciales incorrectas';
            errorDiv.classList.add('visible');
        }
    } catch (err) {
        errorDiv.textContent = 'Error de conexión';
        errorDiv.classList.add('visible');
    }
});
