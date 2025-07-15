const WORDS = [
    "apple", "baker", "crane", "dream", "eagle", "flame", "grape", "house", "igloo", "jolly",
    "knife", "lemon", "mango", "night", "ocean", "peach", "queen", "river", "sugar", "table",
    "unity", "vowel", "whale", "xerox", "yacht", "zebra", "abide", "brave", "charm", "dwarf",
    "earth", "fairy", "giant", "happy", "ideal", "jolly", "karma", "lucky", "magic", "noble",
    "oasis", "proud", "quilt", "robot", "smile", "truth", "urban", "vivid", "watch", "xenon",
    "yield", "zesty", "amber", "bliss", "climb", "daisy", "ember", "frost", "glory", "haste",
    "irony", "jumbo", "kiosk", "lunar", "mirth", "nymph", "opera", "prism", "quash", "roast",
    "spark", "tango", "umbra", "vixen", "witty", "xylem", "yummy", "zonal", "" // Add more words as needed
];

const GUESS_LENGTH = 5;
const MAX_GUESSES = 6;

let currentGuess = Array(GUESS_LENGTH).fill(''); // Initialize with empty strings
let currentRow = 0;
let targetWord = '';
let activeBoxIndex = 0; // New variable to track the active input position

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');

function initializeGame() {
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    console.log("Target Word: ", targetWord); // For debugging
    createGameBoard();
    createKeyboard();
    document.addEventListener('keydown', handleKeyPress);
    setActiveBox(0); // Set the first box as active initially
}

function createGameBoard() {
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.classList.add('word-row');
        row.dataset.row = i; // Add data attribute for row index
        for (let j = 0; j < GUESS_LENGTH; j++) {
            const box = document.createElement('div');
            box.classList.add('letter-box');
            box.dataset.row = i;
            box.dataset.col = j;
            if (i === currentRow) {
                box.addEventListener('click', handleBoxClick); // Add click listener only for current row
            }
            row.appendChild(box);
        }
        gameBoard.appendChild(row);
    }
}

function handleBoxClick(event) {
    const clickedBox = event.target;
    const row = parseInt(clickedBox.dataset.row);
    const col = parseInt(clickedBox.dataset.col);

    if (row === currentRow) {
        setActiveBox(col);
    }
}

function setActiveBox(index) {
    // Remove active-box class from previous active box
    const prevActiveBox = gameBoard.querySelector(`.word-row[data-row="${currentRow}"] .letter-box.active-box`);
    if (prevActiveBox) {
        prevActiveBox.classList.remove('active-box');
    }

    // Set new active box
    activeBoxIndex = Math.max(0, Math.min(index, GUESS_LENGTH - 1)); // Ensure index is within bounds
    const newActiveBox = gameBoard.querySelector(`.word-row[data-row="${currentRow}"] .letter-box[data-col="${activeBoxIndex}"]`);
    if (newActiveBox) {
        newActiveBox.classList.add('active-box');
    }
}

function createKeyboard() {
    const keys = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
    ];

    keys.forEach(rowKeys => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        rowKeys.forEach(key => {
            const button = document.createElement('button');
            button.classList.add('keyboard-button');
            button.textContent = key.toUpperCase();
            button.dataset.key = key;
            if (key === 'enter' || key === 'backspace') {
                button.classList.add('large');
            }
            button.addEventListener('click', () => handleKeyPress({ key: key }));
            rowDiv.appendChild(button);
        });
        keyboard.appendChild(rowDiv);
    });
}

function updateGameBoard() {
    const currentRowDiv = gameBoard.querySelector(`.word-row[data-row="${currentRow}"]`);
    if (!currentRowDiv) return;

    const boxes = currentRowDiv.querySelectorAll('.letter-box');
    currentGuess.forEach((letter, index) => {
        boxes[index].textContent = letter;
    });

    // Re-apply active box highlight after updating content
    setActiveBox(activeBoxIndex);
}

