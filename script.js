const Player = (sign, player_type) => {
    function getSign() {
        return sign;
    }

    function getType() {
        return player_type;
    }

    return {getSign, getType};
};

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
    const messageElement = document.getElementById("message-box");
    const restartButton = document.getElementById("restart-btn");
    const settingsButton = document.getElementById("settings-btn");
    const closeButton = document.getElementById("close-btn");
    const startButton = document.getElementById("start-btn");
    const selectForms = document.querySelectorAll(".select");
    const fieldElements = document.querySelectorAll(".field");
    const fieldsignElements = document.querySelectorAll(".field-sign");

    let isCreated = false;

    selectForms.forEach((select) => {
        select.addEventListener("change", () => {
            gameController.createPlayers();
            isCreated = true;
        });
    });

    fieldElements.forEach((field) => {
        field.addEventListener("click", (e) => {
            if (!gameController.getIsOver() || e.target.textContent !== "") return;
            gameController.gameFlow(parseInt(e.target.dataset.index));
            updateGameboard();
        });
    });


    restartButton.addEventListener("click", (e) => {
        gameBoard.reset();
        gameController.reset();
        setTimeout(updateGameboard, 200);
        setMessageElement("Player X's turn", "turn");
        isCreated = true;
        if (selectForms[0].value != "Person") {
            gameController.gameFlow();
            updateGameboard()
        }
    });

    startButton.addEventListener("click", () => {
        gameBoard.reset();
        gameController.reset();
        updateGameboard();
        setMessageElement("Player X's turn", "turn");
        gameController.createPlayers();
        isCreated = true;
        closeModalForm();
        if (selectForms[0].value != "Person" && isCreated) {
            gameController.gameFlow();
            updateGameboard()
        }
    });

    settingsButton.addEventListener("click", () => {
        openModalForm();
    });

    window.onclick = function (event) {
        if (event.target == document.getElementById("modalForm")) {
            closeModalForm();
        }
    }

    closeButton.addEventListener("click", () => {
        gameController.createPlayers();
        isCreated = true;
        closeModalForm();
    });

    const updateGameboard = () => {
        for (let i = 0; i < fieldElements.length; i++) {
            fieldsignElements[i].textContent = gameBoard.getField(i);
        }
    }

    const animateSign = (index, type) => {
        if (type == "AI") {
            fieldsignElements[index].animate([
                { transform: 'scale(0)' },
                { transform: 'scale(0)' },
                { transform: 'scale(0)' },
                { transform: 'scale(0.8)' },
                { transform: 'scale(1.4)'},
                { transform: 'scale(1)'}
            ], {
                duration:300 + Math.random()*250,
            })
            return
        }
        else if (type == "Person") {
            fieldsignElements[index].animate([
                { transform: 'scale(0)' },
                { transform: 'scale(0.8)' },
                { transform: 'scale(1.4)'},
                { transform: 'scale(1)'}
            ], {
                duration:250,
            })
            return
        }

        else if (type == "reset") {
            fieldsignElements.forEach((element) => {
                element.animate([
                    { transform: 'scale(0.9)'},
                    { transform: 'scale(0.7)'},
                    { transform: 'scale(0.4)'},
                    { transform: 'scale(0)'}
                ], {
                    duration:250,
                })
            })
        }
    }

    const setResultMessage = (winner) => {
        if (winner === "Draw") {
            setMessageElement("It's a draw!", "result");
        }
        else {
            setMessageElement(`Player ${winner} has won!`, "result");
        }
    }

    const setMessageElement = (message, type) => {
        if (type == "turn" && (selectForms[0].value != "Person" || selectForms[1].value != "Person")) {
            messageElement.textContent = "";
        }
        else {
            messageElement.textContent = message;
        }

    }

    const openModalForm = () => {
        document.getElementById("modalForm").style.display = "flex";
    }

    const closeModalForm = () => {
        checkPerson();
        if (isCreated) {
            document.getElementById("modalForm").style.display = "none";
        }
    }

    const checkPerson = () => {
        if ((selectForms[0].value != "Person" && selectForms[1].value != "Person")) {
            document.getElementById("notification-panel").style.display = "block";
            document.getElementById("close-btn").classList.add('unactive-btn');
            document.getElementById("start-btn").classList.add('unactive-btn');
            return isCreated = false;
        }
        else {
            document.getElementById("notification-panel").style.display = "none";
            document.getElementById("close-btn").classList.remove('unactive-btn');
            document.getElementById("start-btn").classList.remove('unactive-btn');
        }
    }

    return {
        setResultMessage,
        setMessageElement,
        checkPerson,
        animateSign
    }
})();

const gameController = (() => {
    let playerX;
    let playerO;
    let currentPlayer;
    let nextPlayer;
    let AIfieldindex;
    let round = 1;
    let isNotOver = true;

    const selectForms = document.querySelectorAll(".select");

    const createPlayers = () => {
        playerX = Player("X", selectForms[0].value);
        playerO = Player("O", selectForms[1].value);
        displayController.checkPerson();
        return playerX, playerO;
    }

    const gameFlow = (fieldIndex) => {
        currentPlayer = round % 2 === 1 ? playerX.getType() : playerO.getType();
        nextPlayer = round % 2 === 1 ? playerO.getType() : playerX.getType();

        if (round === 1 && currentPlayer != "Person") {
            AIPlay();
            return
        }
        if (currentPlayer == "Person") {
            personPlay(fieldIndex);

            if (round === 9 && playerX.getType() != "Person") {
                AIPlay();
            }

            if (nextPlayer != "Person") {
                if (!getIsOver()) return;
                if (round === 9) {
                    displayController.setResultMessage("Draw");
                    isNotOver = false;
                    return;
                }
                AIPlay();
            }
        }
    }

    const personPlay = (fieldIndex) => {
        gameBoard.setField(fieldIndex, getCurrentPlayerSign());

        if (checkWinner(fieldIndex)) {
            displayController.setResultMessage(getCurrentPlayerSign());
            isNotOver = false;
            return;
        }

        if (round === 9) {
            displayController.setResultMessage("Draw");
            isNotOver = false;
            return;
        }

        round++

        displayController.setMessageElement(
            `Player ${getCurrentPlayerSign()}'s turn`, "turn"
        );

        displayController.animateSign(fieldIndex, "Person");
    }

    const AIPlay = () => {
        while (true) {
            AIfieldindex = Math.floor(Math.random() * 9);
            if (gameBoard.getField(AIfieldindex) == "") {
                break;
            }
        }

        gameBoard.setField(AIfieldindex, getCurrentPlayerSign());

        if (checkWinner(AIfieldindex)) {
            displayController.setResultMessage(getCurrentPlayerSign());
            isNotOver = false;
            return;
        }

        if (round === 9) {
            displayController.setResultMessage("Draw");
            isNotOver = false;
            return;
        }
        round++;
        displayController.animateSign(AIfieldindex, "AI");
    }

    const getCurrentPlayerSign = () => {
        return round % 2 === 1 ? playerX.getSign() : playerO.getSign();
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
        return isNotOver;
    };

    const reset = () => {
        round = 1;
        isNotOver = true;
        displayController.animateSign(0, "reset");
    };

    return {
        getIsOver, reset, createPlayers, gameFlow
    }
})();