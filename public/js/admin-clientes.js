/* ==========================================
   FINANPANORAMA - ADMIN CLIENTES
   JavaScript del panel de administración
   ========================================== */

var token = localStorage.getItem('adminToken');
var clientes = [];

// Verificar autenticación
if (!token) {
    window.location.href = '/admin/login';
} else {
    fetch('/api/auth/verify', {
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(function (res) { return res.json(); }).then(function (data) {
        if (!data.authenticated) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        } else {
            document.getElementById('adminUser').textContent = data.username;
            loadData();
        }
    }).catch(function () {
        window.location.href = '/admin/login';
    });
}

async function loadData() {
    await loadStats();
    await loadClientes();
}

async function loadStats() {
    try {
        var res = await fetch('/api/clientes/stats');
        var stats = await res.json();
        document.getElementById('statTotal').textContent = stats.total || 0;
        document.getElementById('statAprobados').textContent = stats.aprobados || 0;
        document.getElementById('statPendientes').textContent = stats.pendientes || 0;
        document.getElementById('statMonto').textContent = formatCurrency(stats.monto_total || 0);
    } catch (err) {
        console.error('Error loading stats');
    }
}

async function loadClientes() {
    try {
        var res = await fetch('/api/clientes');
        clientes = await res.json();
        renderClientes(clientes);
    } catch (err) {
        console.error('Error loading clientes');
    }
}

function formatCurrency(val) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(val);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO');
}

function renderClientes(data) {
    var tbody = document.getElementById('clientesBody');
    var emptyState = document.getElementById('emptyState');
    var tableContainer = document.querySelector('.table-container');

    if (data.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    tbody.innerHTML = data.map(function (c) {
        return '<tr>' +
            '<td data-label="ID"><strong>#' + c.id + '</strong></td>' +
            '<td data-label="Cliente"><div>' +
            '<strong>' + c.nombre + ' ' + c.apellido + '</strong>' +
            '<div style="font-size: 0.85rem; color: var(--text-muted);">' + c.email + '</div>' +
            '</div></td>' +
            '<td data-label="Documento">' + (c.tipo_documento || c.tipoDocumento) + ' ' + (c.numero_documento || c.numeroDocumento) + '</td>' +
            '<td data-label="Celular">' + c.celular + '</td>' +
            '<td data-label="Monto"><strong style="color: var(--success);">' + formatCurrency(c.cantidad) + '</strong></td>' +
            '<td data-label="Estado"><span class="badge ' + (c.estado === 'aprobado' ? 'badge-approved' : 'badge-pending') + '">' +
            (c.estado === 'aprobado' ? '✓ Firmado' : '⏳ Pendiente') + '</span></td>' +
            '<td data-label="Fecha">' + formatDate(c.fecha_registro || c.fechaRegistro) + '</td>' +
            '<td data-label="Acciones"><div class="acciones-cell">' +
            '<a href="/pagare/' + c.id + '" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">📄 Ver Pagaré</a>' +
            '<button onclick="eliminarCliente(' + c.id + ')" class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.85rem;">🗑️ Eliminar</button>' +
            '</div></td>' +
            '</tr>';
    }).join('');
}

function filterClientes() {
    var search = document.getElementById('searchInput').value.toLowerCase();
    var filtered = clientes.filter(function (c) {
        return c.nombre.toLowerCase().includes(search) ||
            c.apellido.toLowerCase().includes(search) ||
            (c.numero_documento || c.numeroDocumento).includes(search);
    });
    renderClientes(filtered);
}

function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    }).finally(function () {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    });
}

async function eliminarCliente(id) {
    var confirmado = confirm('¿Seguro que deseas eliminar este cliente? Esta acción no se puede deshacer.');
    if (!confirmado) return;

    try {
        var res = await fetch('/api/clientes/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            var data = await res.json();
            alert(data.error || 'No se pudo eliminar el cliente');
            return;
        }

        await loadData();
    } catch (err) {
        console.error('Error eliminando cliente', err);
        alert('Error al eliminar el cliente');
    }
}
