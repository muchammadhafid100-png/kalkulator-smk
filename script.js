/* * Ini adalah 'otak' dari kalkulator subnetting.
 * Kita akan menggunakan 'bitwise operators' (operasi biner) 
 * karena IP Address pada dasarnya adalah angka 32-bit.
 */

// 1. Ambil elemen HTML yang kita butuhkan
const ipInput = document.getElementById('ip-address');
const cidrInput = document.getElementById('cidr');
const calculateBtn = document.getElementById('calculate-btn');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');

// 2. Tambahkan 'event listener' ke tombol
calculateBtn.addEventListener('click', calculateAndDisplay);

// Fungsi utama yang akan dipanggil saat tombol diklik
function calculateAndDisplay() {
    // Ambil nilai dari input
    const ipStr = ipInput.value;
    const cidr = parseInt(cidrInput.value, 10);

    // Validasi input
    if (!isValidIp(ipStr) || isNaN(cidr) || cidr < 0 || cidr > 32) {
        showError(true);
        showResults(false);
        return; // Hentikan eksekusi
    }

    // Input valid, sembunyikan error dan lanjutkan
    showError(false);
    
    // --- INTI LOGIKA SUBTARGETTING ---

    // Ubah IP string (192.168.1.10) menjadi angka 32-bit (integer)
    const ipInt = ipToInteger(ipStr);
    
    // Hitung Subnet Mask dari CIDR (misal /24 -> 255.255.255.0)
    // Ini adalah trik bitwise:
    // -1 (dalam 32-bit) adalah 32 buah angka 1 (1111...1111)
    // (32 - cidr) misal 32-24 = 8
    // Kita geser 32 angka 1 tadi ke kiri sebanyak 8 kali
    // Hasil: (11111111 11111111 11111111 00000000) -> 255.255.255.0
    // '>>> 0' adalah trik untuk memastikan angka tetap positif (unsigned)
    const maskInt = (-1 << (32 - cidr)) >>> 0;
    
    // Hitung Network ID
    // Rumus: IP AND MASK
    const networkInt = (ipInt & maskInt) >>> 0;

    // Hitung Broadcast ID
    // Rumus: NetworkID OR (NOT MASK)
    // (NOT MASK) juga disebut Wildcard Mask
    const broadcastInt = (networkInt | (~maskInt)) >>> 0;

    // Hitung Host Pertama dan Terakhir
    // (Khusus untuk /31 dan /32)
    const firstHostInt = (cidr <= 30) ? (networkInt + 1) >>> 0 : networkInt;
    const lastHostInt = (cidr <= 30) ? (broadcastInt - 1) >>> 0 : broadcastInt;
    
    // Hitung Jumlah Host
    // Rumus: 2^(32 - cidr)
    const totalHosts = Math.pow(2, (32 - cidr));
    const usableHosts = (cidr <= 30) ? (totalHosts - 2) : totalHosts;

    // --- Tampilkan Hasil ---
    
    // Ubah angka integer kembali ke format IP (192.168.1.0)
    document.getElementById('res-ip').textContent = `${ipStr}/${cidr}`;
    document.getElementById('res-mask').textContent = integerToIp(maskInt);
    document.getElementById('res-network').textContent = integerToIp(networkInt);
    document.getElementById('res-broadcast').textContent = integerToIp(broadcastInt);
    
    // Tampilkan rentang host
    if (cidr <= 30) {
        document.getElementById('res-host-range').textContent = `${integerToIp(firstHostInt)} - ${integerToIp(lastHostInt)}`;
    } else if (cidr == 31) {
         document.getElementById('res-host-range').textContent = "Point-to-Point (2 host)";
    } else { // cidr == 32
         document.getElementById('res-host-range').textContent = "Hanya 1 host (Loopback)";
    }
    
    document.getElementById('res-total-hosts').textContent = totalHosts.toLocaleString();
    document.getElementById('res-usable-hosts').textContent = (usableHosts > 0) ? usableHosts.toLocaleString() : "0";

    // Tampilkan div hasil
    showResults(true);
}

// --- FUNGSI BANTUAN ---

/** Mengubah IP string (cth: "192.168.1.1") menjadi integer 32-bit */
function ipToInteger(ipStr) {
    // 1. "192.168.1.1" -> ["192", "168", "1", "1"]
    const octets = ipStr.split('.').map(octet => parseInt(octet, 10));
    // 2. Geser bit-nya (bitwise shift) dan gabungkan
    // (192 << 24) | (168 << 16) | (1 << 8) | 1
    return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

/** Mengubah integer 32-bit (cth: 3232235777) menjadi IP string */
function integerToIp(ipInt) {
    // 1. Ambil 4 bagian (octet) dari integer
    // '>>>' adalah unsigned right shift, '& 255' mengambil 8 bit terakhir
    const octet1 = (ipInt >>> 24) & 255;
    const octet2 = (ipInt >>> 16) & 255;
    const octet3 = (ipInt >>> 8) & 255;
    const octet4 = ipInt & 255;
    // 2. Gabungkan dengan titik
    return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

/** Pengecekan sederhana format IP Address */
function isValidIp(ipStr) {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ipStr);
}

/** Fungsi untuk menampilkan/menyembunyikan pesan error */
function showError(show) {
    if (show) {
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
    }
}

/** Fungsi untuk menampilkan/menyembunyikan div hasil */
function showResults(show) {
    if (show) {
        resultsDiv.classList.remove('hidden');
    } else {
        resultsDiv.classList.add('hidden');
    }
}
