function showGame(gameId) {
    document.getElementById('game-roulette').style.display = 'none';
    document.getElementById('game-ladder').style.display = 'none';
    
    if (gameId === 'ladder') {
        resetLadderGame();
    }

    document.getElementById('game-' + gameId).style.display = 'block';
}
