const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const expressFileupload = require('express-fileupload')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const secretKey = 'Shhhh'

const { nuevoUsuario, getUsuarios, setUsuarioStatus, getUsuario, setUsuario, deleteUsuario, setFoto } = require('./consultas')

app.listen(3000, console.log('OK'))

// Midlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use(
    expressFileupload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: 'El tamaño de la imagen supera el limite permitido'
    })
)

app.engine(
    'handlebars',
    exphbs.engine({
        defaultLayout: 'main',
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
)

app.set('view engine', 'handlebars')

// rutas -------------------------------------------------------------------------------------------------

// vista principal
app.get('/', async (req, res) => {

    const usuarios = await getUsuarios()
    res.render('index', {usuarios})

})

// vista de registros
app.get('/usuarios', (req, res) => {
    res.render('Registro')
})

// registro de usuarios
app.post('/usuarios', async (req, res) => {

    const { email, nombre, password, anos_experiencia, especialidad } = req.body

    // const foto = img.slice(12, (img.length))

    try {

        const usuario = await nuevoUsuario(email, nombre, password, anos_experiencia, especialidad)
        res.status(201).send(usuario)

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500 
        })
    }

})

// editar estado de usuario
app.put('/usuarios', async (req, res) => {

    const { id, estado } = req.body

    try {
        
        const usuario = await setUsuarioStatus(id, estado)
        res.status(200).send(usuario)

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500 
        })
    }

})

// editar datos del usuario
app.put('/usuario', async (req, res) => {

    const { id, nombre, password, anos_experiencia, especialidad } = req.body

    try {
    
        const usuario = await setUsuario(id, nombre, password, anos_experiencia, especialidad)
        res.status(200).send(usuario)

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500 
        })
    }

})

// eliminar cuenta de usuario
app.delete('/usuario', async (req, res) => {

    const { id } = req.body

    console.log(id);

    try {
        
        const usuario = await deleteUsuario(id)
        res.status(200).send(usuario)

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500 
        })
    }

})

// vista admin
app.get('/Admin', async (req, res) => {

    try {
        
        const usuarios = await getUsuarios()
        res.render('Admin', { usuarios })

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500 
        })
    }

})

// vista login
app.get('/login', (req, res) => {
    res.render('Login')
})

// login de usuario - autenticación y verificación
app.post('/login', async function (req, res) {

    const { email, password } = req.body
    const user = await getUsuario(email, password)

    if(user){
        if(user.estado){
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 300,
                    data: user,
                },
                secretKey
            )
            res.send(token)
        }else{
            res.status(401).send({
                error: 'Este usuario aún no ha sido validado aún',
                code: 401
            })
        }
    }else{
        res.status(404).send({
            error: 'Este usuario no esta registrado',
            code: 404
        })
    }

})

// vista de datos del usuario
app.get('/datos', async (req, res) => {

    const { token } = req.query

    jwt.verify(token, secretKey, (err, decoded) => {

        const { data } = decoded
        const { id, email, nombre, password, anos_experiencia, especialidad } = data

        err ? res.status(401).send(
            res.send({
                error: '401 Unauthorized',
                message: 'Usted no esta autorizado para estar aquí',
                token_error: err.message,
            })
        )
        :res.render('Datos', {id, email, nombre, password, anos_experiencia, especialidad})

    })

})

// vista de registros
app.get('/foto', (req, res) => {
    res.render('Foto')
})

// cargar foto del usuario
app.post("/foto", async (req, res) => {

    const { foto } = req.files;
    const { name } = foto;

    foto.mv(`${__dirname}/public/fotos/${name}`, (err) => {
        if(err) return res.status(400).send(`Algo salio mal... ${err}`)
    });

    try {

        await setFoto(name)
        res.redirect('/login')

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500 
        })
    }


});
    


