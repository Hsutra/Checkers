let SIZE = document.documentElement.clientHeight*0.9;
if (SIZE>750) SIZE = 750;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
    .test(navigator.userAgent)) {

    SIZE = document.documentElement.clientWidth*0.9;
}



let checkerBoard = {
    cells : [],
    blackFigureCells : [],
    whiteFigureCells : []
};

let buffer = [];

let _listeners = [];

EventTarget.prototype.addEventListenerBase = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener)
{
    _listeners.push({target: this, type: type, listener: listener});
    this.addEventListenerBase(type, listener);
};

EventTarget.prototype.removeEventListeners = function(targetType)
{
    for(let index = 0; index != _listeners.length; index++)
    {
        let item = _listeners[index];

        let target = item.target;
        let type = item.type;
        let listener = item.listener;

        if(target == this && type == targetType)
        {
            this.removeEventListener(type, listener);
        }
    }
}

function drawBoard() {
    let board = document.getElementsByClassName("board")[0];
    board.style.width = SIZE + 'px';
    board.style.height = SIZE + 'px';
    board.style.border = 'solid ' + SIZE/50 + 'px #3d271d';
    for (let i=0;i<8;i++) {
        checkerBoard.cells.push([]);
        for (let j=0;j<8;j++) {
            let cell = document.createElement("div");
            cell.className = 'cell';
            cell.style.width = SIZE/8 + 'px';
            cell.style.height = SIZE/8 + 'px';
            cell.setAttribute('i',i);
            cell.setAttribute('j',j);
            cell.i=i;
            cell.j=j;
            cell.buffer=[];
            cell.type=0;
            checkerBoard.cells[i].push(cell);
            board.appendChild(cell);
            if (i%2==0) {
                if (j%2!=0) {
                    cell.style.backgroundColor = '#4b2f23';
                    cell.type = 1;

                    if (i<3) checkerBoard.blackFigureCells.push(cell);
                    if (i>4) checkerBoard.whiteFigureCells.push(cell);
                }
            }
            else if (j%2==0) {
                cell.style.backgroundColor = '#4b2f23';
                cell.type = 1;

                if (i<3) checkerBoard.blackFigureCells.push(cell);
                if (i>4) checkerBoard.whiteFigureCells.push(cell);
            }
        }
    }
    console.log(checkerBoard);
}

function drawStartFigures() {
    checkerBoard.blackFigureCells.forEach((el)=>{
        let figure = document.createElement("div");
        figure.className = 'black';
        el.appendChild(figure);
        el.figure = figure;
        el.figureColor='black';
        figure.style.width = SIZE/12.5 + 'px';
        figure.style.height = SIZE/12.5 + 'px';
    });

    checkerBoard.whiteFigureCells.forEach((el)=>{
        let figure = document.createElement("div");
        figure.className = 'white';
        el.appendChild(figure);
        el.figure = figure;
        el.figureColor='white';
        figure.style.width = SIZE/12.5 + 'px';
        figure.style.height = SIZE/12.5 + 'px';
    });
}

function makeWhiteBig() {
    checkerBoard.blackFigureCells.forEach((cell)=>{
        cell.figure.style.scale = '1';
        cell.figure.style.boxShadow = '';
    });

    checkerBoard.whiteFigureCells.forEach((cell)=>{
        cell.figure.style.scale = '1.1';
        cell.figure.style.boxShadow = '0px 10px 20px 2px rgba(0, 0, 0, 0.25)';
    });
}

function makeBlackBig() {
    checkerBoard.whiteFigureCells.forEach((cell)=>{
        cell.figure.style.scale = '1';
        cell.figure.style.boxShadow = '';
    });

    checkerBoard.blackFigureCells.forEach((cell)=>{
        cell.figure.style.scale = '1.1';
        cell.figure.style.boxShadow = '0px 10px 20px 2px rgba(0, 0, 0, 0.25)';
    });
}

function drawWhiteFigures() {
    checkerBoard.whiteFigureCells = [];
    for(let i=0;i<checkerBoard.cells[0].length;i++) {
        for (let j = 0; j < checkerBoard.cells[0].length; j++) {
            checkerBoard.cells[i][j].buffer=[];
            if (checkerBoard.cells[i][j].figureColor =='white' || checkerBoard.cells[i][j].figureColor =='white queen') {
                checkerBoard.whiteFigureCells.push(checkerBoard.cells[i][j]);
            }
        }
    }
}

function drawBlackFigures() {
    checkerBoard.blackFigureCells = [];
    for(let i=0;i<checkerBoard.cells[0].length;i++) {
        for (let j = 0; j < checkerBoard.cells[0].length; j++) {
            checkerBoard.cells[i][j].buffer=[];
            if (checkerBoard.cells[i][j].figureColor =='black' || checkerBoard.cells[i][j].figureColor =='black queen') {
                checkerBoard.blackFigureCells.push(checkerBoard.cells[i][j]);
            }
        }
    }
}

function findCellsBetween(startX, startY, endX, endY) {
    const cells = [];

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const xDirection = deltaX > 0 ? 1 : -1;
    const yDirection = deltaY > 0 ? 1 : -1;

    for (let x = startX + xDirection, y = startY + yDirection; x !== endX; x += xDirection, y += yDirection) {
        cells.push(checkerBoard.cells[x][y]);
    }
    
    return cells;
}

function winCheck(){
    if (checkerBoard.whiteFigureCells.length==0) {
        alert('Black Win');
        location.reload();
        return true;
    }
    if (checkerBoard.blackFigureCells.length==0) {
        alert('White Win');
        location.reload();
        return true;
    }
    return false;
}


