class LotteryGame {
    constructor() {
        this.numberHistory = [];
        this.currentNumber = '';
        this.ticketNumbers = [];
        this.editingHistoryIndex = null;
        this.editMode = false;
        this.audioContext = null; // Initialize audio context
        
        this.initializeElements();
        this.loadHistory();
        this.attachEventListeners();
        
        // Initialize audio context on first user interaction
        this.initAudioOnFirstInteraction();
    }

    initAudioOnFirstInteraction() {
        // Initialize audio context on first user interaction (required by browsers)
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            // Remove event listeners after initialization
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        
        // Add event listeners for first interaction
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    initializeElements() {
        // Manual input elements
        this.manualNumberInput = document.getElementById('manualNumber');
        this.addManualBtn = document.getElementById('addManualBtn');
        
        // Display elements
        this.currentNumberDisplay = document.getElementById('currentNumber');
        this.editBtn = document.getElementById('editBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.numberInput = document.getElementById('numberInput');
        this.editNumberInput = document.getElementById('editNumberInput');
        
        // History elements
        this.numberHistoryDisplay = document.getElementById('numberHistory');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Verification elements
        this.ticketNumbersInput = document.getElementById('ticketNumbers');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.verificationResult = document.getElementById('verificationResult');
        this.resultDetails = document.getElementById('resultDetails');
        this.winnerAnnouncement = document.getElementById('winnerAnnouncement');
        this.loserAnnouncement = document.getElementById('loserAnnouncement');
        
        // Winner popup elements
        this.winnerOverlay = document.getElementById('winnerOverlay');
        this.winnerNumbers = document.getElementById('winnerNumbers');
        this.winnerCloseBtn = document.getElementById('winnerCloseBtn');
        
        // Loser popup elements
        this.loserOverlay = document.getElementById('loserOverlay');
        this.loserNumbers = document.getElementById('loserNumbers');
        this.loserCloseBtn = document.getElementById('loserCloseBtn');
        this.loserComparison = document.getElementById('loserComparison');
        
        // Help popup elements
        this.helpBtn = document.getElementById('helpBtn');
        this.helpOverlay = document.getElementById('helpOverlay');
        this.helpCloseBtn = document.getElementById('helpCloseBtn');
        
        // Tet popup elements
        this.tetBtn = document.getElementById('tetBtn');
        this.tetOverlay = document.getElementById('tetOverlay');
        this.tetCloseBtn = document.getElementById('tetCloseBtn');
    }

    extractNumberFromSpeech(transcript) {
        // Vietnamese number words mapping (1-90 only)
        const numberWords = {
            'một': '01', 'hai': '02', 'ba': '03', 'bốn': '04',
            'năm': '05', 'sáu': '06', 'bảy': '07', 'tám': '08', 'chín': '09',
            'mười': '10', 'mười một': '11', 'mười hai': '12', 'mười ba': '13',
            'mười bốn': '14', 'mười lăm': '15', 'mười sáu': '16', 'mười bảy': '17',
            'mười tám': '18', 'mười chín': '19', 'hai mươi': '20', 'hai mươi mốt': '21',
            'hai mươi hai': '22', 'hai mươi ba': '23', 'hai mươi bốn': '24',
            'hai mươi lăm': '25', 'hai mươi sáu': '26', 'hai mươi bảy': '27',
            'hai mươi tám': '28', 'hai mươi chín': '29', 'ba mươi': '30',
            'ba mươi mốt': '31', 'ba mươi hai': '32', 'ba mươi ba': '33',
            'ba mươi bốn': '34', 'ba mươi lăm': '35', 'ba mươi sáu': '36',
            'ba mươi bảy': '37', 'ba mươi tám': '38', 'ba mươi chín': '39',
            'bốn mươi': '40', 'bốn mươi mốt': '41', 'bốn mươi hai': '42',
            'bốn mươi ba': '43', 'bốn mươi bốn': '44', 'bốn mươi lăm': '45',
            'bốn mươi sáu': '46', 'bốn mươi bảy': '47', 'bốn mươi tám': '48',
            'bốn mươi chín': '49', 'năm mươi': '50', 'năm mươi mốt': '51',
            'năm mươi hai': '52', 'năm mươi ba': '53', 'năm mươi bốn': '54',
            'năm mươi lăm': '55', 'năm mươi sáu': '56', 'năm mươi bảy': '57',
            'năm mươi tám': '58', 'năm mươi chín': '59', 'sáu mươi': '60',
            'sáu mươi mốt': '61', 'sáu mươi hai': '62', 'sáu mươi ba': '63',
            'sáu mươi bốn': '64', 'sáu mươi lăm': '65', 'sáu mươi sáu': '66',
            'sáu mươi bảy': '67', 'sáu mươi tám': '68', 'sáu mươi chín': '69',
            'bảy mươi': '70', 'bảy mươi mốt': '71', 'bảy mươi hai': '72',
            'bảy mươi ba': '73', 'bảy mươi bốn': '74', 'bảy mươi lăm': '75',
            'bảy mươi sáu': '76', 'bảy mươi bảy': '77', 'bảy mươi tám': '78',
            'bảy mươi chín': '79', 'tám mươi': '80', 'tám mươi mốt': '81',
            'tám mươi hai': '82', 'tám mươi ba': '83', 'tám mươi bốn': '84',
            'tám mươi lăm': '85', 'tám mươi sáu': '86', 'tám mươi bảy': '87',
            'tám mươi tám': '88', 'tám mươi chín': '89', 'chín mươi': '90'
        };

        // Direct number extraction
        const directMatch = transcript.match(/\d{1,2}/);
        if (directMatch) {
            const num = parseInt(directMatch[0]);
            if (num >= 1 && num <= 90) {
                return num.toString().padStart(2, '0');
            }
            return null;
        }

        // Word-based number extraction
        for (const [word, number] of Object.entries(numberWords)) {
            if (transcript.includes(word)) {
                return number;
            }
        }

        return null;
    }

    getErrorMessage(error) {
        const errorMessages = {
            'no-speech': 'Không phát hiện giọng nói',
            'audio-capture': 'Lỗi thu âm',
            'not-allowed': 'Quyền truy cập micro bị từ chối',
            'network': 'Lỗi mạng',
            'service-not-allowed': 'Dịch vụ nhận dạng giọng nói không được phép'
        };
        return errorMessages[error] || 'Lỗi không xác định';
    }

    attachEventListeners() {
        // Manual input
        this.addManualBtn.addEventListener('click', () => {
            const number = this.manualNumberInput.value.trim();
            console.log('Manual input clicked, number:', number); // Debug log
            if (number && this.isValidNumber(number)) {
                console.log('Number is valid, checking for duplicate:', number.padStart(2, '0')); // Debug log
                
                const formattedNumber = number.padStart(2, '0');
                
                // Check for duplicate
                if (this.isDuplicateNumber(formattedNumber)) {
                    console.log('Duplicate number detected in manual input:', formattedNumber); // Debug log
                    this.showManualDuplicateWarning(formattedNumber);
                    return;
                }
                
                console.log('Adding number:', formattedNumber); // Debug log
                this.addNumber(formattedNumber);
                this.manualNumberInput.value = '';
            } else {
                console.log('Invalid number:', number); // Debug log
            }
        });

        this.manualNumberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter pressed, triggering manual add'); // Debug log
                this.addManualBtn.click();
            }
        });

