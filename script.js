const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const robot = document.getElementById('robot');

// Grid definition
const gridSize = 3;
const cellSize = canvas.width / gridSize;

// Variable for movement history
let movementHistory = [];

// Function to draw a circle
function drawCircle(x, y, radius, color, isSelected = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // Highlighting the selected circle
    if (isSelected) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// Drawing the grid
function drawGrid(grid, positions, selectedRow, selectedCol) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const index = i * gridSize + j;
            const color = grid[index];
            if (color) {
                const { x, y } = positions[index];
                const isSelected = i === selectedRow && j === selectedCol;
                drawCircle(x, y, cellSize / 4, color, isSelected);
            }
        }
    }
}

// Function to generate a random grid
function generateRandomGrid() {
    const colors = ['red', 'green', 'blue'];
    const colorCount = { red: 0, green: 0, blue: 0 };
    const grid = [];

    // Fill the grid with random colors
    for (let i = 0; i < gridSize * gridSize; i++) {
        let color;
        do {
            color = colors[Math.floor(Math.random() * colors.length)];
        } while (colorCount[color] >= 3);
        colorCount[color]++;
        grid.push(color);
    }

    return grid;
}

// Function to initialize circle positions
function initializePositions(grid) {
    const positions = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            positions.push({
                x: j * cellSize + cellSize / 2,
                y: i * cellSize + cellSize / 2,
            });
        }
    }
    return positions;
}

// Function to check if the game is finished
function isGameFinished(grid) {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const color = grid[i * gridSize + j];
            if (i === 0 && color !== 'red') return false; // Top row should be red
            if (i === 1 && color !== 'blue') return false; // Middle row should be blue
            if (i === 2 && color !== 'green') return false; // Bottom row should be green
        }
    }
    return true;
}

// Function to swap two circles in the grid
function swapCircles(grid, from, to) {
    const temp = grid[from];
    grid[from] = grid[to];
    grid[to] = temp;

    drawGrid(grid, positions, selectedRow, selectedCol);

    if (isGameFinished(grid)) {
        alert('Congratulations! You solved the puzzle!');
    }
}

// Function to handle user input
function handleMove(direction) {
    const selectedIndex = selectedRow * gridSize + selectedCol;

    let newRow = selectedRow;
    let newCol = selectedCol;

    if (direction === 'up' && selectedRow > 0) {
        newRow--;
    } else if (direction === 'down' && selectedRow < gridSize - 1) {
        newRow++;
    } else if (direction === 'left' && selectedCol > 0) {
        newCol--;
    } else if (direction === 'right' && selectedCol < gridSize - 1) {
        newCol++;
    }

    const targetIndex = newRow * gridSize + newCol;
    swapCircles(grid, selectedIndex, targetIndex);

    // Log the move in the movement history
    movementHistory.push({
        direction,
        from: { row: selectedRow, col: selectedCol },
        to: { row: newRow, col: newCol },
    });

    // Update the selectedRow and selectedCol to the new position
    selectedRow = newRow;
    selectedCol = newCol;

    // Robot animation
    robot.style.transform = `translate(${(newCol - selectedCol) * 50}px, ${(newRow - selectedRow) * 50}px)`;

    // Redraw the grid with the updated selection
    drawGrid(grid, positions, selectedRow, selectedCol);
}

// Generate and download the CSV file
function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Direction,From Row,From Col,To Row,To Col\n"; // CSV header

    movementHistory.forEach((move) => {
        const row = `${move.direction},${move.from.row},${move.from.col},${move.to.row},${move.to.col}`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "movement_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Generate the initial random grid
let grid = generateRandomGrid();

// Initialize circle positions
let positions = initializePositions(grid);

// Selected circle position
let selectedRow = 0;
let selectedCol = 0;

// Draw the initial grid
drawGrid(grid, positions, selectedRow, selectedCol);

// Event listeners for buttons
document.getElementById('upButton').addEventListener('click', () => handleMove('up'));
document.getElementById('downButton').addEventListener('click', () => handleMove('down'));
document.getElementById('leftButton').addEventListener('click', () => handleMove('left'));
document.getElementById('rightButton').addEventListener('click', () => handleMove('right'));

// Download button
document.getElementById('downloadButton').addEventListener('click', downloadCSV);

// Canvas clicks to select a circle
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    selectedCol = Math.floor(x / cellSize);
    selectedRow = Math.floor(y / cellSize);

    console.log(`Selected circle at row ${selectedRow}, col ${selectedCol}`);
    drawGrid(grid, positions, selectedRow, selectedCol);
});