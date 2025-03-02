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
            const level = (page === 1 ? words.length - index : 5 - index); // Levels 10-6 for page 1, 5-1 for page 2
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
        hollow.addEventListener('dragover', dragOver);
        hollow.addEventListener('drop', drop);
        hollowBlocksElement.appendChild(hollow);
    });

    // Create draggable syllable blocks
    const shuffledSyllables = [...wordData.syllables].sort(() => Math.random() - 0.5);
    shuffledSyllables.forEach(syllable => {
        const block = document.createElement('div');
        block.classList.add('syllable-block');
        block.textContent = syllable;
        block.setAttribute('draggable', true);
        block.addEventListener('dragstart', dragStart);
        block.addEventListener('touchstart', touchStart);
        block.addEventListener('touchmove', touchMove);
        block.addEventListener('touchend', touchEnd);
        block.addEventListener('click', () => playSyllableHint(syllable, wordData.syllableAudios));
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

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const syllable = e.dataTransfer.getData('text/plain');
    handleDrop(e.target, syllable);
}

let draggedElement = null;

function touchStart(e) {
    draggedElement = e.target;
    draggedElement.classList.add('dragging');
    const touch = e.touches[0];
    draggedElement.style.position = 'absolute';
    draggedElement.style.left = `${touch.pageX - 25}px`;
    draggedElement.style.top = `${touch.pageY - 25}px`;
}

function touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (draggedElement) {
        draggedElement.style.left = `${touch.pageX - 25}px`;
        draggedElement.style.top = `${touch.pageY - 25}px`;
    }
}

function touchEnd(e) {
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (dropTarget && dropTarget.classList.contains('hollow-block')) {
        handleDrop(dropTarget, draggedElement.textContent);
    }
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement.style.position = '';
        draggedElement.style.left = '';
        draggedElement.style.top = '';
        draggedElement = null;
    }
}

function handleDrop(target, syllable) {
    const index = parseInt(target.dataset.index);
    const expected = target.dataset.expected;
    target.textContent = syllable; // Allow any syllable placement
    if (!placedSyllables[index]) {
        placedSyllables[index] = syllable;
        const draggedBlock = Array.from(syllableBlocksElement.children).find(block => block.textContent === syllable);
        if (draggedBlock) draggedBlock.remove();
        if (syllable === expected) {
            correctSound.play().catch(() => console.log('Correct sound failed to load'));
        } else {
            wrongSound.play().catch(() => console.log('Wrong sound failed to load'));
        }

        // Proceed to next level regardless of correctness
        if (placedSyllables.length === words[currentWordIndex].syllables.length) {
            clearInterval(timer);
            if (placedSyllables.every((s, i) => s === words[currentWordIndex].syllables[i])) {
                score++;
            } else {
                wrongAnswers.push({
                    level: currentWordIndex + 1,
                    wrongOrder: [...placedSyllables],
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
    loadWord();
});

retryCongratsButton.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    currentWordIndex = 0;
    score = 0;
    wrongAnswers = [];
    placedSyllables = [];
    loadWord();
});

loadWord();
