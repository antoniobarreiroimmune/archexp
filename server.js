const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const fileUpload = require('express-fileupload');
const fs = require('fs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload({ createParentPath: true, safeFileNames: true, preserveExtension: true }));
app.use(express.static('public'));
app.use('/foto', express.static('archivos'));

app.post('/subir', (req, res) => {
    if (!req.files || !req.files.archivo) {
        return res.status(400).send({ mensaje: "No hay archivo en la petición" });
    }
    
    const file = req.files.archivo;
    const date = new Date();
    let now = date.toISOString().replaceAll('-', '').replaceAll(':', '').replaceAll('.', '');
    const md5 = file.md5;
    const filename = `${md5}${now}${file.name}`;

    file.mv(`./archivos/${filename}`, err => {
        if (err) {
            return res.status(500).send({ mensaje: "Error al subir el archivo" });
        }

        res.redirect('/'); 
    });
});

app.get('/descarga', (req, res) => {
    const archivo = req.query.archivo;
    res.download(`./archivos/${archivo}`);
});

app.get('/imagenes', (req, res) => {
    fs.readdir('./archivos', (err, files) => {
        if (err) {
            return res.status(500).send({ mensaje: "No se ha podido leer el directorio" });
        }
        const imgPaths = files.map(archivo => `http://localhost:${PORT}/foto/${archivo}`);
        res.send({ mensaje: "Archivos recuperados", results: imgPaths, files: files });
    });
});

app.delete('/eliminar', (req, res) => {
    const archivo = req.query.archivo;
    fs.unlink(`./archivos/${archivo}`, (err) => {
        if (err) {
            return res.status(500).send({ mensaje: "Error al eliminar el archivo" });
        }
        res.send({ mensaje: "Archivo eliminado" });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
