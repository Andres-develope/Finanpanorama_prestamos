/* ==========================================
   FINANPANORAMA - ÉXITO
   JavaScript de la página de registro exitoso
   ========================================== */

// Cargar datos del cliente desde sessionStorage
var clienteData = sessionStorage.getItem('clienteFirmado');
if (clienteData) {
    var cliente = JSON.parse(clienteData);
    document.getElementById('clienteNombre').textContent =
        ((cliente.nombre || '') + ' ' + (cliente.apellido || '')).toUpperCase();
    document.getElementById('clienteDocumento').textContent =
        cliente.numeroDocumento || cliente.numero_documento || '-';
    document.getElementById('clienteMonto').textContent =
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cliente.cantidad || 0);
}

// Confetti animation
function createConfetti() {
    var container = document.getElementById('confetti');
    var colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];

    for (var i = 0; i < 50; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(piece);
    }

    setTimeout(function () { container.innerHTML = ''; }, 5000);
}

createConfetti();
