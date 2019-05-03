const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URI = process.env.MONGODB_URI || 'mongodb://localhost/database';
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.get('/secret', (req, res) => res.sendFile(path.join(__dirname, 'secret.html')));

app.post('/secret', (req, res) => {
    MongoClient.connect(URI, { useNewUrlParser: true }, (err, db) => {
        if (err) {
            console.log(err);
        } else {
            const dbo = db.db("mydb");
            const collection = dbo.collection('names');
            const entry = {
                name: req.body.name.toLowerCase(),
                card: req.body.numer + '_of_' + req.body.suit
            };
            collection.insertOne(entry, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send('Inserted into database');
                }
            })
            db.close();

        }
    })
})

app.get('/:param*', (req, res) => {
    const name = req.url.slice(1).toLowerCase();

    MongoClient.connect(URI, { useNewUrlParser: true }, (err, db) => {
        if (err) {
            console.log(err);
        } else {
            const dbo = db.db("mydb");
            const collection = dbo.collection('names');

            if (name === 'deleteall') {
                collection.remove({});
                res.send('database reset');
            } else {
                collection.find({name: name}).toArray((err, result) => {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
                        const card = result[result.length-1].card + '.png';
                        res.sendFile(path.join(__dirname + '/cards/' + card));
                    } else {
                        res.sendStatus(404);
                    }

                    db.close();
                })
            }
        }
    })
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
