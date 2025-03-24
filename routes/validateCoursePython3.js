const express = require('express');
const admin = require('firebase-admin');
const { db } = require('../firebaseConfig');
const {getUserProfileFromDatabase, mergeCoursesWithProgress, getLevelsExperience, getGlobalPythonCourses} = require("../utils/userHelpers");

const router = express.Router();

router.post('/1', async (req, res) => {
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
            return code.includes('aluminio_nombre  = "Aluminio"\n' +
                'aluminio_simbolo  = "Al"\n' +
                '\n' +
                'print(f”Nombre: {aluminio_nombre}\\nSímbolo: {aluminio_simbolo}”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 1:', error);
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
            return code.includes('aluminio_nombre  = "Aluminio"\n' +
                'aluminio_simbolo  = "Al"\n' +
                'arsenico_nombre = "Arsénico"\n' +
                'arsenico_simbolo = "As"\n' +
                '\n' +
                'print(f”Nombre: {aluminio_nombre}\\nSímbolo: {aluminio_simbolo}\\nNombre: {arsenico_nombre}\\nSímbolo: {arsenico_simbolo}”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 2:', error);
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
            return code.includes('aluminio_nombre  = "Aluminio"\n' +
                'aluminio_simbolo  = "Al"\n' +
                'arsenico_nombre = "Arsénico"\n' +
                'arsenico_simbolo = "As"\n' +
                'calcio_nombre = “Calcio”\n' +
                'calcio_simbolo = “Ca”\n' +
                '\n' +
                'print(f”Nombre: {aluminio_nombre}\\nSímbolo: {aluminio_simbolo}\\n\\nNombre: {arsenico_nombre}\\nSímbolo: {arsenico_simbolo}\\n\\nNombre: {calcio_nombre}\\nSímbolo: {calcio_simbolo}”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 3:', error);
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
            return code.includes('hidrogeno_simbolo = "H"\n' +
                'hidrogeno_numero_atomico = 1\n' +
                'calcio_simbolo = "Ca"\n' +
                'calcio_numero_atomico = 20\n' +
                '\n' +
                'print(f”Z(H): {hidrogeno_numero_atomico\\nZ(Ca): {calcio_numero_atomico}}.”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 4:', error);
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
            return code.includes('hidrogeno_simbolo = "H"\n' +
                'hidrogeno_numero_atomico = 1\n' +
                'calcio_simbolo = "Ca"\n' +
                'calcio_numero_atomico = 20\n' +
                'azufre_simbolo = “S”\n' +
                'azufre_numero_atomico = 16\n' +
                '\n' +
                '# print(f”Z(H): {hidrogeno_numero_atomico\\nZ(Ca): {calcio_numero_atomico}}.\\nZ(S): {azufre_numero_atomico }}.”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 5:', error);
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
            return code.includes('“””\n' +
                'Z(Ca): …\n' +
                '\n' +
                'Z(Al): …\n' +
                '\n' +
                'Z(As): …\n' +
                '“””\n' +
                '\n' +
                'calcio_simbolo = “Ca”\n' +
                'calcio_numero_atomico = 20 \n' +
                'aluminio_simbolo = “Al”\n' +
                'aluminio_numero_atomico = 13\n' +
                'arsenico_simbolo = “As”\n' +
                'arsenico_numero_atomico = 33\n' +
                '\n' +
                '# print(f”Z({calcio_simbolo}): {calcio_numero_atomico\\n\\nZ({aluminio_simbolo}): {aluminio_numero_atomico}.\\n\\nZ({arsenico_simbolo}): {arsenico_numero_atomico}.”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 6:', error);
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
            return code.includes('aluminio_simbolo = “Al”\n' +
                'aluminio_numero_atomico = 13 \n' +
                'aluminio_peso_atomico = 26.9875\n' +
                '\n' +
                'azufre_simbolo = "S"\n' +
                'azufre_numero_atomico = 16\n' +
                'azufre_peso_atomico = 32.0668\n' +
                '\n' +
                'print(f”Peso atómico ({aluminio_simbolo}): {aluminio_peso_atomico}\\nPeso atómico ({azufre_simbolo}): {azufre_peso_atomico}.”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 7:', error);
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
            return code.includes('hidrogeno_simbolo = “H”\n' +
                'hidrogeno_peso_atomico = 1.008\n' +
                'aluminio_simbolo = “Al”\n' +
                'aluminio_peso_atomico = 26.98\n' +
                '\n' +
                'print(f”Peso atómico ({hidrogeno_simbolo}): {hidrogeno_peso_atomico}\\n\\nPeso atómico ({aluminio_simbolo}): {aluminio_peso_atomico}.”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 8:', error);
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
            return code.includes('hidrogeno_simbolo = "H"\n' +
                'arsenico_simbolo = "As"\n' +
                'calcio_simbolo = "Ca"\n' +
                'aluminio_simbolo = "Al"\n' +
                'azufre_simbolo = "S"\n' +
                '\n' +
                'hidrogeno_peso_atomico = 1.008\n' +
                'arsenico_peso_atomico = 74.922\n' +
                'calcio_peso_atomico = 40.078\n' +
                'aluminio_peso_atomico = 26.982\n' +
                'azufre_peso_atomico = 32.065\n' +
                '\n' +
                'print(f"Peso atómico ({hidrogeno_simbolo}): {hidrogeno_peso_atomico}\\nPeso atómico ({arsenico_simbolo}): {arsenico_peso_atomico}\\n Peso atómico ({calcio_simbolo}): {calcio_peso_atomico}\\nPeso atómico ({aluminio_simbolo}): {aluminio_peso_atomico}\\nPeso atómico ({azufre_simbolo}): {azufre_peso_atomico}")\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 9:', error);
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
            return code.includes('hidrogeno_simbolo = "H" # str\n' +
                'hidrogeno_es_metaloide = False  # boolean\n' +
                '\n' +
                '# print(f”El Hidrógeno ({hidrogeno_simbolo}) es un metal: {hidrogeno_es_metaloide}”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 10:', error);
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
            return code.includes('hidrogeno_simbolo = "H" # str\n' +
                'hidrogeno_es_metaloide = False  # boolean\n' +
                '\n' +
                'azufre_simbolo = "S"\n' +
                'azufre_es_metaloide = True \n' +
                '\n' +
                '# print(f”El Hidrógeno ({hidrogeno_simbolo}) es un metal: {hidrogeno_es_metaloide}\\nEl Azufre ({S}) es un metal: {azufre_es_metaloide}”)\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 11:', error);
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
                'H: False\n' +
                'As: True\n' +
                'Ca: False\n' +
                'S: True\n' +
                '“””\n' +
                '\n' +
                'hidrogeno_simbolo = "H"\n' +
                'arsenico_simbolo = "As"\n' +
                'calcio_simbolo = "Ca"\n' +
                'azufre_simbolo = “S”\n' +
                '\n' +
                'hidrogeno_es_metaloide = False\n' +
                'arsenico_es_metaloide = True\n' +
                'calcio_es_metaloide = False\n' +
                'azufre_es_metaloide = True\n' +
                '\n' +
                '# print(f"{hidrogeno_simbolo}: {hidrogeno_es_metaloide}\\n{arsenico_simbolo}: {arsenico_es_metaloide}\\n{calcio_simbolo}: {calcio_es_metaloide}\\n{azufre_simbolo}: {azufre_es_metaloide}")\n');
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
        console.error('Error verifying token or validating python course 3 sublevel 12:', error);
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