/* ==========================================
   FINANPANORAMA - CLIENTES
   JavaScript de la página de clientes
   ========================================== */

var clientes = [];

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function formatCurrency(val) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
}

function getBadgeClass(estado) {
    switch (estado) {
        case 'aprobado': return 'badge-approved';
        case 'rechazado': return 'badge-rejected';
        default: return 'badge-pending';
    }
}

function getEstadoLabel(estado) {
    switch (estado) {
        case 'aprobado': return 'Firmado';
        case 'rechazado': return 'Rechazado';
        default: return 'Pendiente';
    }
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
            '<td><strong>#' + c.id + '</strong></td>' +
            '<td>' +
            '    <div style="display: flex; flex-direction: column;">' +
            '        <strong>' + c.nombre + ' ' + c.apellido + '</strong>' +
            '        <span style="font-size: 0.85rem; color: var(--text-muted);">' + c.email + '</span>' +
            '    </div>' +
            '</td>' +
            '<td>' + c.tipoDocumento + ' ' + c.numeroDocumento + '</td>' +
            '<td>' + c.celular + '</td>' +
            '<td><strong style="color: var(--success);">' + formatCurrency(c.cantidadPrestamo) + '</strong></td>' +
            '<td><span class="badge ' + getBadgeClass(c.estado) + '">' + getEstadoLabel(c.estado) + '</span></td>' +
            '<td>' +
            '    <div style="display: flex; gap: 0.5rem;">' +
            '        <a href="/pagare/' + c.id + '" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">' +
            '            📄 Ver Pagaré' +
            '        </a>' +
            '    </div>' +
            '</td>' +
            '</tr>';
    }).join('');
}

function filterClientes() {
    var search = document.getElementById('searchInput').value.toLowerCase();
    var filtered = clientes.filter(function (c) {
        return c.nombre.toLowerCase().includes(search) ||
            c.apellido.toLowerCase().includes(search) ||
            c.numeroDocumento.includes(search) ||
            c.email.toLowerCase().includes(search);
    });
    renderClientes(filtered);
}

async function loadClientes() {
    try {
        var res = await fetch('/api/clientes');
        clientes = await res.json();
        renderClientes(clientes);
    } catch (err) {
        console.error('Error loading clientes:', err);
        document.getElementById('clientesBody').innerHTML =
            '<tr><td colspan="7" style="text-align: center; color: var(--danger);">' +
            'Error al cargar los clientes</td></tr>';
    }
}

loadClientes();
