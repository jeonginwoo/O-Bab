const ladderCanvas = document.getElementById('ladder-canvas');
const ladderCtx = ladderCanvas.getContext('2d');
let ladderData = [];
let names = []; // Will hold start points: '커피'
let results = []; // Will hold destinations: Player names
let numPlayers = 0;

document.getElementById('ladder-height').addEventListener('input', function() {
    document.getElementById('ladder-height-value').textContent = this.value;
    rebuildLadder();
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomizeStartAndEnd() {
    // Shuffle player names at the bottom
    shuffleArray(results);
    
    // Generate start points randomly
    names = new Array(numPlayers).fill('');
    const coffeeIndex = Math.floor(Math.random() * numPlayers);
    names[coffeeIndex] = '커피';
}

function startLadderGame() {
    const playersInput = document.getElementById('ladder-players').value;
    const players = playersInput.split(',').map(s => s.trim()).filter(Boolean);
    numPlayers = players.length;

    if (numPlayers < 2) {
        alert('이름을 2명 이상 입력해주세요.');
        return;
    }

    results = players;
    randomizeStartAndEnd();
    
    document.getElementById('start-ladder-btn').style.display = 'none';
    document.getElementById('retry-ladder-btn').style.display = 'inline-block';
    document.getElementById('trace-ladder-btn').style.display = 'inline-block';
    document.getElementById('ladder-controls').style.display = 'block';

    drawLadder();
}

function resetLadderGame() {
    ladderCtx.clearRect(0, 0, ladderCanvas.width, ladderCanvas.height);
    document.getElementById('ladder-players').value = '';
    document.getElementById('start-ladder-btn').style.display = 'inline-block';
    document.getElementById('retry-ladder-btn').style.display = 'none';
    document.getElementById('trace-ladder-btn').style.display = 'none';
    document.getElementById('ladder-controls').style.display = 'none';
    ladderData = [];
    names = [];
    results = [];
    numPlayers = 0;
}

function retryLadder() {
    randomizeStartAndEnd();
    drawLadder();
    document.getElementById('trace-ladder-btn').style.display = 'inline-block';
}

function drawLadder() {
    const width = 500;
    const height = parseInt(document.getElementById('ladder-height').value);
    ladderCanvas.width = width;
    ladderCanvas.height = height;
    const step = width / (numPlayers + 1);
    const minRungGap = 30; // Minimum vertical gap between rungs
    const rungCount = Math.floor((height - 70) / 50); // Adjust rung count based on height
    const segmentHeight = (height - 70) / rungCount;
    ladderData = [];

    ladderCtx.clearRect(0, 0, width, height);
    ladderCtx.lineWidth = 2;
    ladderCtx.font = '14px Pretendard';
    ladderCtx.textAlign = 'center';

    for (let i = 0; i < numPlayers; i++) {
        const x = step * (i + 1);
        // Draw start points at the top
        ladderCtx.fillText(names[i], x, 20);
        ladderCtx.beginPath();
        ladderCtx.moveTo(x, 30);
        ladderCtx.lineTo(x, height - 30);
        ladderCtx.stroke();
        // Draw player names at the bottom
        ladderCtx.fillText(results[i], x, height - 10);
    }

    for (let i = 0; i < numPlayers - 1; i++) {
        const rungs = [];
        for (let j = 0; j < rungCount; j++) {
            const x1 = step * (i + 1);
            const x2 = step * (i + 2);
            let y;
            let attempts = 0;
            do {
                // Place rung in its own segment
                y = 40 + (segmentHeight * j) + (Math.random() * segmentHeight * 0.8) + (segmentHeight * 0.1);
                attempts++;
            } while (
                (rungs.some(r => Math.abs(r.y - y) < minRungGap) ||
                (i > 0 && ladderData[i-1].some(r => Math.abs(r.y - y) < minRungGap))) &&
                attempts < 50
            );
            
            rungs.push({y, x1, x2});
            ladderCtx.beginPath();
            ladderCtx.moveTo(x1, y);
            ladderCtx.lineTo(x2, y);
            ladderCtx.stroke();
        }
        ladderData.push(rungs.sort((a,b) => a.y - b.y));
    }
}

function traceAllPaths() {
    document.getElementById('trace-ladder-btn').style.display = 'none';
    document.getElementById('retry-ladder-btn').style.display = 'none';
    const coffeeIndex = names.indexOf('커피');

    if (coffeeIndex !== -1) {
        const { path, finalLane } = tracePath(coffeeIndex);
        animatePath(path, coffeeIndex);
    }
}

function tracePath(playerIndex) {
    const path = [];
    const width = ladderCanvas.width;
    const height = ladderCanvas.height;
    const step = width / (numPlayers + 1);
    let currentX = step * (playerIndex + 1);
    let currentY = 30;
    let currentLane = playerIndex;

    path.push({x: currentX, y: currentY});

    while(currentY < height - 30) {
        let nextRung = null;

        // Find the next available rung to the right
        if (currentLane < numPlayers - 1) {
            for (const rung of ladderData[currentLane]) {
                if (rung.y > currentY) {
                    nextRung = { ...rung, direction: 'right' };
                    break;
                }
            }
        }

        // Find the next available rung to the left and check if it's closer
        if (currentLane > 0) {
            for (const rung of ladderData[currentLane - 1]) {
                if (rung.y > currentY) {
                    if (!nextRung || rung.y < nextRung.y) {
                        nextRung = { ...rung, direction: 'left' };
                    }
                    break;
                }
            }
        }

        if (nextRung) {
            path.push({ x: currentX, y: nextRung.y });
            currentY = nextRung.y;

            if (nextRung.direction === 'right') {
                currentX = nextRung.x2;
                currentLane++;
            } else {
                currentX = nextRung.x1;
                currentLane--;
            }
            path.push({ x: currentX, y: currentY });
        } else {
            // No more rungs for this path, go straight to the bottom
            currentY = height - 30;
            path.push({ x: currentX, y: currentY });
        }
    }
    return { path, finalLane: currentLane };
}

function animatePath(path, index) {
    let i = 0;
    const pathColor = 'red';
    function draw() {
        if (i < path.length - 1) {
            ladderCtx.save();
            ladderCtx.beginPath();
            ladderCtx.moveTo(path[i].x, path[i].y);
            ladderCtx.lineTo(path[i+1].x, path[i+1].y);
            ladderCtx.strokeStyle = pathColor;
            ladderCtx.lineWidth = 3;
            ladderCtx.stroke();
            ladderCtx.restore();
            i++;
            setTimeout(draw, 250);
        } else {
            // Animation complete, re-enable retry button
            document.getElementById('retry-ladder-btn').style.display = 'inline-block';
        }
    }
    draw();
}
