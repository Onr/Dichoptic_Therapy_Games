document.addEventListener('DOMContentLoaded', () => {
  const translations = {
    en: {
      pageTitle: "Therapy Memory Card Game",
      title: "Binocular Memory Card Game",
      description: "Use red-green (or red-blue — press the button at the bottom to switch) anaglyph glasses to play. Each pair features one symbol visible only to one eye (red) and another visible to the other eye (green or blue). Use both eyes together to find matching pairs and train visual coordination.",
      controls: {
        difficultyLegend: "Difficulty",
        selectDifficulty: "Select difficulty:",
        easy: "Easy (4×4)",
        medium: "Medium (8×8)",
        hard: "Hard (12×12)",
        leftEyeLegend: "Left Eye (Red) Settings",
        rightEyeLegend: "Right Eye (Green) Settings",
        brightness: "Brightness",
        contrast: "Contrast",
        restart: "Restart"
      },
      stats: {
        timeLabel: "Time:",
        movesLabel: "Moves:",
        secondsUnit: "s"
      },
      switchEyeColorGreenBlue: "Switch Green ↔ Blue",
      switchEyeColorBlueGreen: "Switch Blue ↔ Green",
      toggleLanguage: "עברית",
      congrats: "Congratulations! You finished in {moves} moves and {timer} seconds.",
      creditText: "Built by Tal Bar Nizan & Ori Nizan • ",
      contactLink: "Contact Us"
    },
    he: {
      pageTitle: "משחק הזיכרון הטיפולי",
      title: "משחק הזיכרון הבינוקולרי",
      description: "השתמשו במשקפי אנגליף אדום-ירוק (או אדום-כחול — לחצו על הכפתור בתחתית כדי להחליף) כדי לשחק. כל זוג מכיל סמל אחד הנראה רק לעין אחת (אדום) ואחד השני הנראה רק לעין השנייה (ירוק או כחול). השתמשו בשתי העיניים יחד כדי למצוא זוגות תואמים ולשפר את שיתוף הפעולה הראייתי.",
      controls: {
        difficultyLegend: "רמת קושי",
        selectDifficulty: "בחר רמת קושי:",
        easy: "קל (4×4)",
        medium: "בינוני (8×8)",
        hard: "קשה (12×12)",
        leftEyeLegend: "הגדרות עין שמאל (אדום)",
        rightEyeLegend: "הגדרות עין ימין (ירוק)",
        brightness: "בהירות",
        contrast: "ניגודיות",
        restart: "התחל מחדש"
      },
      stats: {
        timeLabel: "זמן:",
        movesLabel: "מהלכים:",
        secondsUnit: "שניות"
      },
      switchEyeColorGreenBlue: "החלף ירוק ↔ כחול",
      switchEyeColorBlueGreen: "החלף כחול ↔ ירוק",
      toggleLanguage: "English",
      congrats: "כל הכבוד! סיימת ב־{moves} מהלכים ו־{timer} שניות.",
      creditText: "נבנה על ידי טל בר ניצן ואורי ניצן • ",
      contactLink: "צור קשר"
    }
  };

  let currentLanguage = localStorage.getItem('language') || 'en';

  function updateTexts() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'he' ? 'rtl' : 'ltr';
    document.title = translations[currentLanguage].pageTitle;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const keys = key.split('.');
      let text = translations[currentLanguage];
      keys.forEach(k => { if (text) text = text[k]; });
      if (text) el.textContent = text;
    });

    const colorToggleBtn = document.getElementById('toggle-eye-color');
    if (colorToggleBtn) {
      const currentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--right-eye-color').trim();
      const switchKey = currentColor === 'lime'
        ? 'switchEyeColorGreenBlue'
        : 'switchEyeColorBlueGreen';
      colorToggleBtn.textContent = translations[currentLanguage][switchKey];
    }

    const langToggleBtn = document.getElementById('toggle-language');
    if (langToggleBtn) langToggleBtn.textContent = translations[currentLanguage].toggleLanguage;
  }

  document.getElementById('toggle-language')?.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'he' : 'en';
    localStorage.setItem('language', currentLanguage);
    updateTexts();
  });

  updateTexts();
  const baseSymbols = [
  '🍎','🍌','🍇','🍒','🍋','🍉','🍍','🐻',
  '🥑','🫐','🍓','🍑','🍐','🦄','⭐️','❤️',
  '🍅','🌽','🥕','🧄','🍄','🥦','🎈','🎮',
  '🥬','🫑','🌶️','🍆','🥒','🍞','🥨','🌸',
  '🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕',
  '🌭','🌮','🌯','🥙','🍣','🍤','🥟','🥠',
  '🍙','🍡','🍧','🍨','🍦','🚗','❄️','✈️',
  '🧁','🎂','🍰','🥧','🍮','🍯','🍿','🧋',
  '🥤','🍺','🍻','🥂','🍷','🍸','🌵','🌴',
];


  let cardSymbols = [];

  const difficultySelect = document.getElementById('difficulty');
  let difficulty = difficultySelect.value;
  let pairsCount = 0;
  difficultySelect.addEventListener('change', () => {
    difficulty = difficultySelect.value;
    startGame();
  });

  function getGridSize() {
    if (difficulty === 'medium') return 8;
    if (difficulty === 'hard') return 12;
    return 4;
  }

  function generateSymbols(numPairs) {
    const symbols = baseSymbols.slice();
    let nextNum = 1;
    while (symbols.length < numPairs) {
      symbols.push(String(nextNum));
      nextNum++;
    }
    return symbols.slice(0, numPairs);
  }
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
    const gridSize = getGridSize();
    const totalCards = gridSize * gridSize;
    const symbolsList = generateSymbols(totalCards / 2);
    pairsCount = symbolsList.length;
    board.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
    const cardsArray = [];
    symbolsList.forEach(sym => {
      cardsArray.push({ symbol: sym, eye: 'left' });
      cardsArray.push({ symbol: sym, eye: 'right' });
    });
    cardSymbols = shuffle(cardsArray);
    cardSymbols.forEach(({ symbol, eye }) => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="inner">
          <div class="face front">
            <div class="face-layer ${eye}-eye" style="clip-path: inset(0 0 0 0);">${symbol}</div>
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
    const symbol1 = firstCard.querySelector('.face-layer').textContent;
    const symbol2 = secondCard.querySelector('.face-layer').textContent;
    if (symbol1 === symbol2) {
      disableCards();
      matchedPairs++;
      if (matchedPairs === pairsCount) {
        stopTimer();
        setTimeout(() => {
          alert(
            translations[currentLanguage].congrats
              .replace('{moves}', moves)
              .replace('{timer}', timer)
          );
        }, 500);
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


    // Toggle green/blue for the right-eye layer
  const colorToggleBtn = document.getElementById('toggle-eye-color');
  colorToggleBtn.addEventListener('click', () => {
    const current = getComputedStyle(document.documentElement)
      .getPropertyValue('--right-eye-color').trim();
    const next = current === 'lime' ? 'blue' : 'lime';
    document.documentElement.style.setProperty('--right-eye-color', next);
    updateTexts();
  });

  initSettings();
  startGame();
});

