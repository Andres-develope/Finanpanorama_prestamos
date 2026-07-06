/* ==========================================
   FINANPANORAMA - SOLICITUD
   JavaScript del formulario de solicitud
   ========================================== */

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function showToast(msg, type) {
    if (type === undefined) type = 'success';
    var c = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span>' + (type === 'success' ? '✅' : '❌') + '</span><span>' + msg + '</span>';
    c.appendChild(t);
    setTimeout(function () { t.remove(); }, 4000);
}

document.getElementById('solicitudForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var data = Object.fromEntries(formData);

    console.log('Enviando datos:', data);

    try {
        var res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        var result = await res.json();
        console.log('Respuesta del servidor:', res.status, result);

        if (res.ok && result.id) {
            showToast('¡Solicitud enviada correctamente!');
            console.log('Redirigiendo a /pagare/' + result.id);
            // Guardar el ID en sessionStorage como backup
            sessionStorage.setItem('ultimoClienteId', result.id);
            setTimeout(function () { window.location.href = '/pagare/' + result.id; }, 1000);
        } else if (res.status === 409) {
            showToast('Ya existe una solicitud con ese número de documento. Usa un documento diferente.', 'error');
        } else {
            showToast(result.error || 'Error al enviar la solicitud', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showToast('Error de conexión al servidor', 'error');
    }
});
