const express = require('express');
const admin = require('firebase-admin');
const { db } = require('../firebaseConfig');
const {getUserProfileFromDatabase, mergeCoursesWithProgress, getLevelsExperience, getGlobalPythonCourses} = require("../utils/userHelpers");
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/1', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];
    let pythonOutput = '';

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'Estado actual del agua: líquido\n' +
                '“””\n' +
                '\n' +
                'estado_1 = "líquido"  \n' +
                'estado_2 = “sólido”\n' +
                'estado_3 = “gaseoso”\n' +
                'estado_actual = estado_1\n' +
                '\n' +
                'if estado_actual != "sólido":  \n' +
                '    print("El agua no está en estado sólido.") \n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations,
                pythonOutput
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        // Escribimos el código Python en un archivo temporal
        const tempFilePath = path.join(__dirname, 'temp_code.py');
        fs.writeFileSync(tempFilePath, classCode);  // Guardamos el código en un archivo

        // Si Python no está en el PATH, especificamos la ruta completa (ajusta según tu sistema)
        const pythonPath = 'python';  // Usa "python" en lugar de "python3" en Windows

        // Ejecutamos el archivo Python usando child_process
        exec(`${pythonPath} ${tempFilePath}`, async (err, stdout, stderr) => {
            if (err) {
                console.error('Error executing Python code:', err);
                res.status(400).json({
                    error: 'Error executing Python code',
                    details: stderr,
                    userProfile,
                    validations,
                    invalidations,
                    pythonOutput
                });
                return;
            }

            pythonOutput = stdout;  // Guardamos la salida de Python

            // Actualizamos el perfil del usuario
            const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
            let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
                return 1 === sublevelNumber;
            }) !== undefined;
            if (subLevelAlreadyDone) {
                xpAlreadyAccredited = true;
            }
            const updatedFirstCourse = {
                ...firstCourse,
                current: firstCourse.current + 1,
                completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
            };

            userProfile = {
                ...userProfile,
                profile: {
                    ...userProfile.profile,
                    level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                    current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
                },
                progress: {
                    ...userProfile.progress,
                    courses_python: [updatedFirstCourse, ...otherCourses]
                }
            };

            userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
            userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

            const userRef = db.collection('users').doc(uid);
            await userRef.set(userProfile);

            // Eliminamos el archivo temporal después de ejecutarlo
            fs.unlinkSync(tempFilePath);

            res.json({
                userProfile,
                validations,
                invalidations,
                pythonOutput  // Incluimos la salida de Python
            });
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 1:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/2', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('bromo_cantidad_sustancia = “1”  # mol\n' +
                'bromo_cantidad_sustancia = int(bromo_cantidad_sustancia)  # mol\n' +
                '\n' +
                'print(f”La cantidad de sustancia necesaria Bromo es de {bromo_cantidad_sustancia.}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 2:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/3', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'Cantidad de sustancia de Bromo: 2 mol\n' +
                'Cantidad de sustancia de Neón: 3 mol\n' +
                'Cantidad de sustancia de Hierro: 4 mol\n' +
                '“””\n' +
                '\n' +
                'unidad_de_medida = “mol”\n' +
                'bromo_cantidad_sustancia = “2”  # mol\n' +
                'neon_cantidad_sustancia = “3”  # mol\n' +
                'hierro_cantidad_sustancia = “4”  # mol\n' +
                '\n' +
                'bromo_cantidad_sustancia = int(bromo_cantidad_sustancia)  # mol\n' +
                'neon_cantidad_sustancia = int(neon_cantidad_sustancia)  # mol\n' +
                'hierro_cantidad_sustancia = int(hierro_cantidad_sustancia)   # mol\n' +
                '\n' +
                '# print(f”Cantidad de sustancia de bromo: {bromo_cantidad_sustancia} {unidad_de_medida}\\nCantidad de sustancia de bromo: {neon_cantidad_sustancia} {unidad_de_medida}\\nCantidad de sustancia de hierro: {hierro_cantidad_sustancia} {unidad_de_medida}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 3:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/4', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('cobre_masa = 63.546  # g/mol\n' +
                'cobre_volumen = 8.9  # L (volumen molar estimado)\n' +
                'cobre_cantidad_sustancia = 5  # mol\n' +
                '\n' +
                'cobre_masa = float(cobre_masa)  # g/mol\n' +
                'cobre_volumen =float(cobre_volumen)  # L (volumen molar estimado)\n' +
                'cobre_cantidad_sustancia = int(cobre_cantidad_sustancia)  # mol\n' +
                '\n' +
                '# print(f”Masa Cobre: {cobre_masa} g/mol\\nVolumen Cobre: {cobre_volumen} L\\nCantidad sustancia Cobre: {cobre_cantidad_sustancia} mol”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 4:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/5', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('hierro_masa = float(55.845)  # g/mol\n' +
                'hierro_volumen = float(7.1)  # L (volumen molar estimado)\n' +
                'hierro_cantidad_sustancia = int(4)  # mol\n' +
                '\n' +
                'print(f”Masa Hierro: {hierro_masa} g/mol\\nVolumen Hierro: {hierro_volumen} L\\nCantidad sustancia Hierro: {hierro_cantidad_sustancia} mol”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 5:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/6', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('helio_masa = “4.0026”  # g/mol\n' +
                'helio_volumen = “22.4”  # L (volumen molar a condiciones estándar)\n' +
                'helio_cantidad_sustancia = “1”  # mol\n' +
                '\n' +
                'helio_masa = float(4.0026)  # g/mol\n' +
                'helio_volumen = float(22.4)  # L (volumen molar a condiciones estándar)\n' +
                'helio_cantidad_sustancia = int(1)  # mol\n' +
                '\n' +
                'unidad_masa = “g/mol”\n' +
                'unidad_volumen = “L” \n' +
                'unidad_sustancia = “mol”\n' +
                '\n' +
                'print(f“Masa Helio: {helio_masa} {unidad_masa}\\nVolumen Helio: {helio_volumen} {unidad_volumen}\\n{helio_sustancia} {unidad_sustancia}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 6:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/7', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('estroncio_cantidad_sustancia = 4  # mol\n' +
                'niquel_cantidad_sustancia = 1  # mol\n' +
                'paladio_cantidad_sustancia = 3  # mol\n' +
                '\n' +
                'estroncio_cantidad_sustancia = str(estroncio_cantidad_sustancia)  # mol\n' +
                'niquel_cantidad_sustancia = str(niquel_cantidad_sustancia)  # mol\n' +
                'paladio_cantidad_sustancia = str(paladio_cantidad_sustancia)  # mol\n' +
                '\n' +
                '# print(“CANTIDAD DE SUSTANCIA\\nEstroncio: {estroncio_cantidad_sustancia}\\nNíquel: {niquel_cantidad_sustancia}\\n Paladio: {paladio_cantidad_sustancia} ”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 7:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/8', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('estroncio_aparicion = 24\n' +
                'niquel_aparicion = 75\n' +
                'paladio_aparicion = 12\n' +
                '\n' +
                'estroncio_aparicion = str(estroncio_aparicion)\n' +
                'niquel_aparicion = str(niquel_aparicion)\n' +
                'paladio_aparicion = str(paladio_aparicion)\n' +
                '\n' +
                '# print(f”APARICIONES\\nEstroncio: {estroncio_aparicion}\\nNíquel: {niquel_aparicion}\\nPaladio: {paladio_aparicion}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 8:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/9', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'APARICIÓN POR DÍA\n' +
                'Lunes: \n' +
                'Martes:\n' +
                'Miércoles:\n' +
                'Jueves:\n' +
                'Viernes: \n' +
                '“””\n' +
                '\n' +
                'cantidad_lunes = 8  \n' +
                'cantidad_martes = 17  \n' +
                'cantidad_miércoles = 15  \n' +
                'cantidad_jueves = 20  \n' +
                'cantidad_viernes = 15 \n' +
                '\n' +
                'cantidad_lunes = str(cantidad_lunes)\n' +
                'cantidad_martes = str(cantidad_martes)\n' +
                'cantidad_miércoles = str(cantidad_miercoles)\n' +
                'cantidad_jueves = str(cantidad_jueves)\n' +
                'cantidad_viernes = str(cantidad_viernes)\n' +
                '\n' +
                '# print(“APARICIÓN POR DÍA\\nLunes: {cantidad_lunes}\\nMartes: {cantidad_martes}\\nMiércoles: {cantidad_miércoles}\\nJueves: \\nViernes: {cantidad_viernes}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 9:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/10', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'RECETA\n' +
                '1. 75.35 L de Nitrógeno\n' +
                '2. 14.24 L Oxígeno\n' +
                '“””\n' +
                'nitrogeno_volumen = 75.35\n' +
                'oxigeno_volumen = 14.24 \n' +
                '\n' +
                'nitrogeno_volumen = str(nitrogeno_volumen)\n' +
                'oxigeno_volumen = str(oxigeno_volumen)\n' +
                '\n' +
                'print(f”RECETA\\n1. {nitrogeno_volumen} L de Nitrógeno\\n2. {oxigeno_volumen} L de Oxígeno”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 5 sublevel 10:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/11', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'RECETA\n' +
                '1. 75.35 L de Nitrógeno\n' +
                '2. 14.24 L Oxígeno\n' +
                '3. 53.29 L Vanadio\n' +
                '4. 199.2 L Berilio\n' +
                '“””\n' +
                'nitrogeno_volumen = 75.35\n' +
                'oxigeno_volumen = 14.24 \n' +
                'vanadio_volumen = 53.9\n' +
                'berilio_volumen = 199.2\n' +
                '\n' +
                'nitrogeno_volumen = str(nitrogeno_volumen)\n' +
                'oxigeno_volumen = str(oxigeno_volumen)\n' +
                'vanadio_volumen = str(vanadio_volumen)\n' +
                'berilio_volumen = str(berilio_volumen)\n' +
                '\n' +
                'print(f”RECETA\\n1. {nitrogeno_volumen} L de Nitrógeno\\n2. {oxigeno_volumen} L de Oxígeno\\n3. {vanadio_volumen} L de Vanadio\\n 4. {berilio_volumen} L de Berilio”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 11:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/12', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'RECETA\n' +
                'Elementos utilizados: Yodo, Litio, Zinc\n' +
                '1. 22.75 L de Yodo\n' +
                '2. 13.54 L de Litio\n' +
                '3. 45.88 L de Zinc\n' +
                '\n' +
                'TOTAL: 82.17 L\n' +
                '“””\n' +
                '\n' +
                'yodo_volumen = 22.75\n' +
                'litio_volumen = 13.54\n' +
                'zinc_volumen = 45.88\n' +
                '\n' +
                'yodo_volumen = str(yodo_volumen)\n' +
                'litio_volumen = str(litio_volumen)\n' +
                'zinc_volumen = str(zinc_volumen)\n' +
                '\n' +
                'total_volumen = 82.17 # escribir la suma final\n' +
                '\n' +
                'frase = “Elementos utilizados: Yodo, Litio, Zinc”\n' +
                '\n' +
                'print(f"RECETA\\n{frase}\\n1. {yodo_volumen} L de Yodo\\n2. {litio_volumen} L de Litio\\n3. {zinc_volumen} L de Zinc\\nTOTAL: {total_volumen} L")\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 4 sublevel 12:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/13', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('silicio_nombre = "Silicio"\n' +
                'oxigeno_simbolo = "O"\n' +
                'silicio_simbolo = "K"\n' +
                'silicio_simbolo = "Si"\n' +
                'Oxígeno_nombre = “Oxígeno”\n' +
                '\n' +
                'print(f“{hidrogeno_nombre}: {hidrogeno_simbolo}\\n{aluminio_nombre}: {aluminio_simbolo}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 3 sublevel 13:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/14', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('magnesio_nombre = “Potasio“\n' +
                'magnesio_simbolo = “K“\n' +
                'magnesio_nombre = “Magnesio“\n' +
                'magnesio_simbolo = “Mg“\n' +
                '\n' +
                'potasio_nombre = “Magnesio“\n' +
                'potasio_simbolo = “Mg“\n' +
                'potasio_nombre = “Potasio“\n' +
                'potasio_simbolo = “K“\n' +
                '\n' +
                '# print(f”{magnesio_nombre}: {magnesio_simbolo}\\n{potasio_nombre}: {potasio_simbolo}”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 3 sublevel 14:', error);
        res.status(401).send('Unauthorized');
    }
});
router.post('/15', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'elemento 1: “Oxígeno” (O)\n' +
                'elemento 2: “Silicio” (Si)\n' +
                'elemento 3: “Magnesio” (Mg)\n' +
                '“””\n' +
                '\n' +
                'oxigeno_nombre = "Oxígeno"\n' +
                'oxigeno_simbolo = "O"\n' +
                '\n' +
                'silicio_nombre = "Silicio"\n' +
                'silicio_simbolo = "Si"\n' +
                'oxigeno_simbolo = "Cl"\n' +
                '\n' +
                'magnesio_nombre = "Magnesio"\n' +
                'oxigeno_nombre =  "Potasio"\n' +
                'magnesio_simbolo = "Mg"\n' +
                'magnesio_nombre = "Cloro"\n' +
                '\n' +
                'oxigeno_simbolo = "O"\n' +
                'oxigeno_nombre = "Oxígeno"\n' +
                'magnesio_nombre = "Magnesio"\n' +
                '\n' +
                'print(f\'elemento 1: "{oxigeno_nombre}" ({oxigeno_simbolo})\\n elemento 2: "{silicio_nombre}" ({silicio_simbolo})\\n\'\'elemento 3: "{magnesio_nombre}" ({magnesio_simbolo})\')\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 3 sublevel 15:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/16', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'El número atómico de (O) es 8.\n' +
                'El número atómico de (Mg) es 12.\n' +
                'El número atómico de (Cl) es 17.\n' +
                '“””\n' +
                '\n' +
                'oxigeno_simbolo = "O"\n' +
                'magnesio_simbolo = "Mg"\n' +
                'cloro_simbolo = "Cl"\n' +
                '\n' +
                'oxigeno_numero_atomico = 8\n' +
                'magnesio_numero_atomico = 12\n' +
                'cloro_numero_atomico = 17\n' +
                'oxigeno_numero_atomico = 8\n' +
                '\n' +
                'print(f"El número atómico de ({oxigeno_simbolo}) es {oxigeno_numero_atomico}.\\nEl número atómico de ({magnesio_simbolo}) es {magnesio_numero_atomico}.\\nEl número atómico de ({cloro_simbolo}) es {cloro_numero_atomico}.")\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 3 sublevel 16:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/17', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'Z(K) es 25 - 6.\n' +
                'Z(Si) es 6 + 8.\n' +
                '“””\n' +
                '\n' +
                'potasio_simbolo = “R”\n' +
                'potasio_numero_atomico = 17\n' +
                'potasio_simbolo = “K”\n' +
                'potasio_numero_atomico = 19\n' +
                '\n' +
                'silicio_simbolo = “So”\n' +
                'silicio_numero_atomico = 15\n' +
                'silicio_simbolo = “Si”\n' +
                'silicio_numero_atomico = 14\n' +
                '\n' +
                'print(f”Z({potasio_simbolo}) es {potasio_numero_atomico}.\\nZ ({silicio_simbolo}) es {silicio_numero_atomico}.”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 3 sublevel 17:', error);
        res.status(401).send('Unauthorized');
    }
});

