const express = require('express');
const app = express();
const axios = require('axios');


const PORT = 4000;


const getAllCharacters = async () => {
    let allCharacters = [];
    let nextPageUrl = 'https://rickandmortyapi.com/api/character';

    while (nextPageUrl) {
        try {
            const response = await axios.get(nextPageUrl);
            allCharacters = allCharacters.concat(response.data.results); 

            nextPageUrl = response.data.info.next;
        } catch (error) {
            res.status(404).json({error: 'No se pudo obtener la lista de personajes'});
        }
    }

    return allCharacters;
};


app.get('/characters', async (req, res) => {
    try {
        const characters = await getAllCharacters();
        const charactersList = characters.map(({name, status, species, gender, origin: {name: originName}, image}) => ({
            name,
            status,
            species,
            gender,
            origin: {name: originName},
            image
        }));
        
        res.json(charactersList);
    } catch (error) {
        res.status(404).json({ error: 'No se puede mostrar lista de personajes' });
    }
});


app.get('/characters/:name', async (req, res) => {
    const characterName = req.params.name;
    console.log(characterName)

    try {
        const characters = await getAllCharacters();
        const filterCharacters = characters.filter(char => char.name.toLowerCase().includes(characterName.toLowerCase()));
        
       
        res.json(filterCharacters);
       
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en: http://localhost:${PORT}`));