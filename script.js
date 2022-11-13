const Player = (sign, player_type) => {
    function getSign() {
        return sign;
    }

    function getType() {
        return player_type;
    }

    return {sign, player_type, getSign, getType};
};

displayController.gameFlow();

const gameBoard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];

    const setField = (index, sign) => {
        if (index > board.length) return;
        board[index] = sign;
    }

    const getField = (index) => {
        if (index > board.length) return;
        return board[index];
    }

    const reset = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = "";
        }
    }

    return {
        setField, getField, reset
    }
})();

const displayController = (() => {
    const fieldElements = document.querySelectorAll(".field");
    const messageElement = document.getElementById("message-box");
    const restartButton = document.getElementById("restart-btn");
    const settingsButton = document.getElementById("settings-btn");
    const closeButton = document.getElementById("close-btn");
    const startButton = document.getElementById("start-btn");
    const selectForms = document.querySelectorAll(".select");

    selectForms.forEach((select) => {
        select.addEventListener("change", () => {
            gameController.createPlayers();
        });
    });

    restartButton.addEventListener("click", (e) => {
        gameBoard.reset();
        gameController.reset();
        updateGameboard();
        setMessageElement("Player X's turn");
        openModalForm();
    });
    
    startButton.addEventListener("click", () => {
        gameBoard.reset();
        gameController.reset();
        updateGameboard();
        setMessageElement("Player X's turn");
        closeModalForm();
        gameController.createPlayers();
    });

    settingsButton.addEventListener("click", () => {
        openModalForm();
    });

    closeButton.addEventListener("click", () => {
        closeModalForm();
        gameController.createPlayers();
    });

    const gameFlow = () => {
        if (gameController.getCurrentPlayer().getType() == "Person"){
            fieldElements.forEach((field) => {
                field.addEventListener("click", (e) => {
                    if (gameController.getIsOver() || e.target.textContent !== "") return;
                    gameController.playRound(parseInt(e.target.dataset.index));
                    updateGameboard();
                });
            });          
        }

        else {
            gameController.playRound();
            updateGameboard();
        }
    }

    const updateGameboard = () => {
        for (let i = 0; i < fieldElements.length; i++) {
            fieldElements[i].textContent = gameBoard.getField(i);
          }
    }

    const setResultMessage = (winner) => {
        if (winner === "Draw") {
            setMessageElement("It's a draw!");
        } 
        else {
            setMessageElement(`Player ${winner} has won!`);
        }
    }
    
    const setMessageElement = (message) => {
        messageElement.textContent = message; 
    }

    const openModalForm = () => {
        document.getElementById("modalForm").style.display = "flex";
    }

    const closeModalForm = () => {
        document.getElementById("modalForm").style.display = "none";
    }

    return {
        setResultMessage,
        setMessageElement,
        gameFlow
    }
})();

const gameController = (() => {
    let playerX;
    let playerO;
    let currentPlayer;
    // let players = [playerX, playerO];
    let AIfieldindex;
    let round = 1;
    let isOver = false;

    const selectForms = document.querySelectorAll(".select");

    const createPlayers = () => {
        playerX = Player("X", selectForms[0].value);
        playerO = Player("O", selectForms[1].value);
        return playerX, playerO;
    }

    const playRound = (fieldIndex) => {
        currentPlayer = round % 2 === 1 ? playerX.getType() : playerO.getType();
        
        if (currentPlayer === "Person") {
            gameBoard.setField(fieldIndex, getCurrentPlayerSign());
        }

        else {
            gameBoard.setField(AIplay(), getCurrentPlayerSign());
        }

        if (checkWinner(fieldIndex)) {
            displayController.setResultMessage(getCurrentPlayerSign());
            isOver = true;
            return;
        }

        if (round === 9) {
            displayController.setResultMessage("Draw");
            isOver = true;
            return;
        }

        round++
        displayController.setMessageElement(
            `Player ${getCurrentPlayerSign()}'s turn`
        );
    }

    const AIplay = () => {
        while (true) {
            AIfieldindex = Math.floor(Math.random()* 9);
            if (gameBoard.getField(AIfieldindex) == "") {
                break;
            }
        }
        return AIfieldindex;
    }

    const getCurrentPlayerSign = () => {
        return round % 2 === 1 ? playerX.getSign() : playerO.getSign();
    }

    const getCurrentPlayer = () => {
        return round % 2 === 1 ? playerX : playerO;
    }

    const checkWinner = (fieldIndex) => {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        return winConditions
        .filter((combination) => combination.includes(fieldIndex))
        .some((possibleCombination) =>
          possibleCombination.every(
            (index) => gameBoard.getField(index) === getCurrentPlayerSign()
          )
        );
    }

    const getIsOver = () => {
        return isOver;
    }; 

    const reset = () => {
        round = 1;
        isOver = false;
    };

    return {
        getIsOver, playRound, reset, createPlayers, AIplay, getCurrentPlayer
    }
})();

window.onclick = function(event) {
    if (event.target == document.getElementById("modalForm")) {
        document.getElementById("modalForm").style.display = "none";
    }
}