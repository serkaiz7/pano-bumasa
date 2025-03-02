const words = [
    { word: "paborito", syllables: ["pa", "bo", "ri", "to"], image: "paborito.jpg", audio: "paborito.wav", syllableAudios: ["pa.wav", "bo.wav", "ri.wav", "to.wav"] },
    { word: "munisipyo", syllables: ["mu", "ni", "si", "pyo"], image: "munisipyo.jpg", audio: "munisipyo.wav", syllableAudios: ["mu.wav", "ni.wav", "si.wav", "pyo.wav"] },
    { word: "tanghalian", syllables: ["tang", "ha", "li", "an"], image: "tanghalian.jpg", audio: "tanghalian.wav", syllableAudios: ["tang.wav", "ha.wav", "li.wav", "an.wav"] },
    { word: "tagapagbantay", syllables: ["ta", "ga", "pag", "ban", "tay"], image: "tagapagbantay.jpg", audio: "tagapagbantay.wav", syllableAudios: ["ta.wav", "ga.wav", "pag.wav", "ban.wav", "tay.wav"] },
    { word: "empleyado", syllables: ["em", "ple", "ya", "do"], image: "empleyado.jpg", audio: "empleyado.wav", syllableAudios: ["em.wav", "ple.wav", "ya.wav", "do.wav"] },
    { word: "manggagamot", syllables: ["mang", "ga", "ga", "mot"], image: "manggagamot.jpg", audio: "manggagamot.wav", syllableAudios: ["mang.wav", "ga.wav", "ga.wav", "mot.wav"] },
    { word: "estudyante", syllables: ["es", "tu", "dyan", "te"], image: "estudyante.jpg", audio: "estudyante.wav", syllableAudios: ["es.wav", "tu.wav", "dyan.wav", "te.wav"] },
    { word: "guwardiya", syllables: ["gu", "war", "di", "ya"], image: "guwardiya.jpg", audio: "guwardiya.wav", syllableAudios: ["gu.wav", "war.wav", "di.wav", "ya.wav"] },
    { word: "ospital", syllables: ["os", "pi", "tal"], image: "ospital.jpg", audio: "ospital.wav", syllableAudios: ["os.wav", "pi.wav", "tal.wav"] },
    { word: "palengke", syllables: ["pa", "leng", "ke"], image: "palengke.jpg", audio: "palengke.wav", syllableAudios: ["pa.wav", "leng.wav", "ke.wav"] }
];

let currentWordIndex = 0;
let placedSyllables = [];
let initialPlacedSyllables = [];
let timer = null;
let timeLeft = 35;
let score = 0;
let wrongAnswers = [];

const levelElement = document.getElementById('level');
const wordImageElement = document.getElementById('wordImage');
const wordDisplayElement = document.getElementById('wordDisplay');
const hollowBlocksElement = document.getElementById('hollowBlocks');
const syllableBlocksElement = document.getElementById('syllableBlocks');
const messageElement = document.getElementById('message');
const timerContainer = document.getElementById('timerContainer');
const timerBar = document.getElementById('timerBar');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const retryButton = document.getElementById('retryButton');
const congratsOverlay = document.getElementById('congratsOverlay');
const retryCongratsButton = document.getElementById('retryCongratsButton');
const pregameOverlay = document.getElementById('pregameOverlay');
const nextButton = document.getElementById('nextButton');
const wordList = document.getElementById('wordList');
const page1Button = document.getElementById('page1Button');
const page2Button = document.getElementById('page2Button');
const finalScore = document.getElementById('finalScore');
const wrongLevels = document.getElementById('wrongLevels');

const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const tickSound = new Audio('tick.mp3');
const clapSound = new Audio('clap.mp3');

