const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '1234',
    database: 'skatepark',
    port: '5432',
})

async function nuevoUsuario(email, nombre, password, anos_experiencia, especialidad) {

    try {
        
        const result = await pool.query(
            `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ('${email}', '${nombre}', '${password}', '${anos_experiencia}', '${especialidad}', 'img.jpg', false) RETURNING *`
        )
        
        const usuario = result.rows[0]
        return usuario

    } catch (e) {
        console.log(e);
    }

}

async function getUsuarios(){

    try {

        const result = await pool.query('SELECT * FROM skaters')
        
        const usuario = result.rows
        return usuario

    } catch (e) {
        console.log(e);
    }

}

async function setUsuarioStatus(id, estado){
    const result = await pool.query(
        `UPDATE skaters SET estado = '${estado}' WHERE id = '${id}' RETURNING *`
    )
    
    const usuario = result.rows[0]
    return usuario
}

async function getUsuario(email, password){

    const result = await pool.query(
        `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`
    )
    
    return result.rows[0]
}

async function setUsuario(id, nombre, password, anos_experiencia, especialidad){

    const result = await pool.query(
        `UPDATE skaters SET nombre = '${nombre}', 
                        password = '${password}', 
                        anos_experiencia = '${anos_experiencia}', 
                        especialidad = '${especialidad}' 
        WHERE id = '${id}' RETURNING *`
    )
    
    const usuario = result.rows[0]
    return usuario

}

async function deleteUsuario(id){

    const result = await pool.query(
        `DELETE FROM skaters WHERE id = '${id}' RETURNING *`
    )
    
    const usuario = result.rowsCount
    return usuario

}

async function setFoto(foto){
    const result = await pool.query(
        `UPDATE skaters SET foto = '${foto}' WHERE id = (SELECT MAX(id) FROM skaters) RETURNING *`
    )
    
    const usuario = result.rows[0]
    return usuario
}

module.exports = {
    nuevoUsuario,
    getUsuarios,
    setUsuarioStatus,
    getUsuario,
    setUsuario,
    deleteUsuario,
    setFoto
}
