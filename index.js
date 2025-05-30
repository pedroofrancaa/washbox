const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

let currentQRCode = '';

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('connection.update', async ({ qr, connection }) => {
        if (qr) {
            currentQRCode = await QRCode.toDataURL(qr);
            console.log('🔑 QR Code atualizado');
        }
        if (connection === 'open') {
            console.log('✅ Conexão WhatsApp estabelecida!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startWhatsApp();

app.get('/', (req, res) => {
    res.send('Servidor Baileys está rodando 🚀');
});

app.get('/qr', (req, res) => {
    if (currentQRCode) {
        res.json({ qr: currentQRCode });
    } else {
        res.json({ qr: null });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
