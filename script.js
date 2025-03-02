const words = [
    { word: "palengke", syllables: ["pa", "leng", "ke"], image: "palengke.jpg", audio: "palengke.wav", syllableAudios: ["pa.wav", "leng.wav", "ke.wav"] },
    { word: "ospital", syllables: ["os", "pi", "tal"], image: "ospital.jpg", audio: "ospital.wav", syllableAudios: ["os.wav", "pi.wav", "tal.wav"] },
    { word: "guwardiya", syllables: ["gu", "war", "di", "ya"], image: "guwardiya.jpg", audio: "guwardiya.wav", syllableAudios: ["gu.wav", "war.wav", "di.wav", "ya.wav"] },
    { word: "estudyante", syllables: ["es", "tu", "dyan", "te"], image: "estudyante.jpg", audio: "estudyante.wav", syllableAudios: ["es.wav", "tu.wav", "dyan.wav", "te.wav"] },
    { word: "manggagamot", syllables: ["mang", "ga", "ga", "mot"], image: "manggagamot.jpg", audio: "manggagamot.wav", syllableAudios: ["mang.wav", "ga.wav", "ga.wav", "mot.wav"] },
    { word: "empleyado", syllables: ["em", "ple", "ya", "do"], image: "empleyado.jpg", audio: "empleyado.wav", syllableAudios: ["em.wav", "ple.wav", "ya.wav", "do.wav"] },
    { word: "tagapagbantay", syllables: ["ta", "ga", "pag", "ban", "tay"], image: "tagapagbantay.jpg", audio: "tagapagbantay.wav", syllableAudios: ["ta.wav", "ga.wav", "pag.wav", "ban.wav", "tay.wav"] },
    { word: "tanghalian", syllables: ["tang", "ha", "li", "an"], image: "tanghalian.jpg", audio: "tanghalian.wav", syllableAudios: ["tang.wav", "ha.wav", "li.wav", "an.wav"] },
    { word: "munisipyo", syllables: ["mu", "ni", "si", "pyo"], image: "munisipyo.jpg", audio: "munisipyo.wav", syllableAudios: ["mu.wav", "ni.wav", "si.wav", "pyo.wav"] },
    { word: "paborito", syllables: ["pa", "bo", "ri", "to"], image: "paborito.jpg", audio: "paborito.wav", syllableAudios: ["pa.wav", "bo.wav", "ri.wav", "to.wav"] }
];

let currentWordIndex = 0;
let placedSyllables = [];
let timer = null;
let timeLeft = 60; // Increased to 60 seconds

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
const hintOverlay = document.getElementById('hintOverlay');

const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const tickSound = new Audio('tick.mp3');
const clapSound = new Audio('clap.mp3');

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
    hintOverlay.style.display = 'none'; // Hide hint overlay on new word

    // Show timer for Levels 2 to 10 (words 2-10)
    if (currentWordIndex > 0) {
        timerContainer.style.display = 'block';
        timeLeft = 60; // Set to 60 seconds
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
        block.addEventListener('touchstart', touchStart); // Immediate drag on touch
        block.addEventListener('touchmove', touchMove);
        block.addEventListener('touchend', touchEnd);
        block.addEventListener('dblclick', () => playSyllableHint(syllable, wordData.syllableAudios));
        block.tabIndex = 0;
        syllableBlocksElement.appendChild(block);
    });

    // Hint on double-click or Enter key for word
    wordDisplayElement.ondblclick = () => playWordHint(wordData);
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
        const percentage = (timeLeft / 60) * 100; // Adjusted for 60 seconds
        timerBar.style.width = `${percentage}%`;
        tickSound.play().catch(() => console.log('Tick sound failed to load'));
        if (timeLeft === 30) {
            hintOverlay.style.display = 'block'; // Show hint at 30 seconds
        }
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
    draggedElement.style.left = `${touch.pageX - 50}px`;
    draggedElement.style.top = `${touch.pageY - 50}px`;
}

function touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (draggedElement) {
        draggedElement.style.left = `${touch.pageX - 50}px`;
        draggedElement.style.top = `${touch.pageY - 50}px`;
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
    if (!placedSyllables[index]) {
        if (syllable === expected) {
            target.textContent = syllable;
            target.classList.add('filled');
            placedSyllables[index] = syllable;
            const draggedBlock = Array.from(syllableBlocksElement.children).find(block => block.textContent === syllable);
            if (draggedBlock) draggedBlock.remove();
            correctSound.play().catch(() => console.log('Correct sound failed to load'));

            // Check if all syllables are correctly placed in order
            if (placedSyllables.length === words[currentWordIndex].syllables.length &&
                placedSyllables.every((s, i) => s === words[currentWordIndex].syllables[i])) {
                clearInterval(timer);
                const wordAudio = new Audio(words[currentWordIndex].audio);
                wordAudio.play().catch(() => console.log('Word audio failed to load'));
                messageElement.textContent = "Correct!";
                messageElement.style.color = '#32cd32';
                setTimeout(nextWord, 2000);
            }
        } else {
            messageElement.textContent = "Try again!";
            messageElement.style.color = '#ff4500';
            wrongSound.play().catch(() => console.log('Wrong sound failed to load'));
            target.style.borderColor = '#ff0000';
            setTimeout(() => target.style.borderColor = '#ff4500', 500);
        }
    }
}

function nextWord() {
    currentWordIndex++;
    if (currentWordIndex < words.length) {
        levelElement.textContent = currentWordIndex + 1; // Level 1 to 10
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
    messageElement.textContent = 'Congratulations!';
    messageElement.style.color = '#32cd32';
}

retryButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    currentWordIndex = 0;
    loadWord();
});

retryCongratsButton.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    currentWordIndex = 0;
    loadWord();
});

loadWord();
