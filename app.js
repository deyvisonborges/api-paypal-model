const Express = require('express');
const Paypal = require('paypal-rest-sdk');

Paypal.configure({
    "mode": "sandbox",
    "client_id": "AV5gNDR98cYs7XiTztkS8WIcAQXiUsqbwe7AKtpU-pNbjM0UHORMmDECQs3fXd__aUf3fnpAPpyo8wa8",
    "client_secret": "EDgK4xWLPuPfHImQN26rbJhTaFw47mSry-O-zzn2Z4BFXJrNHMRfuHK3B05G-v_ojjoiYrDy9sEXYYZK"
});

const app = express();

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "transactions": [
            {
                "amount": {
                    "total": "30.11",
                    "currency": "BRL",
                    "details": {
                        "subtotal": "30.00", //total do pedido (somando os valores dos produtos cadastrados no "items" logo abaixo)
                        "tax": "0.07", // imposto ou algo relacionado ao mesmo
                        "shipping": "0.03", // custo de frete
                        "handling_fee": "1.00", // seguro
                        "shipping_discount": "-1.00", // desconto
                        "insurance": "0.01" // desconto de frete
                    }
                },
                "description": "The payment transaction description.",
                "custom": "EBAY_EMS_90048630024435",
                "invoice_number": "48787589673",
                "payment_options": {
                    "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
                },
                "soft_descriptor": "ECHI5786786",
                "item_list": {
                    "items": [
                        {
                            "name": "hat", // nome do produto
                            "description": "Brown hat.", // descricao do produto
                            "quantity": "5", // quantidades do produto
                            "price": "3", // preco unitario do produto
                            "tax": "0.01",
                            "sku": "1", // sku ou id do produto
                            "currency": "BRL" //moeda
                        },
                        {
                            "name": "handbag",
                            "description": "Black handbag.",
                            "quantity": "1",
                            "price": "15",
                            "tax": "0.02",
                            "sku": "product34",
                            "currency": "BRL"
                        }
                    ],
                    "shipping_address": {
                        "recipient_name": "nome do destinatario",
                        "line1": "logradouro",
                        "line2": "complemento",
                        "city": "cidade",
                        "country_code": "MA",
                        "postal_code": "cep",
                        "phone": "telefones para contato",
                        "state": "sigla do estado"
                    }
                }
            }
        ],
        "note_to_payer": "Entre em contato conosco para qualquer dúvida sobre seu pedido.", // nota ao comprador (ou aviso)
        "redirect_urls": {
            "return_url": "http://localhost:3000/pagamento/sucesso",
            "cancel_url": "http://localhost:3000/pagamento/cancelamento"
        }
    }

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('cancelado'));

app.listen(3000, () => console.log('Server Started'));