// Pre-game setup
let currentPage = 1;
window.onload = () => {
    function showPage(page) {
        wordList.innerHTML = '';
        const start = (page - 1) * 5;
        const end = start + 5;
        words.slice(start, end).reverse().forEach((wordData, index) => {
            const level = (page === 1 ? words.length - index : 5 - index);
            const item = document.createElement('div');
            item.classList.add('word-item');
            item.innerHTML = `
                <img src="${wordData.image}" alt="${wordData.word}">
                <div class="word-text">Level ${level}: ${wordData.word}</div>
                <div class="syllables">${wordData.syllables.map(s => `<span>${s}</span>`).join(' + ')}</div>
            `;
            item.querySelector('img').addEventListener('click', () => {
                const audio = new Audio(wordData.audio);
                audio.play().catch(() => console.log(`Word audio ${wordData.audio} failed to load`));
            });
            wordData.syllables.forEach((syllable, i) => {
                item.querySelectorAll('span')[i].addEventListener('click', () => {
                    const audio = new Audio(wordData.syllableAudios[i]);
                    audio.play().catch(() => console.log(`Syllable audio ${wordData.syllableAudios[i]} failed to load`));
                });
            });
            wordList.appendChild(item);
        });
    }

    page1Button.addEventListener('click', () => {
        currentPage = 1;
        page1Button.classList.add('active');
        page2Button.classList.remove('active');
        showPage(1);
    });

    page2Button.addEventListener('click', () => {
        currentPage = 2;
        page2Button.classList.add('active');
        page1Button.classList.remove('active');
        showPage(2);
    });

    page1Button.click(); // Default to Page 1
    nextButton.addEventListener('click', () => {
        pregameOverlay.style.display = 'none';
        document.querySelector('.game-container').style.display = 'block';
        loadWord();
    });
};

function loadWord() {
    const wordData = words[currentWordIndex];
    levelElement.textContent = currentWordIndex + 1; // Level 1 to 10 based on word index
    wordImageElement.src = wordData.image;
    wordImageElement.style.transform = 'scale(0)';
    setTimeout(() => wordImageElement.style.transform = 'scale(1)', 100);
    wordDisplayElement.textContent = wordData.word;
    hollowBlocksElement.innerHTML = '';
    syllableBlocksElement.innerHTML = '';
    placedSyllables = [];
    initialPlacedSyllables = []; // Reset initial order
    messageElement.textContent = '';

    // Show timer for Levels 2 to 10 (words 2-10)
    if (currentWordIndex > 0) {
        timerContainer.style.display = 'block';
        timeLeft = 35;
        timerBar.style.width = '100%';
        startTimer();
    } else {
        timerContainer.style.display = 'none';
    }

    // Create hollow blocks with expected syllables
    wordData.syllables.forEach((syllable, index) => {
        const hollow = document.createElement('div');
        hollow.classList.add('hollow-block');
        hollow.dataset.index = index;
        hollow.dataset.expected = syllable;
        hollow.addEventListener('click', () => interchangeSyllable(hollow));
        hollowBlocksElement.appendChild(hollow);
    });

    // Create tappable syllable blocks
    const shuffledSyllables = [...wordData.syllables].sort(() => Math.random() - 0.5);
    shuffledSyllables.forEach(syllable => {
        const block = document.createElement('div');
        block.classList.add('syllable-block');
        block.textContent = syllable;
        block.addEventListener('click', () => insertSyllable(syllable));
        block.tabIndex = 0;
        syllableBlocksElement.appendChild(block);
    });

    // Hint on tap or Enter key for word
    wordDisplayElement.onclick = () => playWordHint(wordData);
    wordDisplayElement.onkeydown = (e) => {
        if (e.key === 'Enter') playWordHint(wordData);
    };
}

function playWordHint(wordData) {
    const wordAudio = new Audio(wordData.audio);
    wordAudio.play().catch(() => console.log('Word audio failed to load'));
    highlightNextSyllable();
}

function playSyllableHint(syllable, syllableAudios) {
    const index = words[currentWordIndex].syllables.indexOf(syllable);
    if (index !== -1) {
        const audio = new Audio(syllableAudios[index]);
        audio.play().catch(() => console.log(`Syllable audio ${syllableAudios[index]} failed to load`));
    }
}

function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / 35) * 100;
        timerBar.style.width = `${percentage}%`;
        tickSound.play().catch(() => console.log('Tick sound failed to load'));
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver();
        }
    }, 1000);
}

function insertSyllable(syllable) {
    // Find the next empty hollow box in ascending order
    let emptyIndex = -1;
    for (let i = 0; i < hollowBlocksElement.children.length; i++) {
        if (!placedSyllables[i]) {
            emptyIndex = i;
            break;
        }
    }
    if (emptyIndex !== -1) {
        const hollow = hollowBlocksElement.children[emptyIndex];
        hollow.textContent = syllable;
        placedSyllables[emptyIndex] = syllable;
        playSyllableHint(syllable, words[currentWordIndex].syllableAudios); // Play sound on tap
        checkCompletion();
    }
}

