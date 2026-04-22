# Changelog

## [0.1.0] - 2026-04-15

### Added
- **Clues Phase System**: New game phase where each player gives a one-word clue about the hidden character
  - Turn-based submission system with sequential player turns
  - Clue history display showing all submitted clues
  - Automatic advancement to next player turn
  
- **Voting Phase Enhancements**: 
  - Real-time vote counting display for each player
  - 30-second voting timer with countdown display
  - Automatic game continuation or termination after voting completes
  
- **Multi-Round Support**:
  - Player elimination system after voting rounds
  - Automatic roun d transitions (clues → voting → clues or game over)
  - Round number tracking and display
  
- **Game Over System**:
  - New `game-over` component showing voting results
  - Impostor reveal display
  - Character display (if character team won)
  - Win/loss indicators for each player
  - Restart game and return home options (host can restart)
  
- **New Service Methods** (GameService):
  - `getActivePlayers()`: Get non-eliminated players
  - `getEliminatedPlayers()`: Get eliminated players
  - `getVoteWinner()`: Get most-voted player
  - `eliminatePlayer()`: Mark player as eliminated
  - `isGameOver()`: Check if game ended
  - `determineWinner()`: Get winning role (character or impostor)
  - `processVotingRound()`: Handle voting results and transitions
  - `getRoomData()`: Helper to fetch room data
  
- **Comprehensive Unit Tests** (7 new test suites, 48 total):
  - Tests for player elimination
  - Tests for active/eliminated player filtering
  - Tests for vote winner determination
  - Tests for game over conditions
  - Tests for winner determination logic

### Modified
- **voting.component.ts**: 
  - Added real-time vote display methods
  - Enhanced timer logic with vote counting
  - Integration with new game-over flow
  
- **game.types.ts**:
  - Added `eliminated` field to Player interface
  - Added `roundNumber`, `lastEliminatedId`, `winnerRole` to GameRoom
  
- **game.service.ts**:
  - Updated `finishVoting()` to use new voting round processing
  - Integrated elimination and round continuation logic

### Fixed
- Accessibility of `votingExpired` property in voting template
- Private property visibility for template bindings

### Technical
- Node.js v22.22.2 required (Angular CLI compatibility)
- TypeScript strict mode enabled
- All compilation warnings resolved
- Firebase Realtime Database integration stable

---

## [0.0.1] - 2026-04-13

### Initial Release
- Basic game creation and joining with unique room codes
- Player management (add/remove from rooms)
- Role assignment (1 impostor, N-1 character roles)
- Character assignment and display
- Basic voting system
- Firebase Realtime Database integration
