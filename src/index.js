const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

// array para armazenamento provisório dos dados do cliente //
const customers = [];

// criar conta - método post //
app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    // checando se o cpf do novo cadastro já existe - se existir já dá erro //
    const customerAlreadyExists = customers.some(
        (customers) => customers.cpf === cpf
    );

    if (customerAlreadyExists) {
        return response.status(400).json({error:"Customer already exists!"})
    };

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});

app.listen(3333);