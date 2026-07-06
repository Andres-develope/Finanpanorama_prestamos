/* ==========================================
   FINANPANORAMA - PAGARE
   JavaScript del contrato y pagare
   ========================================== */
let clienteId = window.location.pathname.split('/').pop();
        let cliente = null;
        let canvas, ctx, isDrawing = false;
        let identificadorUnico, checksum;

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            }).toUpperCase();
        }

        function generateChecksum() {
            return Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
        }

        function initSignaturePad() {
            canvas = document.getElementById('signatureCanvas');
            const pad = document.getElementById('signaturePad');
            canvas.width = pad.offsetWidth;
            canvas.height = pad.offsetHeight;
            ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';

            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            canvas.addEventListener('touchstart', handleTouch);
            canvas.addEventListener('touchmove', handleTouchMove);
            canvas.addEventListener('touchend', stopDrawing);
        }

        function startDrawing(e) { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); }
        function draw(e) { if (!isDrawing) return; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); }
        function stopDrawing() { isDrawing = false; }
        function handleTouch(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        }
        function handleTouchMove(e) {
            e.preventDefault();
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
        }
        function clearSignature() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
        function scrollToSign() { document.getElementById('signSection').scrollIntoView({ behavior: 'smooth' }); }

        function formatCurrency(val) {
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
        }

        function formatDateTime(dateStr) {
            const d = new Date(dateStr);
            return d.toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            }) + ' -05';
        }

        async function loadCliente(retries = 3) {
            try {
                const res = await fetch(`/api/clientes/${clienteId}`);
                if (!res.ok) {
                    if (retries > 0) {
                        // Esperar 500ms y reintentar
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return loadCliente(retries - 1);
                    }
                    throw new Error('Cliente no encontrado');
                }
                cliente = await res.json();
                fillDocument();
            } catch (err) {
                console.error('Error cargando cliente:', err);
                // Redirigir a solicitud sin alert molesto
                window.location.href = '/solicitud';
            }
        }

        function fillDocument() {
            const nombre = cliente.nombre || '';
            const apellido = cliente.apellido || '';
            const nombreCompleto = `${nombre} ${apellido}`.toUpperCase();
            const numDoc = cliente.numero_documento || cliente.numeroDocumento || '';
            const cantidad = cliente.cantidad || 0;

            identificadorUnico = generateUUID();
            checksum = generateChecksum();

            // Title and document
            document.getElementById('clienteNombreTitle').textContent = nombreCompleto;
            document.getElementById('nombreCompleto').textContent = nombreCompleto;
            document.getElementById('numDocumento').textContent = numDoc;
            document.getElementById('montoTexto').textContent = formatCurrency(cantidad);

            // Client info
            document.getElementById('nombreCliente').textContent = nombreCompleto;
            document.getElementById('cedulaCliente').textContent = numDoc;
            document.getElementById('direccionCliente').textContent = cliente.direccion || '';
            document.getElementById('celularCliente').textContent = cliente.celular || '';
            document.getElementById('empresaCliente').textContent = cliente.empresa || '-';
            document.getElementById('emailCliente').textContent = cliente.email || '';
            document.getElementById('emailCliente').href = 'mailto:' + (cliente.email || '');
            document.getElementById('ciudadCliente').textContent = cliente.ciudad || '';
            document.getElementById('cantidadCliente').textContent = formatCurrency(cantidad);

            // Reference
            document.getElementById('refNombre').textContent = cliente.ref_nombre || cliente.refNombre || '-';
            document.getElementById('refParentesco').textContent = cliente.ref_parentesco || cliente.refParentesco || '-';
            document.getElementById('refTelefono').textContent = cliente.ref_celular || cliente.refCelular || '-';

            // Authorization sections
            ['nombreAut1', 'nombreAut2', 'nombreAut3'].forEach(id =>
                document.getElementById(id).textContent = nombreCompleto);
            ['docAut1', 'docAut2', 'docAut3'].forEach(id =>
                document.getElementById(id).textContent = numDoc);

            // Signature section
            document.getElementById('signedByName').textContent = nombreCompleto;
            document.getElementById('signedDate').textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Audit
            const fechaRegistro = cliente.fecha_registro || cliente.fechaRegistro || new Date().toISOString();
            document.getElementById('timestampCreacion').textContent = formatDateTime(fechaRegistro);
            document.getElementById('auditCreacion').textContent =
                `Contrato, Pagare y carta de instrucciones - ${nombreCompleto} Uploaded by FINANPANORAMA - ${cliente.email}`;

            // Generate QR (opcional - si la librería está disponible)
            try {
                if (typeof QRCode !== 'undefined') {
                    const qrData = JSON.stringify({ id: cliente.id, nombre: nombreCompleto, doc: numDoc });
                    QRCode.toCanvas(document.createElement('canvas'), qrData, { width: 100 }, (err, qrCanvas) => {
                        if (!err) document.getElementById('qrCode').appendChild(qrCanvas);
                    });
                }
            } catch (e) {
                console.log('QRCode no disponible');
            }

            // Check if already signed
            if (cliente.documento_firmado || cliente.documentoFirmado) {
                showFirmaCompleta();
            }
        }

        async function firmarDocumento() {
            const firmaData = canvas.toDataURL('image/png');
            const blank = document.createElement('canvas');
            blank.width = canvas.width; blank.height = canvas.height;
            if (firmaData === blank.toDataURL()) {
                alert('Por favor, firme el documento antes de continuar.');
                return;
            }

            try {
                const res = await fetch(`/api/clientes/${clienteId}/firmar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firma: firmaData })
                });
                if (res.ok) {
                    cliente = await res.json();
                    // Guardar datos del cliente para mostrar en página de éxito
                    sessionStorage.setItem('clienteFirmado', JSON.stringify(cliente));
                    // Redirigir a página de éxito
                    window.location.href = '/exito';
                } else {
                    alert('Error al firmar el documento');
                }
            } catch (err) {
                alert('Error al firmar el documento');
            }
        }

        function showFirmaCompleta() {
            document.getElementById('signButtons').style.display = 'none';
            document.getElementById('signedMessage').classList.add('visible');
            document.getElementById('certificateSection').style.display = 'block';
            
            const signaturePad = document.getElementById('signaturePad');
            if (signaturePad) {
                signaturePad.innerHTML = '';
                const img = document.createElement('img');
                img.src = cliente.firma_digital || cliente.firmaDigital;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '150px';
                img.style.display = 'block';
                img.style.margin = '0 auto';
                signaturePad.appendChild(img);
                signaturePad.style.border = 'none'; // Quitar el borde de dibujo
            }
            
            const signatureLabel = document.querySelector('.signature-label');
            if (signatureLabel) signatureLabel.textContent = 'FIRMA DEL CLIENTE:';

            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toUpperCase();
            const numDoc = cliente.numero_documento || cliente.numeroDocumento;

            // Certificate info
            document.getElementById('certNombre').textContent = nombreCompleto;
            document.getElementById('certId').textContent = identificadorUnico;
            document.getElementById('signerName').textContent = nombreCompleto;
            document.getElementById('signerId').textContent = identificadorUnico.substring(0, 36);
            document.getElementById('signerIP').textContent = cliente.ip_firma || ('192.168.1.' + Math.floor(Math.random() * 255));
            document.getElementById('checksumCode').textContent = checksum;

            // Firma image
            if (cliente.firma_digital || cliente.firmaDigital) {
                document.getElementById('firmaImg').src = cliente.firma_digital || cliente.firmaDigital;
            }

            // Generate barcode (opcional - si la librería está disponible)
            try {
                if (typeof JsBarcode !== 'undefined') {
                    JsBarcode("#barcode", checksum.substring(0, 20), { format: "CODE128", width: 1.5, height: 40, displayValue: false });
                }
            } catch (e) {
                console.log('JsBarcode no disponible');
            }

            // Add audit entries
            const auditBody = document.getElementById('auditBody');
            const now = new Date();
            const entries = [
                { time: formatDateTime(now), text: `Document signed by ${nombreCompleto} - ${cliente.email}` },
                { time: formatDateTime(now), text: 'The document has been signed by all parties and is now closed.' }
            ];
            entries.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${e.time}</td><td>${e.text}</td>`;
                auditBody.appendChild(tr);
            });
        }

        window.onload = () => { initSignaturePad(); loadCliente(); };
