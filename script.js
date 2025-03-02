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

// Shuffle words randomly
let shuffledWords = [...words].sort(() => Math.random() - 0.5);
let currentWordIndex = 0;
let pregameIndex = 0;

let placedSyllables = [];
let initialPlacedSyllables = [];
let timer = null;
let timeLeft = 35;
let score = 0;
let wrongAnswers = [];

const wordImageElement = document.getElementById('wordImage');
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
const wordContainer = document.getElementById('wordContainer');
const finalScore = document.getElementById('finalScore');
const wrongLevels = document.getElementById('wrongLevels');
const backButton = document.getElementById('backButton');
const backButtonGameOver = document.getElementById('backButtonGameOver');
const backButtonCongrats = document.getElementById('backButtonCongrats');

const correctSound = new Audio('correct.wav');
const wrongSound = new Audio('wrong.wav');
const tickSound = new Audio('tick.wav');
const clapSound = new Audio('clap.wav');

// Pre-game setup
window.onload = () => {
    function showWord() {
        wordContainer.innerHTML = '';
        if (pregameIndex < shuffledWords.length) {
            const wordData = shuffledWords[pregameIndex];
            const item = document.createElement('div');
            item.classList.add('word-item');
            item.innerHTML = `
                <img src="${wordData.image}" alt="${wordData.word}">
                <div class="syllables">${wordData.syllables.map(s => `<span>${s}</span>`).join(' ')}</div>
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
            wordContainer.appendChild(item);
            nextButton.style.display = pregameIndex < shuffledWords.length - 1 ? 'block' : 'none';
        } else {
            nextButton.style.display = 'none';
            setTimeout(() => {
                pregameOverlay.style.display = 'none';
                document.querySelector('.game-container').style.display = 'block';
                currentWordIndex = 0;
                loadWord();
            }, 1000); // Delay to allow last word to be seen
        }
    }

    nextButton.addEventListener('click', () => {
        pregameIndex++;
        showWord();
    });

    showWord(); // Show first word
    pregameOverlay.style.display = 'block';
    backButton.addEventListener('click', () => {
        pregameOverlay.style.display = 'block';
        document.querySelector('.game-container').style.display = 'none';
        pregameIndex = 0;
        showWord();
        currentWordIndex = 0;
        score = 0;
        wrongAnswers = [];
        placedSyllables = [];
        initialPlacedSyllables = [];
    });
    backButtonGameOver.addEventListener('click', () => {
        gameOverOverlay.style.display = 'none';
        pregameOverlay.style.display = 'block';
        pregameIndex = 0;
        showWord();
        currentWordIndex = 0;
        score = 0;
        wrongAnswers = [];
        placedSyllables = [];
        initialPlacedSyllables = [];
    });
    backButtonCongrats.addEventListener('click', () => {
        congratsOverlay.style.display = 'none';
        pregameOverlay.style.display = 'block';
        pregameIndex = 0;
        showWord();
        currentWordIndex = 0;
        score = 0;
        wrongAnswers = [];
        placedSyllables = [];
        initialPlacedSyllables = [];
    });
};

function loadWord() {
    const wordData = shuffledWords[currentWordIndex];
    wordImageElement.src = wordData.image;
    wordImageElement.style.transform = 'scale(0)';
    setTimeout(() => {
        wordImageElement.style.transform = 'scale(1)';
        const wordAudio = new Audio(wordData.audio);
        wordAudio.play().catch(() => console.log('Word audio failed to load'));
    }, 100);
    hollowBlocksElement.innerHTML = '';
    syllableBlocksElement.innerHTML = '';
    placedSyllables = [];
    initialPlacedSyllables = []; // Reset initial order
    messageElement.textContent = '';

    // Show timer for all levels except the first (randomized)
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
        hollow.addEventListener('click', () => clearSyllable(hollow));
        hollow.addEventListener('click', () => interchangeSyllable(hollow)); // Allow interchange after clear
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

    // Hint on tap for word (via image)
    wordImageElement.onclick = () => playWordHint(wordData);
}

function playWordHint(wordData) {
    const wordAudio = new Audio(wordData.audio);
    wordAudio.play().catch(() => console.log('Word audio failed to load'));
    highlightNextSyllable();
}

function playSyllableHint(syllable, syllableAudios) {
    const index = shuffledWords[currentWordIndex].syllables.indexOf(syllable);
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
        playSyllableHint(syllable, shuffledWords[currentWordIndex].syllableAudios); // Play sound on tap
        checkCompletion();
    }
}

function clearSyllable(target) {
    const index = parseInt(target.dataset.index);
    if (placedSyllables[index]) {
        placedSyllables[index] = undefined;
        target.textContent = '';
        checkCompletion();
    }
}

function interchangeSyllable(target) {
    const index = parseInt(target.dataset.index);
    if (placedSyllables[index]) {
        const syllable = placedSyllables[index];
        const availableSyllables = shuffledWords[currentWordIndex].syllables;
        const newSyllable = prompt(`Enter a syllable to swap with ${syllable} (e.g., ${availableSyllables.join(', ')}):`);
        if (newSyllable && availableSyllables.includes(newSyllable)) {
            const newIndex = placedSyllables.indexOf(newSyllable) !== -1 ? placedSyllables.indexOf(newSyllable) : placedSyllables.indexOf(undefined);
            if (newIndex !== -1 || !placedSyllables.includes(newSyllable)) {
                if (newIndex === -1) {
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
                playSyllableHint(newSyllable, shuffledWords[currentWordIndex].syllableAudios);
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
    if (placedSyllables.length === shuffledWords[currentWordIndex].syllables.length) {
        clearInterval(timer);
        if (!initialPlacedSyllables.length) {
            initialPlacedSyllables = [...placedSyllables]; // Record initial order
        }
        if (placedSyllables.every((s, i) => s === shuffledWords[currentWordIndex].syllables[i])) {
            score++;
        } else if (!wrongAnswers.some(w => w.level === currentWordIndex + 1)) {
            wrongAnswers.push({
                level: currentWordIndex + 1,
                wrongOrder: [...initialPlacedSyllables],
                correctOrder: [...shuffledWords[currentWordIndex].syllables]
            });
        }
        const wordAudio = new Audio(shuffledWords[currentWordIndex].audio);
        wordAudio.play().catch(() => console.log('Word audio failed to load'));
        messageElement.textContent = "Next Level!";
        messageElement.style.color = '#32cd32';
        setTimeout(nextWord, 2000);
    }
}

function nextWord() {
    currentWordIndex++;
    if (currentWordIndex < shuffledWords.length) {
        placedSyllables = []; // Reset for next level
        loadWord();
    } else {
        showCongrats();
    }
}

function highlightNextSyllable() {
    const nextIndex = placedSyllables.filter(s => s).length;
    if (nextIndex < shuffledWords[currentWordIndex].syllables.length) {
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
    shuffledWords = [...words].sort(() => Math.random() - 0.5); // Reshuffle
    pregameIndex = 0;
    pregameOverlay.style.display = 'block';
    document.querySelector('.game-container').style.display = 'none';
    showWord();
});

retryCongratsButton.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    initialPlacedSyllables = [];
    shuffledWords = [...words].sort(() => Math.random() - 0.5); // Reshuffle
    pregameIndex = 0;
    pregameOverlay.style.display = 'block';
    document.querySelector('.game-container').style.display = 'none';
    showWord();
});

backButton.addEventListener('click', () => {
    pregameOverlay.style.display = 'block';
    document.querySelector('.game-container').style.display = 'none';
    pregameIndex = 0;
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    initialPlacedSyllables = [];
    showWord();
});

backButtonGameOver.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    pregameOverlay.style.display = 'block';
    pregameIndex = 0;
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    initialPlacedSyllables = [];
    showWord();
});

backButtonCongrats.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    pregameOverlay.style.display = 'block';
    pregameIndex = 0;
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    initialPlacedSyllables = [];
    showWord();
});

loadWord();
