const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

// array para armazenamento provisório dos dados do cliente //
const costumers = [];

// criar conta - método post //
app.post("/account", (request, response) => {
    const { cpf, name } = request.body;
    const id = uuidv4();

    costumers.push({
        cpf,
        name,
        id,
        statement: []
    });

    return response.status(201).send();
});

app.listen(3333);