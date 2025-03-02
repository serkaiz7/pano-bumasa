// Word list from the provided image, with placeholders for images and audio
const words = [
    // Level 1: 3-syllable words
    { word: "palengke", syllables: ["pa", "leng", "ke"], image: "palengke.jpg", audio: "palengke.mp3" },
    { word: "ospital", syllables: ["os", "pi", "tal"], image: "ospital.jpg", audio: "ospital.mp3" },
    // Level 2: 4-syllable words
    { word: "guwardiya", syllables: ["gu", "war", "di", "ya"], image: "guwardiya.jpg", audio: "guwardiya.mp3" },
    { word: "estudyante", syllables: ["es", "tu", "dyan", "te"], image: "estudyante.jpg", audio: "estudyante.mp3" },
    { word: "empleyado", syllables: ["em", "ple", "ya", "do"], image: "empleyado.jpg", audio: "empleyado.mp3" },
    { word: "tanghalian", syllables: ["tang", "ha", "li", "an"], image: "tanghalian.jpg", audio: "tanghalian.mp3" },
    { word: "munisipyo", syllables: ["mu", "ni", "si", "pyo"], image: "munisipyo.jpg", audio: "munisipyo.mp3" },
    { word: "paborito", syllables: ["pa", "bo", "ri", "to"], image: "paborito.jpg", audio: "paborito.mp3" },
    // Level 3: 5-syllable words
    { word: "tagapagbantay", syllables: ["ta", "ga", "pag", "ban", "tay"], image: "tagapagbantay.jpg", audio: "tagapagbantay.mp3" },
    { word: "manggagamot", syllables: ["mang", "ga", "ga", "mot"], image: "manggagamot.jpg", audio: "manggagamot.mp3" } // Corrected typo from "mangggagamot"
];

let currentLevel = 1;
let currentWordIndex = 0;
let selectedSyllables = [];
const maxLevel = 3;

const levelElement = document.getElementById('level');
const wordImageElement = document.getElementById('wordImage');
const wordDisplayElement = document.getElementById('wordDisplay');
const syllableButtonsElement = document.getElementById('syllableButtons');
const messageElement = document.getElementById('message');

// Load the current word and set up the game
function loadWord() {
    const wordData = words[currentWordIndex];
    levelElement.textContent = currentLevel;
    wordImageElement.src = wordData.image;
    wordDisplayElement.textContent = wordData.word;
    syllableButtonsElement.innerHTML = '';

    // Shuffle syllables for display
    const shuffledSyllables = [...wordData.syllables].sort(() => Math.random() - 0.5);
    shuffledSyllables.forEach(syllable => {
        const button = document.createElement('button');
        button.classList.add('syllable-button');
        button.textContent = syllable;
        button.addEventListener('click', () => selectSyllable(syllable));
        syllableButtonsElement.appendChild(button);
    });

    // Hint on double-tap
    wordDisplayElement.ondblclick = () => {
        playAudio(wordData.audio);
        highlightNextSyllable();
    };
}

// Select a syllable and check progress
function selectSyllable(syllable) {
    selectedSyllables.push(syllable);
    checkSequence();
}

// Check if the selected syllables match the correct sequence
function checkSequence() {
    const wordData = words[currentWordIndex];
    const correctSequence = wordData.syllables.slice(0, selectedSyllables.length).join('');
    const selectedSequence = selectedSyllables.join('');

    if (selectedSequence === correctSequence) {
        if (selectedSyllables.length === wordData.syllables.length) {
            messageElement.textContent = "Correct!";
            playSound('correct.mp3');
            setTimeout(nextWord, 1000);
        }
    } else {
        messageElement.textContent = "Try again!";
        playSound('wrong.mp3');
        setTimeout(() => {
            selectedSyllables = [];
            loadWord();
        }, 1000);
    }
}

// Move to the next word or level
function nextWord() {
    selectedSyllables = [];
    currentWordIndex++;
    if (currentWordIndex < words.length) {
        const nextWordSyllables = words[currentWordIndex].syllables.length;
        if (nextWordSyllables <= 3 && currentLevel === 1) {
            loadWord();
        } else if (nextWordSyllables === 4 && currentLevel === 2) {
            loadWord();
        } else if (nextWordSyllables >= 5 && currentLevel === 3) {
            loadWord();
        } else {
            currentLevel++;
            if (currentLevel <= maxLevel) {
                currentWordIndex = words.findIndex(w => w.syllables.length === (currentLevel === 2 ? 4 : 5));
                loadWord();
            } else {
                messageElement.textContent = "Congratulations! You've completed all levels!";
            }
        }
    } else {
        messageElement.textContent = "Congratulations! You've completed all levels!";
    }
}

// Play audio for hints
function playAudio(audioFile) {
    const audio = new Audio(audioFile);
    audio.play();
}

// Play sound effects
function playSound(soundFile) {
    const sound = new Audio(soundFile);
    sound.play();
}

// Highlight the next correct syllable for the hint
function highlightNextSyllable() {
    const wordData = words[currentWordIndex];
    const nextSyllable = wordData.syllables[selectedSyllables.length];
    const buttons = syllableButtonsElement.querySelectorAll('.syllable-button');
    buttons.forEach(button => {
        button.style.backgroundColor = button.textContent === nextSyllable ? '#98fb98' : '#ffd700';
    });
}

// Start the game
loadWord();
