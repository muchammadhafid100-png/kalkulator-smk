// Menunggu sampai semua konten HTML dimuat
document.addEventListener('DOMContentLoaded', () => {

    // 1. Ambil elemen yang kita butuhkan
    const displayElement = document.getElementById('display');
    const tombolGrid = document.querySelector('.tombol-grid');

    // 2. Variabel untuk menyimpan state kalkulator
    let currentInput = '0'; // Apa yang tampil di layar
    let operator = null; // Operator yang dipilih (+, -, *, /)
    let previousInput = null; // Angka pertama sebelum operator
    let waitingForSecondOperand = false; // Status apakah kita sedang menunggu angka kedua

    // 3. Fungsi utama untuk mengupdate layar
    function updateDisplay() {
        displayElement.textContent = currentInput;
    }

    // 4. Fungsi untuk menangani input angka
    function inputDigit(digit) {
        if (waitingForSecondOperand) {
            currentInput = digit;
            waitingForSecondOperand = false;
        } else {
            // Jika di layar masih 0, ganti dengan angka. Jika tidak, tambahkan.
            currentInput = currentInput === '0' ? digit : currentInput + digit;
        }
    }

    // 5. Fungsi untuk input desimal (.)
    function inputDecimal() {
        // Hanya tambahkan titik jika belum ada
        if (!currentInput.includes('.')) {
            currentInput += '.';
        }
    }

    // 6. Fungsi untuk menangani operator
    function handleOperator(nextOperator) {
        const inputValue = parseFloat(currentInput);

        // Jika sudah ada operator dan kita masukkan operator lagi, hitung dulu
        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        // Simpan angka pertama
        if (previousInput === null) {
            previousInput = inputValue;
        } else if (operator) {
            // Lakukan perhitungan jika sudah ada angka pertama dan operator
            const result = performCalculation();
            currentInput = String(result);
            previousInput = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
        updateDisplay(); // Tampilkan hasil sementara (jika ada)
    }

    // 7. Fungsi inti kalkulasi
    function performCalculation() {
        const inputValue = parseFloat(currentInput);
        if (previousInput === null || operator === null) {
            return inputValue;
        }

        let result;
        switch (operator) {
            case '+':
                result = previousInput + inputValue;
                break;
            case '-':
                result = previousInput - inputValue;
                break;
            case '*':
                result = previousInput * inputValue;
                break;
            case '/':
                // Hindari pembagian dengan nol
                result = (inputValue === 0) ? 'Error' : previousInput / inputValue;
                break;
            default:
                return inputValue;
        }
        return result;
    }

    // 8. Fungsi untuk reset (Tombol C)
    function clearCalculator() {
        currentInput = '0';
        operator = null;
        previousInput = null;
        waitingForSecondOperand = false;
    }

    // 9. Fungsi hapus (Tombol ←)
    function backspace() {
        currentInput = currentInput.slice(0, -1);
        // Jika setelah dihapus jadi kosong, set ke 0
        if (currentInput === '') {
            currentInput = '0';
        }
    }

    // 10. Event Listener Utama (Event Delegation)
    tombolGrid.addEventListener('click', (event) => {
        const target = event.target; // Tombol yang diklik

        // Pastikan yang diklik adalah tombol
        if (!target.matches('button')) {
            return;
        }

        const value = target.dataset.value;
        const action = target.dataset.action;

        if (value) {
            // Jika tombol angka (data-value)
            inputDigit(value);
        } else if (action) {
            // Jika tombol aksi (data-action)
            switch (action) {
                case 'operator':
                    handleOperator(target.textContent);
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'clear':
                    clearCalculator();
                    break;
                case 'backspace':
                    backspace();
                    break;
                case 'calculate':
                    // Saat = ditekan
                    const result = performCalculation();
                    currentInput = String(result);
                    operator = null;
                    previousInput = null;
                    waitingForSecondOperand = false;
                    break;
            }
        }

        updateDisplay(); // Update layar setiap kali tombol diklik
    });

    // Inisialisasi layar
    updateDisplay();
});