router.post('/18', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_VARIABLE_DECLARATION: 'VALID_VARIABLE_DECLARATION'
    });

    const Invalidations = Object.freeze({
        INVALID_VARIABLE_DECLARATION: 'INVALID_VARIABLE_DECLARATION'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return getLevelsExperience()[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('“””\n' +
                'Cantidad de elementos: …\n' +
                'Cantidad de metaloides: …\n' +
                'Cantidad de no metaloides: …\n' +
                'Z(Si) es 14.\n' +
                'Z(Cl) es 17.\n' +
                'Z(K) es 19.\n' +
                '“””\n' +
                '\n' +
                'silicio_es_metaloide = True\n' +
                'cloro_es_metaloide = False\n' +
                'potasio_es_metaloide = False\n' +
                '\n' +
                'cantidad_elementos = 6\n' +
                'cantidad_elementos_no_metaloides = 1\n' +
                'cantidad_elementos_metaloides = 3\n' +
                'cantidad_elementos = 3\n' +
                'cantidad_elementos_no_metaloides = 2\n' +
                'cantidad_elementos_metaloides = 1\n' +
                '\n' +
                'silicio_simbolo = Si\n' +
                'silicio_numero_atomico = 14\n' +
                'potasio_simbolo = K\n' +
                'potasio_numero_atomico = 18\n' +
                'potasio_numero_atomico = 19\n' +
                'cloro_simbolo = Cl\n' +
                'cloro_numero_atomico = 17\n' +
                '\n' +
                '# print(f”Cantidad de elementos: {cantidad_elementos}\\nCantidad de metaloides: {cantidad_elementos_metaloides}\\n Cantidad de no metaloides: {cantidad_elementos_no_metaloides}\\nZ(silicio_simbolo) es {silicio_numero_atomico}.\\nZ(cloro_simbolo) es {cloro_numero_atomico}.\\nZ(potasio_simbolo) es {potasio_numero_atomico}.”)\n');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_VARIABLE_DECLARATION);
            res.json({
                error: 'The code dont match with the variable declaration',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_VARIABLE_DECLARATION);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses_python;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 1 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 20
            },
            progress: {
                ...userProfile.progress,
                courses_python: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses_python = mergeCoursesWithProgress(getGlobalPythonCourses(), userProfile.progress.courses_python);
        userProfile.profile.total_xp = getLevelsExperience()[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating python course 3 sublevel 18:', error);
        res.status(401).send('Unauthorized');
    }
});

module.exports = router;