function interchangeSyllable(target) {
    const index = parseInt(target.dataset.index);
    if (placedSyllables[index]) {
        const syllable = placedSyllables[index];
        const availableSyllables = words[currentWordIndex].syllables;
        const newSyllable = prompt(`Enter a syllable to swap with ${syllable} (e.g., ${availableSyllables.join(', ')}):`);
        if (newSyllable && availableSyllables.includes(newSyllable)) {
            const newIndex = placedSyllables.indexOf(newSyllable) !== -1 ? placedSyllables.indexOf(newSyllable) : placedSyllables.indexOf(undefined);
            if (newIndex !== -1 || !placedSyllables.includes(newSyllable)) {
                if (newIndex === -1) {
                    // Find the next empty slot if newSyllable isn't placed
                    for (let i = 0; i < hollowBlocksElement.children.length; i++) {
                        if (!placedSyllables[i]) {
                            newIndex = i;
                            break;
                        }
                    }
                }
                placedSyllables[newIndex] = syllable;
                hollowBlocksElement.children[newIndex].textContent = syllable;
                placedSyllables[index] = newSyllable;
                target.textContent = newSyllable;
                playSyllableHint(newSyllable, words[currentWordIndex].syllableAudios);
                checkCompletion();
            } else {
                alert("That syllable is already placed and cannot be swapped again!");
            }
        } else {
            alert("Invalid syllable!");
        }
    }
}

function checkCompletion() {
    if (placedSyllables.length === words[currentWordIndex].syllables.length) {
        clearInterval(timer);
        if (!initialPlacedSyllables.length) {
            initialPlacedSyllables = [...placedSyllables]; // Record initial order
        }
        if (placedSyllables.every((s, i) => s === words[currentWordIndex].syllables[i])) {
            score++;
        } else if (!wrongAnswers.some(w => w.level === currentWordIndex + 1)) {
            wrongAnswers.push({
                level: currentWordIndex + 1,
                wrongOrder: [...initialPlacedSyllables],
                correctOrder: [...words[currentWordIndex].syllables]
            });
        }
        const wordAudio = new Audio(words[currentWordIndex].audio);
        wordAudio.play().catch(() => console.log('Word audio failed to load'));
        messageElement.textContent = "Next Level!";
        messageElement.style.color = '#32cd32';
        setTimeout(nextWord, 2000);
    }
}

function nextWord() {
    currentWordIndex++;
    if (currentWordIndex < words.length) {
        levelElement.textContent = currentWordIndex + 1; // Level 1 to 10
        placedSyllables = []; // Reset for next level
        loadWord();
    } else {
        showCongrats();
    }
}

function highlightNextSyllable() {
    const nextIndex = placedSyllables.filter(s => s).length;
    if (nextIndex < words[currentWordIndex].syllables.length) {
        const hollow = hollowBlocksElement.children[nextIndex];
        hollow.style.borderColor = '#32cd32';
        hollow.style.transform = 'scale(1.1)';
        setTimeout(() => {
            hollow.style.borderColor = '#ff4500';
            hollow.style.transform = 'scale(1)';
        }, 2000);
    }
}

function gameOver() {
    gameOverOverlay.style.display = 'flex';
    messageElement.textContent = '';
}

function showCongrats() {
    congratsOverlay.style.display = 'flex';
    const overlay = document.getElementById('congratsOverlay');
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = ['#ff4500', '#ffd700', '#98fb98', '#87ceeb'][Math.floor(Math.random() * 4)];
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        overlay.appendChild(confetti);
    }
    clapSound.play().catch(() => console.log('Clap sound failed to load'));
    finalScore.textContent = `${score}/10`;
    wrongLevels.innerHTML = wrongAnswers.map(w => 
        `<p>Level ${w.level}: Wrong: ${w.wrongOrder.join(' + ')}, Correct: ${w.correctOrder.join(' + ')}</p>`
    ).join('');
    messageElement.textContent = 'Test Completed!';
    messageElement.style.color = '#32cd32';
}

retryButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    initialPlacedSyllables = [];
    loadWord();
});

retryCongratsButton.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    initialPlacedSyllables = [];
    loadWord();
});

loadWord();