function handleKeyPress(event) {
    const key = event.key.toLowerCase();

    if (currentRow >= MAX_GUESSES) {
        return; // Game over
    }

    if (key === 'backspace') {
        if (currentGuess[activeBoxIndex] !== '') {
            // If current active box has a letter, clear it
            currentGuess[activeBoxIndex] = '';
        } else if (activeBoxIndex > 0) {
            // If current active box is empty, move back and clear previous
            setActiveBox(activeBoxIndex - 1);
            currentGuess[activeBoxIndex] = '';
        }
        updateGameBoard();
    } else if (key === 'enter') {
        if (currentGuess.every(letter => letter !== '')) { // Check if all boxes are filled
            checkGuess();
        } else {
            alert('Please fill all 5 letters!');
        }
    } else if (key.length === 1 && key.match(/[a-z]/)) {
        // Only allow letters
        if (activeBoxIndex < GUESS_LENGTH) {
            currentGuess[activeBoxIndex] = key.toUpperCase();
            updateGameBoard();
            // Advance activeBoxIndex to the next empty box or simply next if current was overwritten
            let nextEmptyIndex = currentGuess.findIndex((letter, idx) => idx > activeBoxIndex && letter === '');
            if (nextEmptyIndex !== -1) {
                setActiveBox(nextEmptyIndex);
            } else if (activeBoxIndex < GUESS_LENGTH - 1) {
                setActiveBox(activeBoxIndex + 1);
            } else {
                // If at the end, stay at the end
                setActiveBox(GUESS_LENGTH - 1);
            }
        }
    }
}

function checkGuess() {
    const guessWord = currentGuess.join('');
    const targetLetters = targetWord.split('');
    const guessLetters = guessWord.split('');
    const letterStates = Array(GUESS_LENGTH).fill('absent'); // Default to absent

    // Create a mutable copy of targetLetters for tracking used letters
    let tempTarget = [...targetLetters];

    // First pass: Check for correct (green) letters
    for (let i = 0; i < GUESS_LENGTH; i++) {
        if (guessLetters[i] === tempTarget[i]) {
            letterStates[i] = 'correct';
            tempTarget[i] = null; // Mark as used
        }
    }

    // Second pass: Check for present (yellow) letters
    for (let i = 0; i < GUESS_LENGTH; i++) {
        if (letterStates[i] === 'absent') { // Only check if not already marked correct
            const targetIndex = tempTarget.indexOf(guessLetters[i]);
            if (targetIndex !== -1) {
                letterStates[i] = 'present';
                tempTarget[targetIndex] = null; // Mark as used
            }
        }
    }

    const currentRowDiv = gameBoard.querySelector(`.word-row[data-row="${currentRow}"]`);
    const boxes = currentRowDiv.querySelectorAll('.letter-box');

    // Remove active box highlight before applying results
    const prevActiveBox = gameBoard.querySelector(`.word-row[data-row="${currentRow}"] .letter-box.active-box`);
    if (prevActiveBox) {
        prevActiveBox.classList.remove('active-box');
    }

    letterStates.forEach((state, index) => {
        setTimeout(() => {
            boxes[index].classList.add(state);
            updateKeyboardButton(currentGuess[index], state);
        }, index * 200); // Add a slight delay for visual effect
    });

    setTimeout(() => {
        if (guessWord === targetWord) {
            alert('Congratulations! You guessed the word!');
            currentRow = MAX_GUESSES; // End game
        } else if (currentRow === MAX_GUESSES - 1) {
            alert(`Game Over! The word was: ${targetWord}`);
        }

        if (guessWord !== targetWord && currentRow < MAX_GUESSES - 1) {
            currentRow++;
            currentGuess = Array(GUESS_LENGTH).fill(''); // Reset current guess
            setActiveBox(0); // Set active box for the new row
            // Re-attach click listeners for the new current row
            const newRowDiv = gameBoard.querySelector(`.word-row[data-row="${currentRow}"]`);
            if (newRowDiv) {
                newRowDiv.querySelectorAll('.letter-box').forEach(box => {
                    box.addEventListener('click', handleBoxClick);
                });
            }
        }
    }, GUESS_LENGTH * 200 + 100); // Wait for all animations to complete
}

function updateKeyboardButton(letter, state) {
    const button = keyboard.querySelector(`button[data-key="${letter.toLowerCase()}"]`);
    if (button) {
        // Prioritize 'correct' > 'present' > 'absent'
        if (button.classList.contains('correct')) {
            return; // Already green, don't change
        }
        if (button.classList.contains('present') && state !== 'correct') {
            return; // Already yellow, don't change to gray
        }
        button.classList.remove('absent', 'present', 'correct');
        button.classList.add(state);
    }
}

initializeGame();