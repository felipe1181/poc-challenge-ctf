const express = require('express');
const { body, param } = require('express-validator');
const path = require('path');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const ceasarEncrypt = require('caesar-encrypt');

const app = express();
const port = process.env.PORT;

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to render the HTML page
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const authentication = (req, res, next) => {
    try {
        const authorization = req?.headers?.authorization
        if (Boolean(authorization) === false || authorization?.includes('Bearer ') === false) {
            return res.status(401).json({
                data: 'Não tem autorizacao'
            });
        }

        const token = authorization.split('Bearer ')[1];
        const user = jwt.verify(token, process.env.SECRET_KEY);

        if (user) {
            req.user = user;
            next();
        }

        return res.status(401).json({
            data: 'Não tem autorizacao'
        });
    } catch (error) {
        return res.status(401).json({
            data: 'Não tem autorizacao'
        });
    }
}

app.get('/profile', (_req, res) => {

    return res.json({
        token: jwt.sign({
            email: process.env.FLAG_MAIL,
            password: process.env.FLAG_PASSWORD
        },
            process.env.SECRET_KEY,
            {
                expiresIn: '1h'
            })
    })
})

app.post('/crawler',
    param('email')
        .isEmail().withMessage('informe um email válido')
        .notEmpty().withMessage('email obrigatório'),
    param('password')
        .isString().withMessage('informe um password válido')
        .notEmpty().withMessage('email obrigatório')
        .isLength({ min: 5, max: 10 })
        .withMessage('informe uma senha válida'),
    authentication, (_req, res) => {
        const payloadEncrypt = ceasarEncrypt.encrypt(Buffer.from(`email=${process.env.FLAG_MAIL}&password=${process.env.FLAG_PASSWORD}&flag=${process.env.TEMP_FLAG}`).toString('base64'), 1)
        return res.status(201).json({
            data: {
                rule: Buffer.from(process.env.FLAG_TIP).toString('base64'),
                user: payloadEncrypt
            }
        })
    })

app.post('/send-flag',
    body('email')
        .isEmail().withMessage('informe um email válido')
        .notEmpty().withMessage('email obrigatório'),
    body('password')
        .isString().withMessage('informe um password válido')
        .notEmpty().withMessage('email obrigatório')
        .isLength({ min: 5, max: 10 })
        .withMessage('informe uma senha válida'),
    body('flag')
        .isString()
        .optional(),
    authentication
    , (req, res) => {
        const { email, password, flag } = req.body

        if (email === process.env.FLAG_MAIL && password === process.env.FLAG_PASSWORD && flag === process.env.TEMP_FLAG) {
            return res.status(200).json({
                data: {
                    flag: process.env.FLAG_KEY
                }
            })
        }

        res.status(400).json({
            data: 'login inválido'
        })
    })

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
