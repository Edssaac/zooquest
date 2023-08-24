const gameConfig = {
    guessed: false,
    animal: [],
    categories: {
        1: "kingdom",
        2: "phylum",
        3: "class",
        4: "order",
        5: "family",
        6: "genus",
        7: "specie"
    },
    currentHint: 1,
    hints: {
        1: "Reino",
        2: "Filo",
        3: "Classe",
        4: "Ordem",
        5: "Família",
        6: "Gênero",
        7: "Espécie"
    },
    currentScore: 100,
    totalScore: 0
}

const updateScore = () => {
    const current = document.querySelector("#score #current small");
    const total = document.querySelector("#score #total small");


    current.innerText = gameConfig.currentScore;
    total.innerText = gameConfig.totalScore;
}

const changeImage = () => { 
    const img = document.querySelector(".img-riddle");
    const specie = gameConfig.animal.specie.replaceAll(' ', '_');

    img.src = `source/assets/images/animals/${specie}.jpg`;
}

const modalManager = new bootstrap.Modal('#modalHints');
const showHint = document.getElementById("show-hint");
showHint.addEventListener("click", () => {
    gameConfig.currentHint++;
    gameConfig.currentScore -= 10;

    const button = document.querySelector(`[data-hint="${gameConfig.currentHint}"]`);
    button.classList.remove("btn-primary");
    button.classList.add("btn-danger");
    button.classList.add("disabled");
    button.innerHTML = "";

    const small = document.createElement("small");
    small.classList.add("text-warning");
    small.innerText = gameConfig.hints[gameConfig.currentHint];

    const p = document.createElement("p");
    p.innerText = gameConfig.animal[gameConfig.categories[gameConfig.currentHint]];

    button.append(small);
    button.append(p);

    updateScore();

    modalManager.hide();
});

const modalHints = document.getElementById("modalHints");
modalHints.addEventListener("show.bs.modal", event => {
    const button = event.relatedTarget

    const hint = button.getAttribute("data-hint");

    const recipient = gameConfig.hints[hint];

    const modalTitle = modalHints.querySelector(".modal-title");

    const modalBody = modalHints.querySelector(".modal-body");

    modalBody.innerHTML = "";
    showHint.classList.add("disabled");

    if (gameConfig.currentHint < (hint - 1)) {
        var small = document.createElement("small");
        small.innerText = "Desbloqueie as dicas anteriores para poder consultar!";
        small.classList.add("text-danger");

        modalBody.append(small);
    } else {
        var p = document.createElement("p");
        p.innerText = "Tem certeza de que deseja desbloquear essa dica?";

        modalBody.append(p);
        showHint.classList.remove("disabled");
    }

    modalTitle.textContent = `Quer saber qual é a dica de ${recipient}?`;
})

const guess = document.getElementById("guess");
const guesses = document.getElementById("guesses");
const validateGuess = () => {
    if (guess.value) {
        const div = document.createElement("div");
        const guessedAnimal = guess.value.toLowerCase().trim();
        const rightAnimal = gameConfig.animal.name.toLowerCase();

        div.innerHTML = `${guess.value} <br> ${levenshteinDistance(guessedAnimal, rightAnimal).toFixed(2)}%`;

        if (guessedAnimal == rightAnimal) {
            div.classList.add("alert", "alert-success", "valid-guess");

            gameConfig.guessed = true;
            gameConfig.totalScore = parseInt(gameConfig.totalScore) + parseInt(gameConfig.currentScore);

            changeImage();

            window.scrollTo({top: 0, behavior: 'smooth'});
        } else {
            div.classList.add("alert", "alert-warning", "invalid-guess");

            gameConfig.currentScore--;
        }

        guess.value = "";
        guesses.prepend(div);

        updateScore();

        if (gameConfig.guessed) {
            document.getElementById("input-controll").innerHTML = "";
            localStorage.setItem("totalScore", gameConfig.totalScore);
        }
    }
}

const guessButton = document.getElementById("try-guess");
guessButton.addEventListener("click", () => {
    validateGuess();
});

guess.addEventListener("keyup", ({ key }) => {
    if (key === "Enter") {
        validateGuess();
    }
});

const getOneRandomAnimal = (animals) => {
    const shuffleIndex = Math.floor(Math.random() * animals.length);

    return animals[shuffleIndex];
}

const loadAnimals = async () => {
    return fetch('source/assets/json/animals.json')
        .then((response) => response.json())
        .then((animals) => animals)
        .catch(() => []);
}

const start = () => {
    window.onload = async () => {
        const animals = await loadAnimals();
        const totalScore = localStorage.getItem("totalScore");

        if (totalScore === null) {
            localStorage.setItem("totalScore", 0);
        }

        gameConfig.animal = getOneRandomAnimal(animals);
        gameConfig.totalScore = totalScore;

        updateScore();

        console.log(gameConfig.animal);
    }
}

start();

function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    const dp = new Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1
                );
            }
        }
    }

    const maxLen = Math.max(m, n);
    const similarityPercentage = ((maxLen - dp[m][n]) / maxLen) * 100;

    return similarityPercentage;
}