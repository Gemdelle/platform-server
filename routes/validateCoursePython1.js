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
            return code.includes('quote = "La materia no se crea ni se destruye, solo se transforma."');
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
        console.error('Error verifying token or validating python course 1 sublevel 1:', error);
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
            return code.includes('quote = "Nada se pierde, todo se transforma." # Antoine Lavoisier');
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
        console.error('Error verifying token or validating python course 1 sublevel 2:', error);
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
            return code.includes('quote = "Todo es cuestión de átomos." # Richard Feynman');
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
        console.error('Error verifying token or validating python course 1 sublevel 3:', error);
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
            return code.includes('“””\n' +
                'quote = "Si la química no existiera, la vida no sería posible."\n' +
                '“””\n');
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
        console.error('Error verifying token or validating python course 1 sublevel 4:', error);
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
            return code.includes('“””\n' +
                'Glenn T. Seaborg (1912-1999) fue un químico estadounidense que descubrió varios elementos transuránicos, incluido el plutonio El elemento seaborgio (Sg) fue nombrado en su honor.\n' +
                '“””\n' +
                '“””\n' +
                'quote1 = "La alquimia fue la predecesora de la química moderna." # Carl Jung\n' +
                '“””\n' +
                'quote2 = "Cada elemento tiene su propia identidad." # Glenn T. Seaborg\n' +
                '“””\n' +
                'quote3 = "La ciencia y la paz triunfarán sobre la ignorancia y la guerra." # Louis Pasteur\n' +
                '“””\n');
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
        console.error('Error verifying token or validating python course 1 sublevel 5:', error);
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
                'Theodore Gray es un químico, escritor y divulgador científico conocido por su pasión por la tabla periódica. Es cofundador de Wolfram Research y autor de libros como The Elements, donde presenta la química de forma visual e interactiva.\n' +
                '“””\n' +
                '\n' +
                'quote = "Los elementos son los átomos de la tabla periódica, pero la química es la sinfonía de sus combinaciones." # Theodore Gray\n');
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
        console.error('Error verifying token or validating python course 1 sublevel 6:', error);
        res.status(401).send('Unauthorized');
    }
});

module.exports = router;