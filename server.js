require('dotenv').config();
const express = require('express');
const { fork } = require("child_process");
const app = express();

const port = process.env.PORT || 4000;



app.get('/health', async (req, res) => {
    res.send('Api is working!');
});

app.listen(port, () => {
    fork("./src/Workers/signalrun.js");
    console.log(`Server is running on port ${port}`);
});
