
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const PORT = process.env.PORT || 3000;
dotenv.config({
    path: '../.env'
});

app.get('/', (req, res) => {
	res.send('Hello, world!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