function whiteTurn() {
    makeWhiteBig();

    if (winCheck()) return;

    let board=[];
    for (let i=0;i<8;i++) {
        board.push([]);
        for (let j=0;j<8;j++) {
            if (checkerBoard.cells[i][j].children.length>0) board[i].push(checkerBoard.cells[i][j].figureColor);
            else {
                if (checkerBoard.cells[i][j].type==1) board[i].push(1);
                else board[i].push(0);
            }
        }
    }

    // Отправляем данные на сервер
    fetch("/startGame.py", {
        method: "POST",
        body: JSON.stringify({ data: board }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {

        let chain=false;
        let dead=[];

        function whiteChainKill() {
            for (let i=0;i<8;i++){
                for (let j=0;j<8;j++){
                    
                    if (checkerBoard.cells[i][j].children.length==1) {

                        if ((checkerBoard.cells[i][j].figureColor=='white' || checkerBoard.cells[i][j].figureColor=='white queen') 
                        && (data.board[i][j]=="" || data.board[i][j]=="_" || data.board[i][j]=="B" || data.board[i][j]=="BQ")) {
                            data.comp_moves.unshift(`(${j+1},${i+1})`);
                        }
                    
                        if ((checkerBoard.cells[i][j].figureColor=='black' || checkerBoard.cells[i][j].figureColor=='black queen') 
                        && (data.board[i][j]=="" || data.board[i][j]=="_")) {
                            dead.push(checkerBoard.cells[i][j]);
                        }
                    }
                }
            }

        }

        function whiteTurnResponse() {

            if (winCheck()) return;

            let oldCell = checkerBoard.cells[data.comp_moves[0][3]-1][data.comp_moves[0][1]-1];
            let figure = oldCell.figure;
            let newCell = checkerBoard.cells[data.comp_moves[1][3]-1][data.comp_moves[1][1]-1];

            if (oldCell.children.length==0) {
                data.comp_moves.shift();
                whiteChainKill();
                chain = true;
                whiteTurnResponse();
                return;
            }
                
            setTimeout(() => {
                newCell.appendChild(figure);
                newCell.figure = figure;
                newCell.figureColor = oldCell.figureColor;
                if (newCell.i==0) {
                    newCell.figureColor = 'white queen';
                    newCell.figure.style.border = SIZE/250+'px solid red';
                }
                delete oldCell.figure;
                delete oldCell.figureColor;
                drawWhiteFigures();
                if (chain==false) dead = findCellsBetween(oldCell.i,oldCell.j,newCell.i,newCell.j)
                dead.forEach((el)=>{
                    el.removeChild(el.firstChild);
                    delete el.figure;
                    delete el.figureColor;
                    el.buffer = [];
                });
                drawBlackFigures();

                console.log(data);

                blackTurn(data.pos_moves);

            }, 500);
        }

        whiteTurnResponse();
    });
}

function blackTurn(pos_moves) {
    makeBlackBig();

    if (winCheck()) return;
    if (pos_moves.length==0) {
        alert('White Win');
        location.reload();
        return;
    }

    pos_moves.forEach((move)=>{
        let cell = checkerBoard.cells[move[0][3]-1][move[0][1]-1];
        cell.buffer.push(checkerBoard.cells[move[1][3]-1][move[1][1]-1]);

        function setColor(){
            cell.style.backgroundColor = "green";
    
        }
        function unsetColor(){
            cell.style.backgroundColor = "#4b2f23";
        }

        cell.addEventListener('mouseover',setColor);
        cell.addEventListener('mouseout',unsetColor);

        cell.addEventListener('click',()=>{
            cell.style.backgroundColor = 'green';
            cell.removeEventListener('mouseover',setColor);
            cell.removeEventListener('mouseout',unsetColor);

            checkerBoard.blackFigureCells.forEach((cell)=>{
                cell.removeEventListeners('mouseover');
                cell.removeEventListeners('click');
                cell.removeEventListeners('mouseout');
            });

            cell.buffer.forEach((buff)=>{
                function setBuffColor(){
                    buff.style.backgroundColor = "green";
                }
                function unsetBuffColor(){
                    buff.style.backgroundColor = "#4b2f23";
                }
    
                buff.addEventListener('mouseover',setBuffColor);
                buff.addEventListener('mouseout',unsetBuffColor);
    
                buff.addEventListener('click',()=>{
                    cell.style.backgroundColor = '#4b2f23';
                    buff.style.backgroundColor = '#4b2f23';
    
                    cell.buffer.forEach((buff)=>{
                        buff.removeEventListeners('mouseover');
                        buff.removeEventListeners('click');
                        cell.removeEventListeners('mouseout');
                    });
    
                    buff.append(...cell.childNodes);
                    buff.figure = cell.figure;
                    buff.figureColor=cell.figureColor;

                    delete cell.figure;
                    delete cell.figureColor;

                    drawBlackFigures();

                    if (buff.i==7) {
                        buff.figureColor = 'black queen';
                        buff.figure.style.border = SIZE/250+'px solid red';
                    }

                    let dead = findCellsBetween(cell.i,cell.j,buff.i,buff.j)
                    dead.forEach((el)=>{
                        el.removeChild(el.firstChild);
                        delete el.figure;
                        delete el.figureColor;
                        el.buffer = [];
                    });

                    drawWhiteFigures();

                    if (move.length>2) {
                        move.shift();
                        move.shift();
                        blackTurn([move]);
                    }
                    else whiteTurn();
                });
            });
        });
    });
    
}

function main() {
    drawBoard();
    drawStartFigures();

    function startGame(){
        document.body.removeEventListener('click',startGame);
        document.getElementsByTagName('p')[0].innerHTML="";
        whiteTurn();
    }

    document.body.addEventListener('click',startGame);
}