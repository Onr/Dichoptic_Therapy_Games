

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Expose the grid size logic outside of the DOM environment so that it can
// be tested with Node. The memory game also uses this helper when creating the
// board inside the DOMContentLoaded handler.
function getGridSize(level) {
  if (level === 'medium') {return 8;}
  if (level === 'hard') {return 12;}
  return 4;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
  // Translations for internalization (i18n)
    const translations = {
      en: {
        pageTitle: 'Therapy Memory Card Game',
        title: 'Scanning Practice',
        description: 'Play using red–green anaglyph glasses (or red–blue – click the button at the bottom to switch between modes). Each pair contains one symbol visible only to one eye (red) and another visible only to the other eye (green or blue). Use both eyes together to find matching pairs and improve binocular vision.',
        controls: {
          difficultyLegend: 'Difficulty',
          selectDifficulty: 'Select difficulty:',
          easy: 'Easy (4×4)',
          medium: 'Medium (8×8)',
          hard: 'Hard (12×12)',
          leftEyeLegend: 'Left Eye (Red) Settings',
          rightEyeLegend: 'Right Eye (Green) Settings',
          rightEyeLegendBlue: 'Right Eye (Blue) Settings',
          brightness: 'Brightness',
          contrast: 'Contrast',
          restart: 'Restart'
        },
        stats: {
          timeLabel: 'Time',
          movesLabel: 'Moves',
          scoreLabel: 'Score',
          secondsUnit: 's'
        },
        leaderboard: {
          title: 'Leaderboard',
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard'
        },
        switchEyeColorGreenBlue: 'Switch Green ↔ Blue',
        switchEyeColorBlueGreen: 'Switch Blue ↔ Green',
        toggleLanguage: 'עברית',
        congrats: 'Congratulations!',
        gameOver: 'Game Over',
        finalScore: 'Your final score is {score}',
        playAgain: 'Play Again',
        creditText: 'Built by Tal Bar Nizan & Ori Nizan • ',
        contactLink: 'Contact Us',
        card: 'Card',
        cardFlipped: 'Card flipped',
        howToPlay: 'How to Play',
        instructions: `
        <p>The goal of this game is to find all the matching pairs of symbols.</p>
        <p>Each pair consists of two cards: one with a red symbol and one with a green (or blue) symbol.</p>
        <p>You need to use both eyes to see the symbols and find the matches.</p>
        <p>Click on a card to flip it over. Then, click on another card to see if it's a match.</p>
        <p>Have fun, and good luck!</p>
      `
      },
      he: {
        pageTitle: 'משחק הזיכרון הטיפולי',
        title: 'אימון סריקה',
        description: 'שחקו באמצעות משקפי אנגליף אדום–ירוק (או אדום–כחול – לחצו על הכפתור שבתחתית כדי להחליף בין האפשרויות). בכל זוג תמצאו סמל אחד הנראה רק לעין אחת (באדום) וסמל נוסף הנראה לעין השנייה בלבד (בירוק או בכחול). הסתכלו בשתי העיניים יחד כדי למצוא זוגות תואמים ולתרגל ראייה בינוקולרית.',
        controls: {
          difficultyLegend: 'רמת קושי',
          selectDifficulty: 'בחר רמת קושי:',
          easy: 'קל (4×4)',
          medium: 'בינוני (8×8)',
          hard: 'קשה (12×12)',
          leftEyeLegend: 'הגדרות עין שמאל (אדום)',
          rightEyeLegend: 'הגדרות עין ימין (ירוק)',
          rightEyeLegendBlue: 'הגדרות עין ימין (כחול)',
          brightness: 'בהירות',
          contrast: 'ניגודיות',
          restart: 'התחל מחדש'
        },
        stats: {
          timeLabel: 'זמן',
          movesLabel: 'מהלכים',
          scoreLabel: 'ניקוד',
          secondsUnit: 'ש'
        },
        leaderboard: {
          title: 'טבלת שיאים',
          easy: 'קל',
          medium: 'בינוני',
          hard: 'קשה'
        },
        switchEyeColorGreenBlue: 'החלף ירוק ↔ כחול',
        switchEyeColorBlueGreen: 'החלף כחול ↔ ירוק',
        toggleLanguage: 'English',
        congrats: 'כל הכבוד!',
        gameOver: 'המשחק נגמר',
        finalScore: 'הניקוד הסופי שלך הוא {score}',
        playAgain: 'שחק שוב',
        creditText: 'נבנה על ידי טל בר ניצן ואורי ניצן • ',
        contactLink: 'צור קשר',
        card: 'קלף',
        cardFlipped: 'קלף הפוך',
        howToPlay: 'איך לשחק',
        instructions: `
      <p>מטרת המשחק היא למצוא את כל זוגות הסמלים התואמים.</p>
      <p>כל זוג מורכב משני קלפים: אחד עם סמל באדום והשני עם סמל בירוק (או כחול).</p>
      <p>כדי לראות את הסמלים, השתמשו בשתי העיניים יחד דרך משקפי האנגליף.</p>
      <p>לחצו על קלף כדי לחשוף אותו, ולאחר מכן לחצו על קלף נוסף כדי לבדוק אם יש התאמה.</p>
      <p>בהצלחה ואל תשכחו ליהנות!</p>
      `
      }
    };

    // Game state object
    const game = {
      currentLanguage: localStorage.getItem('language') || 'en',
      difficulty: 'easy',
      pairsCount: 0,
      firstCard: null,
      secondCard: null,
      lockBoard: false,
      moves: 0,
      matchedPairs: 0,
      timer: 0,
      timerInterval: null,
      score: 0,
      baseSymbols: [
        '🍎','🍌','🍇','🍒','🍋','🍉','🍍','🐻',
        '🥑','🫐','🍓','🍑','🍐','🦄','⭐️','❤️',
        '🍅','🌽','🥕','🧄','🍄','🥦','🎈','🎮',
        '🥬','🫑','🌶️','🍆','🥒','🍞','🥨','🌸',
        '🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕',
        '🌭','🌮','🌯','🥙','🍣','🍤','🥟','🥠',
        '🍙','🍡','🍧','🍨','🍦','🚗','❄️','✈️',
        '🧁','🎂','🍰','🥧','🍮','🍯','🍿','🧋',
        '🥤','🍺','🍻','🥂','🍷','🍸','🌵','🌴',
      ],
      cardSymbols: []
    };

    // DOM elements
    const difficultySelect = document.getElementById('difficulty');
    const board = document.getElementById('game-board');
    const movesEl = document.getElementById('moves');
    const timerEl = document.getElementById('timer');
    const scoreEl = document.getElementById('score');
    const restartBtn = document.getElementById('restart');
    const leftBrightness = document.getElementById('left-brightness');
    const leftContrast = document.getElementById('left-contrast');
    const rightBrightness = document.getElementById('right-brightness');
    const rightContrast = document.getElementById('right-contrast');
    const colorToggleBtn = document.getElementById('toggle-eye-color');
    const langToggleBtn = document.getElementById('toggle-language');
    const rightEyeLegend = document.querySelector('[data-i18n="controls.rightEyeLegend"]');
    const leaderboardEasy = document.getElementById('leaderboard-easy');
    const leaderboardMedium = document.getElementById('leaderboard-medium');
    const leaderboardHard = document.getElementById('leaderboard-hard');


    /**
   * Updates the UI text based on the current language.
   */
    function updateTexts() {
      document.documentElement.lang = game.currentLanguage;
      document.documentElement.dir = game.currentLanguage === 'he' ? 'rtl' : 'ltr';
      document.title = translations[game.currentLanguage].pageTitle;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let text = translations[game.currentLanguage];
        keys.forEach(k => { if (text) {text = text[k];} });
        if (text) {el.textContent = text;}
      });

      if (colorToggleBtn) {
        const currentColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--right-eye-color').trim();
        const switchKey = currentColor === 'lime'
          ? 'switchEyeColorGreenBlue'
          : 'switchEyeColorBlueGreen';
        colorToggleBtn.textContent = translations[game.currentLanguage][switchKey];

        // Update right eye legend
        const legendKey = currentColor === 'lime' ? 'rightEyeLegend' : 'rightEyeLegendBlue';
        rightEyeLegend.textContent = translations[game.currentLanguage].controls[legendKey];
      }

      if (langToggleBtn) {langToggleBtn.textContent = translations[game.currentLanguage].toggleLanguage;}
    }

    /**
   * Toggles the language between English and Hebrew.
   */
    function toggleLanguage() {
      game.currentLanguage = game.currentLanguage === 'en' ? 'he' : 'en';
      localStorage.setItem('language', game.currentLanguage);
      updateTexts();
    }

    // getGridSize is defined globally for tests; reuse it here

    /**
   * Generates the symbols for the game board.
   * @param {number} numPairs The number of pairs to generate.
   * @returns {string[]} The list of symbols.
   */
    function generateSymbols(numPairs) {
      const symbols = game.baseSymbols.slice();
      let nextNum = 1;
      while (symbols.length < numPairs) {
        symbols.push(String(nextNum));
        nextNum++;
      }
      return symbols.slice(0, numPairs);
    }

    /**
   * Creates the game board.
   */
    function createBoard() {
      board.innerHTML = '';
      const gridSize = getGridSize(game.difficulty);
      const totalCards = gridSize * gridSize;
      const symbolsList = generateSymbols(totalCards / 2);
      game.pairsCount = symbolsList.length;
      board.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
      const cardsArray = symbolsList.flatMap(sym => [{ symbol: sym, eye: 'left' }, { symbol: sym, eye: 'right' }]);
      game.cardSymbols = shuffle(cardsArray);
      game.cardSymbols.forEach(({ symbol, eye }, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.tabIndex = 0;
        card.setAttribute('aria-label', `${translations[game.currentLanguage].card} ${index + 1}`);
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
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            flipCard.call(card);
          }
        });
      });
    }

    /**
   * Flips a card.
   */
    function flipCard() {
      if (game.lockBoard || this === game.firstCard || this.classList.contains('flipped')) {return;}
      this.classList.add('flipped');
      this.setAttribute('aria-label', `${translations[game.currentLanguage].cardFlipped}: ${this.querySelector('.face-layer').textContent}`);
      if (!game.firstCard) {
        game.firstCard = this;
        if (game.moves === 0 && game.timerInterval === null) {startTimer();}
        return;
      }
      game.secondCard = this;
      game.moves++;
      movesEl.textContent = game.moves;
      updateScore();
      checkForMatch();
    }

    /**
   * Checks if the two flipped cards match.
   */
    function checkForMatch() {
      const symbol1 = game.firstCard.querySelector('.face-layer').textContent;
      const symbol2 = game.secondCard.querySelector('.face-layer').textContent;
      if (symbol1 === symbol2) {
        game.firstCard.classList.add('matched');
        game.secondCard.classList.add('matched');
        disableCards();
        game.matchedPairs++;
        if (game.matchedPairs === game.pairsCount) {
          stopTimer();
          setTimeout(() => {
            updateLeaderboard();
            showGameOverModal();
          }, 500);
        }
      } else {
        game.firstCard.classList.add('mismatched');
        game.secondCard.classList.add('mismatched');
        unflipCards();
      }
    }

    /**
   * Disables the two matched cards.
   */
    function disableCards() {
      game.firstCard.removeEventListener('click', flipCard);
      game.secondCard.removeEventListener('click', flipCard);
      resetBoardState();
    }

    /**
   * Unflips the two cards if they don't match.
   */
    function unflipCards() {
      game.lockBoard = true;
      setTimeout(() => {
        game.firstCard.classList.remove('flipped', 'mismatched');
        game.secondCard.classList.remove('flipped', 'mismatched');
        game.firstCard.setAttribute('aria-label', `${translations[game.currentLanguage].card} ${game.firstCard.dataset.index + 1}`);
        game.secondCard.setAttribute('aria-label', `${translations[game.currentLanguage].card} ${game.secondCard.dataset.index + 1}`);
        resetBoardState();
      }, 1000);
    }

    /**
   * Resets the board state after a move.
   */
    function resetBoardState() {
      [game.firstCard, game.secondCard] = [null, null];
      game.lockBoard = false;
    }

    /**
   * Starts the game.
   */
    function startGame() {
    // Log game start
      if (window.Logger) {
        window.Logger.gameStart(game.difficulty, {
          leftBrightness: leftBrightness.value,
          leftContrast: leftContrast.value,
          rightBrightness: rightBrightness.value,
          rightContrast: rightContrast.value,
          language: game.currentLanguage
        });
      }

      // Start performance monitoring
      if (window.PerformanceMonitor) {
        window.PerformanceMonitor.startGamePerformance(game.difficulty);
      }

      resetBoardState();
      game.matchedPairs = 0;
      game.moves = 0;
      game.score = 0;
      movesEl.textContent = game.moves;
      scoreEl.textContent = game.score;
      stopTimer();
      timerEl.textContent = 0;
      game.timerInterval = null;
      createBoard();

      // Analytics tracking
      if (typeof gtag === 'function') {
        gtag('event', 'game_start', {
          game_difficulty: game.difficulty,
          game_language: game.currentLanguage
        });
      }
    }

    /**
   * Starts the timer.
   */
    function startTimer() {
      game.timer = 0;
      timerEl.textContent = game.timer;
      clearInterval(game.timerInterval);
      game.timerInterval = setInterval(() => {
        game.timer++;
        timerEl.textContent = game.timer;
        updateScore();
      }, 1000);
    }

    /**
   * Stops the timer.
   */
    function stopTimer() {
      clearInterval(game.timerInterval);
    }

    /**
   * Updates the score.
   */
    function updateScore() {
      game.score = Math.max(0, (game.pairsCount * 100) - (game.moves * 5) - (game.timer * 2));
      scoreEl.textContent = game.score;
    }

    /**
   * Shows the game over modal.
   */
    function showGameOverModal() {
    // Log game completion
      if (window.Logger) {
        window.Logger.gameEnd({
          difficulty: game.difficulty,
          time: game.time,
          moves: game.moves,
          score: game.score
        });
      }

      // Track performance
      if (window.PerformanceMonitor) {
        window.PerformanceMonitor.endGamePerformance({
          time: game.time,
          moves: game.moves,
          score: game.score
        });
      }

      // Update leaderboard first
      updateLeaderboard();

      // Show game over alert using production alert system
      if (window.AlertSystem) {
        window.AlertSystem.gameOver(
          { time: game.time, moves: game.moves, score: game.score },
          () => startGame(), // onRestart
          () => window.location.href = 'index.html' // onMenu
        );
      } else {
      // Fallback to modal for compatibility
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content">
          <h2 data-i18n="gameOver">${translations[game.currentLanguage].gameOver}</h2>
          <p>${translations[game.currentLanguage].congrats}</p>
          <p>${translations[game.currentLanguage].finalScore.replace('{score}', game.score)}</p>
          <button id="play-again" data-i18n="playAgain">${translations[game.currentLanguage].playAgain}</button>
        </div>
      `;
        document.body.appendChild(modal);
        document.getElementById('play-again').addEventListener('click', () => {
          modal.remove();
          startGame();
        });
      }

      // Analytics tracking
      if (typeof gtag === 'function') {
        gtag('event', 'game_complete', {
          game_difficulty: game.difficulty,
          game_time: game.time,
          game_moves: game.moves,
          game_score: game.score
        });
      }
    }

    /**
   * Updates the CSS filters for brightness and contrast and saves them to localStorage.
   */
    function updateFilters() {
      const settings = {
        leftBrightness: leftBrightness.value,
        leftContrast: leftContrast.value,
        rightBrightness: rightBrightness.value,
        rightContrast: rightContrast.value
      };

      localStorage.setItem('eyeSettings', JSON.stringify(settings));

      document.documentElement.style.setProperty('--left-brightness', settings.leftBrightness);
      document.documentElement.style.setProperty('--left-contrast', settings.leftContrast);
      document.documentElement.style.setProperty('--right-brightness', settings.rightBrightness);
      document.documentElement.style.setProperty('--right-contrast', settings.rightContrast);
    }

    /**
   * Initializes the settings controls.
   */
    function initSettings() {
      const savedSettings = JSON.parse(localStorage.getItem('eyeSettings'));
      if (savedSettings) {
        leftBrightness.value = savedSettings.leftBrightness;
        leftContrast.value = savedSettings.leftContrast;
        rightBrightness.value = savedSettings.rightBrightness;
        rightContrast.value = savedSettings.rightContrast;
      }

      [leftBrightness, leftContrast, rightBrightness, rightContrast].forEach(input => {
        input.addEventListener('input', updateFilters);
      });
      updateFilters();
    }

    /**
   * Toggles the color of the right eye between green and blue.
   */
    function toggleEyeColor() {
      const current = getComputedStyle(document.documentElement)
        .getPropertyValue('--right-eye-color').trim();
      const next = current === 'lime' ? 'blue' : 'lime';
      document.documentElement.style.setProperty('--right-eye-color', next);
      updateTexts();
    }

    /**
   * Updates the leaderboard with the new score.
   */
    function updateLeaderboard() {
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {
        easy: [],
        medium: [],
        hard: []
      };

      const scores = leaderboard[game.difficulty];
      scores.push(game.score);
      scores.sort((a, b) => b - a);
      leaderboard[game.difficulty] = scores.slice(0, 5);

      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
      displayLeaderboard();
    }

    /**
   * Displays the leaderboard.
   */
    function displayLeaderboard() {
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {
        easy: [],
        medium: [],
        hard: []
      };

      leaderboardEasy.querySelector('ol').innerHTML = leaderboard.easy.map(score => `<li>${score}</li>`).join('');
      leaderboardMedium.querySelector('ol').innerHTML = leaderboard.medium.map(score => `<li>${score}</li>`).join('');
      leaderboardHard.querySelector('ol').innerHTML = leaderboard.hard.map(score => `<li>${score}</li>`).join('');
    }

    // Event Listeners
    difficultySelect.addEventListener('change', () => {
      game.difficulty = difficultySelect.value;
      startGame();
    });
    restartBtn.addEventListener('click', startGame);
    colorToggleBtn.addEventListener('click', toggleEyeColor);
    langToggleBtn?.addEventListener('click', toggleLanguage);


    // Initial setup
    updateTexts();
    initSettings();
    startGame();
    displayLeaderboard();
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getGridSize, shuffle };
}
