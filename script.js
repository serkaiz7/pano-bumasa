const words = [
    { word: "palengke", syllables: ["pa", "leng", "ke"], image: "palengke.jpg", audio: "palengke.wav" },
    { word: "ospital", syllables: ["os", "pi", "tal"], image: "ospital.jpg", audio: "ospital.wav" },
    { word: "guwardiya", syllables: ["gu", "war", "di", "ya"], image: "guwardiya.jpg", audio: "guwardiya.wav" },
    { word: "estudyante", syllables: ["es", "tu", "dyan", "te"], image: "estudyante.jpg", audio: "estudyante.wav" },
    { word: "manggagamot", syllables: ["mang", "ga", "ga", "mot"], image: "manggagamot.jpg", audio: "manggagamot.wav" },
    { word: "empleyado", syllables: ["em", "ple", "ya", "do"], image: "empleyado.jpg", audio: "empleyado.wav" },
    { word: "tanghalian", syllables: ["tang", "ha", "li", "an"], image: "tanghalian.jpg", audio: "tanghalian.wav" },
    { word: "munisipyo", syllables: ["mu", "ni", "si", "pyo"], image: "munisipyo.jpg", audio: "munisipyo.wav" },
    { word: "paborito", syllables: ["pa", "bo", "ri", "to"], image: "paborito.jpg", audio: "paborito.wav" },
    { word: "tagapagbantay", syllables: ["ta", "ga", "pag", "ban", "tay"], image: "tagapagbantay.jpg", audio: "tagapagbantay.wav" }
];

let currentWordIndex = 0;
let placedSyllables = [];

const levelElement = document.getElementById('level');
const wordImageElement = document.getElementById('wordImage');
const wordDisplayElement = document.getElementById('wordDisplay');
const hollowBlocksElement = document.getElementById('hollowBlocks');
const syllableBlocksElement = document.getElementById('syllableBlocks');
const messageElement = document.getElementById('message');

const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');

function loadWord() {
    const wordData = words[currentWordIndex];
    const syllableCount = wordData.syllables.length;
    let level = syllableCount <= 3 ? 1 : syllableCount <= 4 ? 2 : 3;
    levelElement.textContent = level;
    wordImageElement.src = wordData.image;
    wordImageElement.style.transform = 'scale(0)';
    setTimeout(() => wordImageElement.style.transform = 'scale(1)', 100);
    wordDisplayElement.textContent = wordData.word;
    hollowBlocksElement.innerHTML = '';
    syllableBlocksElement.innerHTML = '';
    placedSyllables = [];
    messageElement.textContent = '';

    // Create hollow blocks
    wordData.syllables.forEach((_, index) => {
        const hollow = document.createElement('div');
        hollow.classList.add('hollow-block');
        hollow.dataset.index = index;
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
        block.addEventListener('dragend', dragEnd);
        block.addEventListener('touchstart', touchStart);
        block.addEventListener('touchmove', touchMove);
        block.addEventListener('touchend', touchEnd);
        block.tabIndex = 0; // Keyboard accessibility
        syllableBlocksElement.appendChild(block);
    });

    // Hint on double-click or Enter key
    wordDisplayElement.ondblclick = playHint;
    wordDisplayElement.onkeydown = (e) => {
        if (e.key === 'Enter') playHint();
    };
}

function playHint() {
    const wordData = words[currentWordIndex];
    const audio = new Audio(wordData.audio);
    audio.play().catch(() => console.log('Audio failed to load'));
    highlightNextSyllable();
}

// Drag-and-drop functions
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const syllable = e.dataTransfer.getData('text/plain');
    handleDrop(e.target, syllable);
}

// Touch support functions
let draggedElement = null;

function touchStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
}

function touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    draggedElement.style.position = 'absolute';
    draggedElement.style.left = `${touch.pageX - 50}px`;
    draggedElement.style.top = `${touch.pageY - 50}px`;
}

function touchEnd(e) {
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (dropTarget && dropTarget.classList.contains('hollow-block')) {
        handleDrop(dropTarget, draggedElement.textContent);
    }
    draggedElement.classList.remove('dragging');
    draggedElement.style.position = '';
    draggedElement.style.left = '';
    draggedElement.style.top = '';
    draggedElement = null;
}

function handleDrop(target, syllable) {
    const index = target.dataset.index;
    if (placedSyllables[index] === undefined) {
        if (words[currentWordIndex].syllables[index] === syllable) {
            target.textContent = syllable;
            target.classList.add('filled');
            placedSyllables[index] = syllable;
            const draggedBlock = Array.from(syllableBlocksElement.children)
                .find(block => block.textContent === syllable);
            if (draggedBlock) draggedBlock.remove();

            if (placedSyllables.filter(s => s).length === words[currentWordIndex].syllables.length) {
                messageElement.textContent = "Correct!";
                messageElement.style.color = '#32cd32';
                correctSound.play().catch(() => console.log('Sound failed to load'));
                setTimeout(nextWord, 1500);
            }
        } else {
            messageElement.textContent = "Try again!";
            messageElement.style.color = '#ff4500';
            wrongSound.play().catch(() => console.log('Sound failed to load'));
            target.style.borderColor = '#ff0000';
            setTimeout(() => target.style.borderColor = '#ff4500', 500);
        }
    }
}

function nextWord() {
    currentWordIndex++;
    if (currentWordIndex < words.length) {
        loadWord();
    } else {
        messageElement.textContent = "Congratulations! You've completed all levels!";
        messageElement.style.color = '#ffd700';
        hollowBlocksElement.innerHTML = '';
        syllableBlocksElement.innerHTML = '';
        wordImageElement.src = '';
        wordDisplayElement.textContent = '';
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

loadWord();
