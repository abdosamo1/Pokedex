const PodexCards = document.getElementById('PodexCards');
const loadMoreButton = document.getElementById('load-more-button');
const loadingSpinner = document.getElementById('loading-spinner');
const body = document.getElementById('body')
const pokemonSearchInput = document.getElementById('pokemon-search-input');
const searchHintMessage = document.getElementById('search-hint-message');
let allPokemonNames = [];
const overlay = document.getElementById('overlay');
let currentOverlayPokemonId = null;
const currentActivePokemonList = [];
let currentOverlayPokemonIndex = -1;
const overlayContent = document.getElementById('selectedCard');
const prevButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');

let offset = 0;
const limit = 20;

async function renderCards() {

    enableSpinner();
    await createPokemonList();
    disableSpinner();
}

async function createPokemonList(){
    try {
        const result = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const pokemonList = await result.json();
        const pokemonUrls = pokemonList.results.map(pokemon => pokemon.url);

        for (const url of pokemonUrls) {
            await createPokemonCard(url);
        }

        offset += limit;

    } catch (error) {
        console.error('Fehler beim Laden der Pokémon-Liste:', error);
    }
}

async function createPokemonCard(pokemonUrl) {
    try {
        const response = await fetch(pokemonUrl);

        const pokemonData = await response.json();

        PodexCards.innerHTML += addPokieCard(pokemonData)

    } catch (error) {
        console.error('Fehler beim Laden der Pokémon-Details:', error);
    }
}

function enableSpinner() {
   loadingSpinner.classList.remove('hidden');
   loadMoreButton.disabled = true;
    body.classList.add('no-scroll');
}

function disableSpinner() {
    loadingSpinner.classList.add('hidden');
    loadMoreButton.disabled = false;
    body.classList.remove('no-scroll');
}

function capitalizeFirstLetters(text) {
    

    const words = text.split(' ');

    const transformedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return transformedWords.join(' ');
}

function to3abbreviation(text) {
    const words = text.split(' ');

    const transformedWords = words.map(word => {
        if (word.length >= 3) {
            return word.substring(0, 3);
        } else {
            return word;
        }
    });
    return transformedWords.join(' ');
}

async function handleSearchInput() {
    const userInput = pokemonSearchInput.value.trim();

    if (userInput.length === 0){
        offset = 0;
        PodexCards.innerHTML = '';
        await renderCards();
        loadMoreButton.style.display='block';
    }else if (userInput.length < 3) {
        showSearchHint();
    } else {
        hideSearchHint();
        await searchPokemons(userInput);
    }
}

function showSearchHint() {
    searchHintMessage.classList.remove('hidden');
}

function hideSearchHint() {
    searchHintMessage.classList.add('hidden');
}

const searchPokemons = async input => {

    enableSpinner();

    await allPokemons();

    await search(input);

    disableSpinner();
};

async function allPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');

        const pokemonList = await response.json();
        allPokemonNames = pokemonList.results;
    } catch (error) {
        console.error('Fehler beim Laden aller Pokémon-Namen:', error);
    }
}

async function search(input) {
    try {
        const searchTerm = input.toLowerCase();
        const filteredPokemon = allPokemonNames.filter(pokemon => pokemon.name.includes(searchTerm));

        if (filteredPokemon.length === 0) {
            noResultCard();
        }else{
            await renderSearchedCards(searchTerm);
        }
    } catch (error) {
        PodexCards.innerHTML = `<p style="color: red;">Fehler bei der Suche</p>`;
    }
}

function noResultCard() {
    PodexCards.innerHTML = '';
    offset = 0;
    PodexCards.innerHTML = displayNoResultsCard();
    loadMoreButton.style.display = 'none';
}

async function renderSearchedCards(searchTerm) {
    const filteredPokemon = allPokemonNames.filter(pokemon => pokemon.name.includes(searchTerm));
    const pokemonToRender = filteredPokemon.slice(0, limit);
    const pokemonUrlsToRender = pokemonToRender.map(pokemon => pokemon.url);
    PodexCards.innerHTML = '';
    offset = 0;

    for (const url of pokemonUrlsToRender) {
        await createPokemonCard(url);
    }
    if (filteredPokemon.length > limit) {
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none';
    }
}

function toggleOverlay() {
    overlay.classList.toggle("d_none");
}

async function showCard(pokemonId) {
    toggleOverlay();
    currentOverlayPokemonIndex = currentActivePokemonList.findIndex(p => {
        const urlParts = p.url.split('/');
        const idFromUrl = urlParts[urlParts.length - 2];
        return idFromUrl === pokemonId.toString();
    });
    enableSpinner()
    showSelectedCard(pokemonId).then(disableSpinner)
}

async function showSelectedCard(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = await response.json();
        currentOverlayPokemonId = pokemonData.id;
        overlayContent.innerHTML = selectedCardTemplate(pokemonData);

        if (currentOverlayPokemonIndex === -1 && currentActivePokemonList.length > 0) {
            currentOverlayPokemonIndex = currentActivePokemonList.findIndex(p => {
                const urlParts = p.url.split('/');
                const idFromUrl = urlParts[urlParts.length - 2];
                return idFromUrl === currentOverlayPokemonId.toString();
            });
        }

        prevButton.disabled = currentOverlayPokemonIndex <= 0 || currentActivePokemonList.length === 0;
        nextButton.disabled = currentOverlayPokemonIndex >= currentActivePokemonList.length - 1 || currentOverlayPokemonIndex === -1 || currentActivePokemonList.length === 0;

    } catch (error) {
        console.error('Fehler beim Laden oder Anzeigen der ausgewählten Karte:', error);
        overlayContent.innerHTML = `<p style="color: red;">Fehler beim Laden der Pokémon-Details für '${pokemonId}'.</p>`;
    }
}


async function nextCard() {
    if (currentActivePokemonList.length === 0 || currentOverlayPokemonIndex === -1) return;

    if (currentOverlayPokemonIndex < currentActivePokemonList.length - 1) {
        currentOverlayPokemonIndex++;
        const nextPokemonEntry = currentActivePokemonList[currentOverlayPokemonIndex];
        // Extrahiere ID aus URL oder verwende Namen
        const urlParts = nextPokemonEntry.url.split('/');
        const nextPokemonId = urlParts[urlParts.length - 2];
        await showSelectedCard(nextPokemonId);
    }
}

async function previousCard() {
    if (currentActivePokemonList.length === 0 || currentOverlayPokemonIndex === -1) return;

    if (currentOverlayPokemonIndex > 0) {
        currentOverlayPokemonIndex--;
        const prevPokemonEntry = currentActivePokemonList[currentOverlayPokemonIndex];
        const urlParts = prevPokemonEntry.url.split('/');
        const prevPokemonId = urlParts[urlParts.length - 2];
        await showSelectedCard(prevPokemonId);
    }
}