        // Edit controls
        this.editBtn.addEventListener('click', () => this.startEdit());
        this.confirmBtn.addEventListener('click', () => this.confirmEdit());
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());

        this.editNumberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmEdit();
            }
        });

        // History controls
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportHistory());
        }

        // Verification controls
        this.verifyBtn.addEventListener('click', () => this.verifyTicket());
        this.ticketNumbersInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyTicket();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'm':
                        e.preventDefault();
                        this.manualNumberInput.focus();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.editBtn.click();
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.exportBtn) {
                            this.exportHistory();
                        }
                        break;
                    case 'v':
                        e.preventDefault();
                        this.ticketNumbersInput.focus();
                        break;
                }
            }
        });
        
        // Winner popup close button
        this.winnerCloseBtn.addEventListener('click', () => {
            this.closeWinnerPopup();
        });
        
        // Close popup on overlay click
        this.winnerOverlay.addEventListener('click', (e) => {
            if (e.target === this.winnerOverlay) {
                this.closeWinnerPopup();
            }
        });
        
        // Loser popup close button
        this.loserCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Loser close button clicked'); // Debug log
            this.closeLoserPopup();
        });
        
        // Close loser popup on overlay click
        this.loserOverlay.addEventListener('click', (e) => {
            if (e.target === this.loserOverlay) {
                console.log('Loser overlay clicked'); // Debug log
                this.closeLoserPopup();
            }
        });
        
        // Help popup controls
        this.helpBtn.addEventListener('click', () => {
            this.showHelpPopup();
        });
        
        this.helpCloseBtn.addEventListener('click', () => {
            this.closeHelpPopup();
        });
        
        // Close help popup on overlay click
        this.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.helpOverlay) {
                this.closeHelpPopup();
            }
        });
        
        // Tet popup controls
        this.tetBtn.addEventListener('click', () => {
            this.showTetPopup();
        });
        
        this.tetCloseBtn.addEventListener('click', () => {
            this.closeTetPopup();
        });
        
        // Close tet popup on overlay click
        this.tetOverlay.addEventListener('click', (e) => {
            if (e.target === this.tetOverlay) {
                this.closeTetPopup();
            }
        });
    }

    isValidNumber(number) {
        const num = parseInt(number);
        return !isNaN(num) && num >= 1 && num <= 90;
    }

    isDuplicateNumber(number) {
        console.log('Checking duplicate for number:', number); // Debug log
        console.log('Current history:', this.numberHistory.map(item => item.number)); // Debug log
        const isDuplicate = this.numberHistory.some(item => item.number === number);
        console.log('Is duplicate?', isDuplicate); // Debug log
        return isDuplicate;
    }

    showManualDuplicateWarning(number) {
        // Visual feedback for manual input duplicate
        this.addManualBtn.style.animation = 'shake 0.5s ease-in-out';
        this.addManualBtn.style.background = '#e74c3c';
        
        // Reset after animation
        setTimeout(() => {
            this.addManualBtn.style.animation = '';
            this.addManualBtn.style.background = '';
        }, 500);
        
        // Clear input and show placeholder
        this.manualNumberInput.value = '';
        this.manualNumberInput.placeholder = `Số ${number} đã tồn tại!`;
        
        // Reset placeholder after 2 seconds
        setTimeout(() => {
            this.manualNumberInput.placeholder = '01';
        }, 2000);
    }

    addNumber(number) {
        const timestamp = new Date().toLocaleString('vi-VN');
        this.numberHistory.push({ number, timestamp });
        this.currentNumber = number;
        this.updateHistoryDisplay();
        this.updateCurrentNumberDisplay();
        this.saveHistory();
    }

    updateCurrentNumberDisplay() {
        if (this.currentNumberDisplay) {
            this.currentNumberDisplay.textContent = this.currentNumber;
        }
    }

    updateHistoryDisplay() {
        if (!this.numberHistoryDisplay) return;
        
        console.log('Updating history display, count:', this.numberHistory.length); // Debug log
        
        if (this.numberHistory.length === 0) {
            this.numberHistoryDisplay.innerHTML = '<div class="empty-history">Chưa có số nào được đọc</div>';
            return;
        }

        // Reverse the array to show most recent first
        const reversedHistory = [...this.numberHistory].reverse();
        
        this.numberHistoryDisplay.innerHTML = reversedHistory.map((item, reverseIndex) => {
            // Calculate original index from reverse index
            const originalIndex = this.numberHistory.length - 1 - reverseIndex;
            return `
            <div class="number-item" data-index="${originalIndex}">
                <div class="number-text">${item.number}</div>
                <div class="timestamp">${item.timestamp}</div>
            </div>
        `;
        }).join('');

        // Add click listeners for editing
        const numberItems = this.numberHistoryDisplay.querySelectorAll('.number-item');
        numberItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(item.dataset.index);
                this.startEditHistoryNumber(index, item);
            });
        });
    }

    startEditHistoryNumber(index, element) {
        this.editingHistoryIndex = index;
        const currentNumber = this.numberHistory[index].number;
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentNumber;
        input.maxLength = 2;
        input.className = 'edit-input';
        
        // Replace content with input
        element.innerHTML = '';
        element.appendChild(input);
        element.classList.add('editing');
        
        // Focus and select
        input.focus();
        input.select();
        
        // Add event listeners
        const saveEdit = () => {
            const newNumber = input.value.trim();
            if (newNumber && this.isValidNumber(newNumber)) {
                const formattedNumber = newNumber.padStart(2, '0');
                
                // Check for duplicate (excluding the current editing index)
                const isDuplicate = this.numberHistory.some((item, idx) => 
                    idx !== index && item.number === formattedNumber
                );
                
                if (isDuplicate) {
                    // Show error and revert
                    input.style.animation = 'shake 0.5s ease-in-out';
                    input.style.background = '#e74c3c';
                    input.placeholder = `Số ${formattedNumber} đã tồn tại!`;
                    input.value = '';
                    
                    setTimeout(() => {
                        input.style.animation = '';
                        input.style.background = '';
                        input.placeholder = '';
                        this.updateHistoryDisplay();
                    }, 2000);
                    return;
                }
                
                this.numberHistory[index].number = formattedNumber;
                this.saveHistory();
                this.updateHistoryDisplay();
            } else {
                this.updateHistoryDisplay();
            }
        };
        
        const cancelEdit = () => {
            this.updateHistoryDisplay();
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    startEdit() {
        this.editMode = true;
        this.editNumberInput.value = this.currentNumber === '--' ? '' : this.currentNumber;
        
        if (this.currentNumberDisplay) {
            this.currentNumberDisplay.style.display = 'none';
        }
        if (this.numberInput) {
            this.numberInput.style.display = 'block';
        }
        if (this.editBtn) {
            this.editBtn.style.display = 'none';
        }
        if (this.confirmBtn) {
            this.confirmBtn.style.display = 'inline-block';
        }
        if (this.cancelBtn) {
            this.cancelBtn.style.display = 'inline-block';
        }
        
        if (this.editNumberInput) {
            this.editNumberInput.focus();
            this.editNumberInput.select();
        }
    }

    confirmEdit() {
        const newNumber = this.editNumberInput.value.trim();
        
        if (newNumber && this.isValidNumber(newNumber)) {
            const formattedNumber = newNumber.padStart(2, '0');
            this.currentNumber = formattedNumber;
            this.updateCurrentNumberDisplay();
        }
        
        this.cancelEdit();
    }

    cancelEdit() {
        this.editMode = false;
        
        if (this.currentNumberDisplay) {
            this.currentNumberDisplay.style.display = 'flex';
        }
        if (this.numberInput) {
            this.numberInput.style.display = 'none';
        }
        if (this.editBtn) {
            this.editBtn.style.display = 'inline-block';
        }
        if (this.confirmBtn) {
            this.confirmBtn.style.display = 'none';
        }
        if (this.cancelBtn) {
            this.cancelBtn.style.display = 'none';
        }
    }

    verifyTicket() {
        const ticketInput = this.ticketNumbersInput.value.trim();
        
        if (!ticketInput) {
            alert('Vui lòng nhập số vé!');
            return;
        }

        // Parse ticket numbers
        const ticketNumbers = ticketInput.split(',').map(num => num.trim()).filter(num => num);
        
        if (ticketNumbers.length !== 5) {
            alert('Vé phải có đúng 5 số!');
            return;
        }

        // Validate each number
        const validTicketNumbers = [];
        for (const num of ticketNumbers) {
            const parsedNum = parseInt(num);
            if (isNaN(parsedNum) || parsedNum < 1 || parsedNum > 90) {
                alert(`Số "${num}" không hợp lệ! Vui lòng nhập số từ 01 đến 90.`);
                return;
            }
            validTicketNumbers.push(parsedNum.toString().padStart(2, '0'));
        }

        // Get all numbers from history (not just 5 recent ones)
        const drawnNumbers = this.numberHistory.map(item => item.number);
        
        if (drawnNumbers.length < 5) {
            alert(`Cần có ít nhất 5 số để kiểm tra. Hiện tại chỉ có ${drawnNumbers.length} số.`);
            return;
        }
        
        console.log('All drawn numbers from history:', drawnNumbers); // Debug log
        
        // Perform verification
        this.performVerification(validTicketNumbers, drawnNumbers);
    }

    performVerification(ticketNumbers, drawnNumbers) {
        console.log('Verifying ticket numbers:', ticketNumbers); // Debug log
        console.log('Against all drawn numbers from history:', drawnNumbers); // Debug log
        
        const results = [];
        let matchCount = 0;
        const usedDrawnNumbers = new Set(); // Track which drawn numbers have been matched

        // Check each ticket number against ALL drawn numbers in history (order doesn't matter)
        for (let i = 0; i < 5; i++) {
            const ticketNum = ticketNumbers[i];
            let isMatch = false;
            let matchedDrawnNum = null;
            
            console.log(`Checking ticket number ${i+1}: ${ticketNum}`); // Debug log
            
            // Find if this ticket number exists in ANY of the drawn numbers
            for (let j = 0; j < drawnNumbers.length; j++) {
                if (!usedDrawnNumbers.has(j) && ticketNum === drawnNumbers[j]) {
                    isMatch = true;
                    matchedDrawnNum = drawnNumbers[j];
                    usedDrawnNumbers.add(j); // Mark this drawn number as used
                    console.log(`Found match: ${ticketNum} === ${drawnNumbers[j]} at position ${j}`); // Debug log
                    break;
                }
            }
            
            if (isMatch) {
                matchCount++;
                console.log(`Match count increased to: ${matchCount}`); // Debug log
            }

            results.push({
                ticketNumber: ticketNum,
                drawnNumber: matchedDrawnNum || '--',
                match: isMatch,
                position: i + 1
            });
        }
        
        console.log('Final results:', results); // Debug log
        console.log('Total matches:', matchCount); // Debug log

        // Display results
        this.displayVerificationResults(results, matchCount === 5);
    }

    displayVerificationResults(results, isWinner) {
        this.verificationResult.style.display = 'block';
        this.winnerAnnouncement.style.display = 'none';
        this.loserAnnouncement.style.display = 'none';

        let resultHTML = '';
        
        results.forEach(result => {
            const matchClass = result.match ? 'match' : 'no-match';
            const matchIcon = result.match ? '✅' : '❌';
            const matchText = result.match ? 'Khớp' : 'Không khớp';
            
            resultHTML += `
                <div class="number-comparison">
                    <div class="ticket-number">Số ${result.position}: ${result.ticketNumber}</div>
                    <div class="comparison-result ${matchClass}">
                        <span>${matchIcon}</span>
                        <span>${result.drawnNumber} - ${matchText}</span>
                    </div>
                </div>
            `;
        });

        this.resultDetails.innerHTML = resultHTML;

        // Show winner announcement if all numbers match
        if (isWinner) {
            setTimeout(() => {
                this.winnerAnnouncement.style.display = 'block';
                this.showWinnerPopup();
                this.playEnhancedWinnerAnimation();
            }, 1000);
        } else {
            // Show loser announcement if not all numbers match
            setTimeout(() => {
                this.loserAnnouncement.style.display = 'block';
                this.showLoserPopup();
                this.playLoserAnimation();
            }, 1000);
        }
    }

    showWinnerPopup() {
        // Get the winning numbers from the current verification (ticket numbers)
        const ticketInput = this.ticketNumbersInput.value.trim();
        const ticketNumbers = ticketInput.split(',').map(num => num.trim()).filter(num => num);
        const winningNumbers = ticketNumbers.map(num => num.padStart(2, '0'));
        
        console.log('Winner popup showing ticket numbers:', winningNumbers); // Debug log
        
        // Create number elements
        this.winnerNumbers.innerHTML = winningNumbers.map((num, index) => `
            <div class="winner-number" style="--delay: ${index * 0.2}s">${num}</div>
        `).join('');
        
        // Add blur effect to background
        const mainContent = document.querySelector('.main-content');
        const historyHeader = document.querySelector('.history-header');
        const controlsSection = document.querySelector('.controls-section');
        
        if (mainContent) mainContent.classList.add('blurred');
        if (historyHeader) historyHeader.classList.add('blurred');
        if (controlsSection) controlsSection.classList.add('blurred');
        
        // Show popup
        this.winnerOverlay.style.display = 'flex';
        
        // Play celebration sound after a short delay
        setTimeout(() => {
            this.playWinnerSound();
        }, 500);
    }

    closeWinnerPopup() {
        // Remove blur effect
        const mainContent = document.querySelector('.main-content');
        const historyHeader = document.querySelector('.history-header');
        const controlsSection = document.querySelector('.controls-section');
        
        if (mainContent) mainContent.classList.remove('blurred');
        if (historyHeader) historyHeader.classList.remove('blurred');
        if (controlsSection) controlsSection.classList.remove('blurred');
        
        // Hide popup
        this.winnerOverlay.style.display = 'none';
        
        // Reset verification form
        this.resetVerificationForm();
    }

    showLoserPopup() {
        // Get the ticket numbers from the current verification
        const ticketInput = this.ticketNumbersInput.value.trim();
        const ticketNumbers = ticketInput.split(',').map(num => num.trim()).filter(num => num);
        const losingNumbers = ticketNumbers.map(num => num.padStart(2, '0'));
        
        console.log('Loser popup showing ticket numbers:', losingNumbers); // Debug log
        
        // Get random funny message
        const funnyMessages = [
            {
                title: "😭 LÊU LÊU! KINH SỘ RỒI! 😭",
                message: "Không trúng giải nào! Thử lại lần sau!",
                animation: "💔🤦‍♂️😢🤷‍♂️💔"
            },
            {
                title: "🤣 TRÚNG GIẢI MƠ À? 🤣",
                message: "Số đẹp thế mà không trúng! Trời ơi!",
                animation: "😂🤪🙃😵‍💫🤯"
            },
            {
                title: "😅 MÁY HỎNG RỒI KÌA 😅",
                message: "Chắc máy tính trúng số bị lỗi rồi!",
                animation: "🔧⚙️💻🛠️🔌"
            },
            {
                title: "🤔 MÉM TRÚNG RỒI 🤔",
                message: "Chúc bạn may mắn lần sau!",
                animation: "🎯🎲🎰🎪🎭"
            },
            {
                title: "😌 BUÔNG BỎ THÔI CHỨ 😌",
                message: "Không trúng cũng vui! Năm sau lại nhé!",
                animation: "🌈☀️🌺🦄🌸"
            }
            
        ];
        
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        
        // Create number elements
        this.loserNumbers.innerHTML = losingNumbers.map((num, index) => `
            <div class="loser-number" style="--delay: ${index * 0.2}s">${num}</div>
        `).join('');
        
        // Create detailed comparison (reuse the results from verification)
        const drawnNumbers = this.numberHistory.map(item => item.number);
        const results = [];
        let matchCount = 0;
        const usedDrawnNumbers = new Set();

        // Check each ticket number against all drawn numbers
        for (let i = 0; i < 5; i++) {
            const ticketNum = losingNumbers[i];
            let isMatch = false;
            let matchedDrawnNum = null;
            
            // Find if this ticket number exists in ANY of the drawn numbers
            for (let j = 0; j < drawnNumbers.length; j++) {
                if (!usedDrawnNumbers.has(j) && ticketNum === drawnNumbers[j]) {
                    isMatch = true;
                    matchedDrawnNum = drawnNumbers[j];
                    usedDrawnNumbers.add(j);
                    break;
                }
            }
            
            if (isMatch) {
                matchCount++;
            }

            results.push({
                ticketNumber: ticketNum,
                drawnNumber: matchedDrawnNum || '--',
                match: isMatch,
                position: i + 1
            });
        }

        // Create comparison HTML
        let comparisonHTML = '<h3 class="comparison-title">Đối chiếu kết quả:</h3>';
        results.forEach(result => {
            const matchClass = result.match ? 'match' : 'no-match';
            const matchIcon = result.match ? '✅' : '❌';
            const matchText = result.match ? 'Khớp' : 'Không khớp';
            
            comparisonHTML += `
                <div class="loser-number-comparison">
                    <div class="loser-ticket-number">Số ${result.position}: ${result.ticketNumber}</div>
                    <div class="loser-comparison-result ${matchClass}">
                        <span>${matchIcon}</span>
                        <span>${result.drawnNumber} - ${matchText}</span>
                    </div>
                </div>
            `;
        });

        // Add summary
        comparisonHTML += `
            <div class="loser-summary">
                <p>Trúng ${matchCount}/5 số</p>
                ${matchCount === 0 ? '<p>Trượt trắng! 😭</p>' : matchCount < 3 ? '<p>Cần thêm may mắn! 🤞</p>' : '<p>Gần trúng rồi! 🎯</p>'}
            </div>
        `;

        this.loserComparison.innerHTML = comparisonHTML;
        
        // Update popup content with random message
        const loserPopup = this.loserOverlay.querySelector('.loser-popup');
        loserPopup.querySelector('h1').textContent = randomMessage.title;
        loserPopup.querySelector('.loser-message').textContent = randomMessage.message;
        loserPopup.querySelector('.loser-animation').textContent = randomMessage.animation;
        
        // Add blur effect to background
        const mainContent = document.querySelector('.main-content');
        const historyHeader = document.querySelector('.history-header');
        const controlsSection = document.querySelector('.controls-section');
        
        if (mainContent) mainContent.classList.add('blurred');
        if (historyHeader) historyHeader.classList.add('blurred');
        if (controlsSection) controlsSection.classList.add('blurred');
        
        // Show popup
        this.loserOverlay.style.display = 'flex';
        
        // Play sad sound after a short delay
        setTimeout(() => {
            this.playLoserSound();
        }, 500);
    }

    closeLoserPopup() {
        console.log('Closing loser popup'); // Debug log
        
        // Remove blur effect
        const mainContent = document.querySelector('.main-content');
        const historyHeader = document.querySelector('.history-header');
        const controlsSection = document.querySelector('.controls-section');
        
        if (mainContent) mainContent.classList.remove('blurred');
        if (historyHeader) historyHeader.classList.remove('blurred');
        if (controlsSection) controlsSection.classList.remove('blurred');
        
        // Hide popup
        if (this.loserOverlay) {
            this.loserOverlay.style.display = 'none';
        }
        
        // Reset verification form
        this.resetVerificationForm();
        
        console.log('Loser popup closed'); // Debug log
    }

    playLoserAnimation() {
        // Play loser sound effects
        this.playLoserSound();
        this.createSadConfetti();
    }

    playLoserSound() {
        // Create a sad sound using Web Audio API
        try {
            const audioContext = this.audioContext || (new (window.AudioContext || window.webkitAudioContext)());
            
            // Create descending notes for sad effect
            const frequencies = [440, 349.23, 293.66, 261.63, 220]; // A, F, D, C, A (descending)
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                // Increased volume
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime); // Increased from 0.3 to 0.4
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                
                oscillator.start(audioContext.currentTime + index * 0.2);
                oscillator.stop(audioContext.currentTime + 1);
            });
        } catch (error) {
            console.log('Loser sound not supported:', error);
        }
    }

    createSadConfetti() {
        const colors = ['#808080', '#696969', '#778899', '#708090', '#2F4F4F'];
        const confettiCount = 50;
        const shapes = ['circle', 'square'];
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'sad-confetti';
                
                const color = colors[Math.floor(Math.random() * colors.length)];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${color};
                    ${shape === 'circle' ? 'border-radius: 50%;' : ''}
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    z-index: 1000;
                    pointer-events: none;
                    animation: sadConfettiFall 2s ease-out forwards;
                    opacity: 0.6;
                `;
                
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => {
                    document.body.removeChild(confetti);
                }, 2000);
            }, i * 30);
        }
    }

    playEnhancedWinnerAnimation() {
        // Enhanced confetti effect
        this.createEnhancedConfetti();
        
        // Play enhanced sound effects with user interaction
        this.initAudioContext(() => {
            this.playWinnerSound();
            this.playApplauseSound();
            this.playFireworksSound();
        });
    }

    initAudioContext(callback) {
        // Create or resume audio context on user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resume if suspended (required by browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                callback();
            });
        } else {
            callback();
        }
    }

    playWinnerSound() {
        // Create a simple celebration sound using Web Audio API
        try {
            const audioContext = this.audioContext || (new (window.AudioContext || window.webkitAudioContext)());
            
            // Create multiple oscillators for a celebration sound
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave higher)
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                // Increased volume
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1); // Increased from 0.3 to 0.5
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime + index * 0.1);
                oscillator.stop(audioContext.currentTime + 0.6);
            });
        } catch (error) {
            console.log('Winner sound not supported:', error);
        }
    }

    playApplauseSound() {
        // Create applause sound using Web Audio API
        try {
            const audioContext = this.audioContext || (new (window.AudioContext || window.webkitAudioContext)());
            
            // Create multiple noise sources for applause effect
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const bufferSize = audioContext.sampleRate * 0.1; // 100ms of noise
                    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                    const data = buffer.getChannelData(0);
                    
                    // Generate white noise
                    for (let j = 0; j < bufferSize; j++) {
                        data[j] = (Math.random() - 0.5) * 0.5; // Increased from 0.3 to 0.5
                    }
                    
                    const source = audioContext.createBufferSource();
                    const gainNode = audioContext.createGain();
                    const filter = audioContext.createBiquadFilter();
                    
                    source.buffer = buffer;
                    source.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Filter to make it sound more like applause
                    filter.type = 'highpass';
                    filter.frequency.value = 1000;
                    
                    // Increased volume
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(Math.random() * 0.4, audioContext.currentTime + 0.05); // Increased from 0.2 to 0.4
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
                    
                    source.start(audioContext.currentTime);
                }, i * 50); // Stagger the applause sounds
            }
        } catch (error) {
            console.log('Applause sound not supported:', error);
        }
    }

    playFireworksSound() {
        // Create fireworks sound using Web Audio API
        try {
            const audioContext = this.audioContext || (new (window.AudioContext || window.webkitAudioContext)());
            
            // Create multiple firework explosions
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    const filter = audioContext.createBiquadFilter();
                    
                    oscillator.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Firework explosion sound
                    oscillator.frequency.value = 100 + Math.random() * 200;
                    oscillator.type = 'sawtooth';
                    
                    filter.type = 'bandpass';
                    filter.frequency.value = 500 + Math.random() * 1000;
                    filter.Q.value = 10;
                    
                    // Increased volume
                    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime); // Increased from 0.5 to 0.8
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, i * 200); // Stagger firework sounds
            }
        } catch (error) {
            console.log('Fireworks sound not supported:', error);
        }
    }

    createEnhancedConfetti() {
        const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#f39c12', '#e74c3c', '#3498db'];
        const confettiCount = 200;
        const shapes = ['circle', 'square', 'triangle'];
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'enhanced-confetti';
                
                const color = colors[Math.floor(Math.random() * colors.length)];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${color};
                    ${shape === 'circle' ? 'border-radius: 50%;' : ''}
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    z-index: 1000;
                    pointer-events: none;
                    animation: confettiFall 3s ease-out forwards;
                `;
                
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => {
                    document.body.removeChild(confetti);
                }, 3000);
            }, i * 10);
        }
    }

    clearHistory() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
            this.numberHistory = [];
            this.currentNumber = '';
            this.updateHistoryDisplay();
            this.updateCurrentNumberDisplay();
            this.saveHistory();
        }
    }

    exportHistory() {
        const csvContent = this.numberHistory.map(item => 
            `${item.number},${item.timestamp}`
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lo-to-mien-nam-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    saveHistory() {
        localStorage.setItem('lottoHistory', JSON.stringify(this.numberHistory));
        sessionStorage.setItem('lottoHistory', JSON.stringify(this.numberHistory));
    }

    showHelpPopup() {
        console.log('Showing help popup'); // Debug log
        if (this.helpOverlay) {
            this.helpOverlay.style.display = 'flex';
        }
    }

    closeHelpPopup() {
        console.log('Closing help popup'); // Debug log
        if (this.helpOverlay) {
            this.helpOverlay.style.display = 'none';
        }
    }

    showTetPopup() {
        console.log('Showing Tet popup'); // Debug log
        if (this.tetOverlay) {
            this.tetOverlay.style.display = 'flex';
        }
    }

    closeTetPopup() {
        console.log('Closing Tet popup'); // Debug log
        if (this.tetOverlay) {
            this.tetOverlay.style.display = 'none';
        }
    }

    resetVerificationForm() {
        // Clear ticket input
        if (this.ticketNumbersInput) {
            this.ticketNumbersInput.value = '';
        }
        
        // Hide verification result
        if (this.verificationResult) {
            this.verificationResult.style.display = 'none';
        }
        
        // Clear result details
        if (this.resultDetails) {
            this.resultDetails.innerHTML = '';
        }
        
        // Hide announcements
        if (this.winnerAnnouncement) {
            this.winnerAnnouncement.style.display = 'none';
        }
        if (this.loserAnnouncement) {
            this.loserAnnouncement.style.display = 'none';
        }
        
        console.log('Verification form reset'); // Debug log
    }

    loadHistory() {
        const saved = localStorage.getItem('lottoHistory') || sessionStorage.getItem('lottoHistory');
        if (saved) {
            try {
                this.numberHistory = JSON.parse(saved);
                this.updateHistoryDisplay();
                if (this.numberHistory.length > 0) {
                    this.currentNumber = this.numberHistory[this.numberHistory.length - 1].number;
                    this.updateCurrentNumberDisplay();
                }
            } catch (error) {
                console.error('Error loading history:', error);
                this.numberHistory = [];
            }
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LotteryGame();
});
