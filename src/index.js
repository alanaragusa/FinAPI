const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

// array para armazenamento provisório dos dados do cliente //
const customers = [];

// middleware //
function verifyIfExistsAccountCPF(request, response,next) {
    const { cpf } = request.headers;

    // procurar se existe algum cliente com o cpf já cadastrado (.find pq precisa retornar o objeto com as informações //
    const customer = customers.find(customer => customer.cpf === cpf);

    // verificação da existência do cliente //
    if(!customer){
        return response.status(400).json({error: "Customer not found"});
    }

    return next();
}

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

    // push para enviar a informação para o array acima //
    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});

// buscar extrato - método get //
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    return response.json(customer.statement);
});

app.listen(3333);