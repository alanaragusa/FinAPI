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

    request.customer = customer;

    return next();
}

// função para cálculo do balanço //
function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
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
    // desestruturação do customer de dentro do request - acesso a informação //
    const { customer } = request;

    return response.json(customer.statement);
});

// realizar um depósito - método post //
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    // recebemos as informações de descrição e quantia dos body params //
    const { description, amount } = request.body;

    // recuperar o customer do verifyIfExistsAccountCPF //
    const { customer } = request;

    // criação da operação de depósito //
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }
    customer.statement.push(statementOperation);

    return response.status(201).send();
});

// realizar um saque - método post //
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    // recebemos o valor do saque do body params //
    const { amount } = request.body;

    // recuperar o customer do verifyIfExistsAccountCPF //
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return response.status(400).json({ error: "Insufficient funds!"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit',
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

// buscar extrato por data - método get //
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    // desestruturação do customer de dentro do request - acesso a informação //
    const { customer } = request;
    // receber a data pelos query params //
    const { date } = request.query;

    // formatar data - qualquer horário //
    const dateFormat = new Date(date + " 00:00");

    // filtro para retornar as operações do dia pedido //
    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return response.json(statement);
});

app.listen(3333);