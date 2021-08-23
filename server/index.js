//Imports:
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const secretKey = 'LaPwMásSecretFromWorld';
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { newSkater, getDataSkater, getSkaters, updateDataSkater } = require('../db/consultas')
app.listen(3000, () => console.log('Server up & running at http://localhost:3000'));


//Middlewares
app.set('view engine', 'handlebars');
const root = path.join(__dirname, '../');
app.engine('handlebars', exphbs({
    defaultLayout: 'Main',
    layoutsDir: path.join(root, '/views/mainLayout'),
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use('/css', express.static(path.join(root, 'public', 'css')));
app.use('/img', express.static(path.join(root, 'public', 'img')));
const config = {
    limit: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: 'El peso del archivo supera el máximo permitido (5MB)'
};
app.use(expressFileUpload(config));

//Routes

app.get('/', async (req, res) => {
    const skaters = await getSkaters();
    console.log('skaters 37',skaters);
    res.render('Index', {skaters});
});
app.get('/login', (req, res) => {
    res.render('Login');
});
app.get('/register', (req, res) => {
    res.render('Registro')
});

app.post('/register', async (req, res) => {
    const skaterData = req.body;
    //console.log(skaterData);
    const { foto } = req.files;
    const { name: fotoName } = foto;
    const realFileName = (nombreArchivo) => {
        return uuidv4().slice(-6) + nombreArchivo;
    };
    skaterData.fileName = realFileName(foto.name);//asignarle un nombre a la foto para poder tenerla y manipularla en la app.
    //console.log(foto);
    //console.log('rutaa',`${root}/public/img`);
    //console.log('skaterdataConFoto',skaterData);
    foto.mv(`${root}/public/img/${skaterData.fileName}`, async (error, data) => {
        if (error) res.status(500).send('No se pudo cargar la imagen', error);
        try {
            const agregar = await newSkater(skaterData);
            res.status(201).send(agregar);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                error: `Hubo un error... ${error}`,
                code: 500
            })
        }
    });
});

app.post('/login', async (req, res) => {
    const credentials = req.body;
    try {
        const skaterData = await getDataSkater(credentials);
        const token = jwt.sign({ data: skaterData, exp: Math.floor(Date.now() / 1000) + 360 }, secretKey);
        res.status(200).send(token);
    } catch (error) {
        res.status(500).send({ error: 'Hubo un error', code: 500 })
    }
});

app.get('/datos', (req, res) => {
    const { token: token } = req.query;
    jwt.verify(token, secretKey, (error, decoded) => {
        if (error) return res.status(401).send('El token es inválido');
        const { data } = decoded;
        //console.log('data88', data);
        const decodedData = data;
        //console.log('data90',decodedData);
        res.render('Datos', {data});
    });
});

app.post('/datos', async (req, res) => {
    const skaterData = req.body;
    const updatedSkaterData = await updateDataSkater(skaterData);
    res.send(updatedSkaterData);
})

app.get('/admin', async (req, res) => {
    const skaters = await getSkaters();
    res.render('Admin', {skaters})
})