const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

app.post('/compile', (req, res) => {
    const fatherCode = req.body.fatherCode;
    const mainCode = req.body.mainCode;
    const javaDir = path.join(__dirname, 'java_files');

    if (!fs.existsSync(javaDir)) {
        fs.mkdirSync(javaDir);
    }

    fs.writeFileSync(path.join(javaDir, 'Father.java'), fatherCode);
    fs.writeFileSync(path.join(javaDir, 'Main.java'), mainCode);

    const compileCommand = `javac Father.java Main.java`;
    const runCommand = `java Main`;

    exec(compileCommand, { cwd: javaDir }, (error, stdout, stderr) => {
        if (error) {
            res.json({ output: stderr });
            return;
        }

        exec(runCommand, { cwd: javaDir }, (runError, runStdout, runStderr) => {
            if (runError) {
                res.json({ output: runStderr });
                return;
            }
            res.json({ output: runStdout });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
