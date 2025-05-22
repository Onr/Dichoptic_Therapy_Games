document.addEventListener('DOMContentLoaded', () => {
  const symbols = ['🍎', '🍌', '🍇', '🍒', '🍋', '🍉', '🍍', '🥝'];
  let cardSymbols = [];
  const board = document.getElementById('game-board');
  const movesEl = document.getElementById('moves');
  const timerEl = document.getElementById('timer');
  const restartBtn = document.getElementById('restart');

  const leftBrightness = document.getElementById('left-brightness');
  const leftContrast = document.getElementById('left-contrast');
  const rightBrightness = document.getElementById('right-brightness');
  const rightContrast = document.getElementById('right-contrast');

  let firstCard = null,
    secondCard = null;
  let lockBoard = false;
  let moves = 0;
  let matchedPairs = 0;
  let timer = 0;
  let timerInterval = null;

  function initSettings() {
    [leftBrightness, leftContrast, rightBrightness, rightContrast].forEach(input => {
      input.addEventListener('input', updateFilters);
    });
    updateFilters();
  }

  function updateFilters() {
    document.documentElement.style.setProperty(
      '--left-brightness',
      leftBrightness.value
    );
    document.documentElement.style.setProperty(
      '--left-contrast',
      leftContrast.value
    );
    document.documentElement.style.setProperty(
      '--right-brightness',
      rightBrightness.value
    );
    document.documentElement.style.setProperty(
      '--right-contrast',
      rightContrast.value
    );
  }

  function startTimer() {
    timer = 0;
    timerEl.textContent = timer;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer++;
      timerEl.textContent = timer;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createBoard() {
    board.innerHTML = '';
    cardSymbols = shuffle([...symbols, ...symbols]);
    cardSymbols.forEach(symbol => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="inner">
          <div class="face front">
            <div class="face-layer left-eye">${symbol}</div>
            <div class="face-layer right-eye">${symbol}</div>
          </div>
          <div class="face back"></div>
        </div>
      `;
      board.appendChild(card);
      card.addEventListener('click', flipCard);
    });
  }

  function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('flipped')) return;
    this.classList.add('flipped');
    if (!firstCard) {
      firstCard = this;
      if (moves === 0 && timerInterval === null) startTimer();
      return;
    }
    secondCard = this;
    moves++;
    movesEl.textContent = moves;
    checkForMatch();
  }

  function checkForMatch() {
    const symbol1 = firstCard.querySelector('.face-layer.left-eye').textContent;
    const symbol2 = secondCard.querySelector('.face-layer.left-eye').textContent;
    if (symbol1 === symbol2) {
      disableCards();
      matchedPairs++;
      if (matchedPairs === symbols.length) {
        stopTimer();
        setTimeout(
          () => alert(`Congratulations! You finished in ${moves} moves and ${timer} seconds.`),
          500
        );
      }
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoardState();
  }

  function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoardState();
    }, 1000);
  }

  function resetBoardState() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function startGame() {
    resetBoardState();
    matchedPairs = 0;
    moves = 0;
    movesEl.textContent = moves;
    stopTimer();
    timerEl.textContent = 0;
    createBoard();
  }

  restartBtn.addEventListener('click', startGame);

  initSettings();
  startGame();
});