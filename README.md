# Therapy Memory Card Game

This is a browser-based therapeutic memory card game designed for dichoptic treatment of diplopia or amblyopia using red-green anaglyph glasses. Each pair of cards consists of one full symbol in red visible to the left eye and one full symbol in green visible to the right eye, requiring binocular coordination to match pairs.

## How to Play

1. Select a difficulty level (Easy: 4×4 grid, Medium: 8×8 grid, Hard: 12×12 grid).
2. Wear red-green anaglyph glasses (red lens on left eye, green lens on right eye).
3. Click on a card to flip it and reveal the full symbol in red or green.
4. Click another card to find the matching symbol.
5. Use both eyes to locate matching pairs of red and green symbols.
6. Match all pairs as quickly as possible.

## Controls

- **Brightness & Contrast**: Adjust the sliders to balance visibility between both eyes.
- **Moves & Time**: The game tracks the number of moves and elapsed time. Try to improve your score.
- **Difficulty**: Choose the grid size to adjust game complexity (Easy: 4×4, Medium: 8×8, Hard: 12×12).

## Requirements

This game implements dichoptic therapy principles based on the [Requirements Document](requiermet_documentatin.md):

- Separate images to each eye via red-green glasses.
- Engaging game mechanics for binocular coordination.
- Adjustable contrast and brightness for each eye.

## Technology Stack

- HTML5, CSS3, JavaScript (ES6+)
- No external dependencies; works offline after initial load.

## Running Tests

1. Install dependencies with `npm install`.
2. Run `npm test` to execute the Jest test suite.

## License

This project is provided for therapeutic and educational purposes.