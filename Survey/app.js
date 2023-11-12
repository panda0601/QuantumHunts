const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(bodyParser.json());

// Set up MySQL connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'mysql',
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Set up nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'u.keerthu0601@gmail.com',
        pass: 'panda1306',
    },
});

// Survey submission endpoint
app.post('/submit-survey', (req, res) => {
    try {
        // Extract survey data from the request body
        const surveyData = req.body;

        // Insert survey data into the database
        const insertQuery = `
            INSERT INTO surveys (question1, question2, question3, email)
            VALUES (?, ?, ?, ?);
        `;

        const values = [
            surveyData.question1,
            surveyData.question2,
            surveyData.question3,
            surveyData.email,
        ];

        connection.query(insertQuery, values, (error, results) => {
            if (error) {
                console.error('Error inserting into MySQL:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                const surveyId = results.insertId;

                // Send completion email
                const mailOptions = {
                    from: 'your-email@gmail.com',
                    to: surveyData.email,
                    subject: 'Survey Completion',
                    text: `Thank you for completing the survey! Your survey ID is ${surveyId}.`,
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    }
                });

                res.status(200).json({ message: 'Survey submitted successfully' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
