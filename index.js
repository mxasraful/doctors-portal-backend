const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const port = 3001

const app = express()


app.use(cors())
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.llje0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const appointmentsCollection = client.db("doctors-portal").collection("appointments");
    const usersApCollection = client.db("doctors-portal").collection("usersappointments");
    // perform actions on the collection object

    // All Appointments Data
    app.get("/allappointments", (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, docx) => {
                res.send(docx)
            })
    })

    // Appointments Data For Specific Month
    app.get("/appointments", (req, res) => {
        appointmentsCollection.find({
            forDay: req.query.day,
            forMonth: req.query.month,
            forYear: req.query.year
        })
            .toArray((err, docx) => {
                res.send(docx)
            })
    })

    // One Appointment Data data
    app.get("/appointment", (req, res) => {
        appointmentsCollection.findOne({
            _id: ObjectId(req.query._id)
        })
            .then(result => {
                res.send(result)
            })
    })

    // Post Appointment in database
    app.post("/postAppointment", (req, res) => {
        console.log(req.body)
        usersApCollection.findOne({
            email: req.body.email,
            id: req.body.id,
        })
            .then(result => {
                if (result) {
                    res.send(JSON.stringify("You are already booked this appointment."))
                } else {
                    usersApCollection.insertOne(req.body)
                        .then(result => {
                            if (result.insertedCount === 1) {
                                res.send(JSON.stringify("Appointment Submit Successful."))
                            }
                        })
                }
            })
            .catch(err => {
                usersApCollection.insertOne(req.body)
                    .then(result => {
                        if (result.insertedCount === 1) {
                            res.send(JSON.stringify("Appointment Submit Successful."))
                        }
                    })
            })
    })

    // Users Submitted All Appointments
    app.get("/usersappointments", (req, res) => {
        usersApCollection.find({
            apDate: req.query.date,
        })
            .toArray((err, docx) => {
                res.send(docx)
            })
    })

    // Add All Appointments Data In Database
    // app.get("/addappointments", (req, res) => {
    //     appointmentsCollection.insertMany(st)
    //     .then(result => res.send("Added...."))
    // })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)