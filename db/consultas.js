const { Pool } = require('pg');
const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'skatepark',
    port: 5432
};
const pool = new Pool(config);

// const consulta = async (objeto) => {
//     const client = await pool.connect();
//     try {
//         const respuesta = await client.query(objeto);
//         client.release();
//         return respuesta
//     } catch (error) {
//         client.release();
//         console.log(error);
//         throw error;
//     }
// }

const newSkater = async ({mail, name, pw, experiencia, especialidad, fileName}) => {
    const query = {
        text: 'INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *;',
        values: [mail, name, pw, experiencia, especialidad, fileName],
    }
    const resultado = await pool.query(query);
    const skater = resultado.rows[0];
    return skater
};

const getSkaters = async () => {
    const query = {
        text: 'SELECT id, email, nombre, anos_experiencia, especialidad, foto, estado FROM skaters;'
    };
    const result = await pool.query(query);
    const skaters = result.rows;
    return skaters;
}
const getDataSkater = async (credentials) => {
    const valores = Object.values(credentials);
    const query = {
        text: 'SELECT email, nombre, anos_experiencia, especialidad FROM skaters WHERE email =$1 and password = $2;',
        values: valores
    };
    const resultado = await pool.query(query);
    const dataSkater = resultado.rows[0];
    return dataSkater
};

const updateDataSkater = async (newSkaterData) => {
    const valores = Object.values(newSkaterData);
    //console.log(valores);
    const query = {
        text: 'UPDATE skaters SET nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 WHERE email = $1 RETURNING *;',
        values: valores
    };
    const resultado = await pool.query(query);
    const updatedData = resultado.rows;
    return updatedData;
}

module.exports = {newSkater, getDataSkater, getSkaters, updateDataSkater}