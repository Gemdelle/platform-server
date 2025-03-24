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
            return code.includes('print("El agua es esencial para todos los seres vivos.")');
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
        console.error('Error verifying token or validating python course 2 sublevel 1:', error);
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
            return code.includes('print(“El agua hierve a 100°C y se congela a 0°C.”)\n' +
                'print(“El agua tiene un punto de ebullición de 100°C y congelación de 0°C.”)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 2:', error);
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
            return code.includes('print(“El agua (H2O) es líquida a temperatura ambiente.”)\n' +
                'print(“El agua hierve a 100°C y se congela a 0°C.”)\n' +
                'print(“El agua tiene un punto de ebullición de 100°C y congelación de 0°C.”)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 3:', error);
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
            return code.includes('sal_importancia = "Se usa en la industria alimentaria y como desinfectante."\n' +
                'print(sal_importancia)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 4:', error);
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
            return code.includes('sal_estado = "sólido"\n' +
                'print(sal_estado)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 5:', error);
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
            return code.includes('sal_formula = "NaCl"\n' +
                'sal_punto_fusion = "801°C"\n' +
                'sal_punto_ebullicion = "1413°C"\n' +
                'print(sal_formula)\n' +
                'print(sal_punto_fusion)\n' +
                'print(sal_punto_ebullicion)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 6:', error);
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
            return code.includes('metano_nombre = "Metano"\n' +
                'metano_formula = "CH4"\n' +
                '\n' +
                'print("El compuesto es", metano_nombre)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 7:', error);
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
            return code.includes('metano_nombre = "Metano"\n' +
                'metano_formula = "CH4"\n' +
                'metano_punto_fusion = "-161.5°C"\n' +
                '\n' +
                'print("La fórmula del metano es ", metano_formula, “.”)\n' +
                'print("Su punto de fusión es", metano_punto_fusion, “.”)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 8:', error);
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
            return code.includes('metano_nombre = "Metano"\n' +
                'metano_formula = "CH4"\n' +
                'metano_estado = "gas"\n' +
                'metano_punto_fusion = "-161.5°C"\n' +
                'metano_punto_ebullicion = "-161.5°C"\n' +
                'metano_origen = "Se encuentra en los yacimientos de gas natural."\n' +
                '\n' +
                'print("El nombre del compuesto a describir es", metano_nombre, ".")\n' +
                'print("Su fórmula química es", metano_formula, ".")\n' +
                'print("Se encuentra en estado", metano_estado, ".")\n' +
                'print("Su punto de fusión es", metano_punto_fusion, ".")\n' +
                'print("Su punto de ebullición es", metano_punto_ebullicion, ".")\n' +
                'print(metano_origen)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 9:', error);
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
            return code.includes('dioxido_carbono_nombre = "Dióxido de carbono"\n' +
                'dioxido_carbono_formula = "CO2"\n' +
                'dioxido_carbono_estado = "gas"\n' +
                '\n' +
                '# print("El " + dioxido_carbono_nombre + " tiene la fórmula " + dioxido_carbono_formula)\n' +
                '# print(“El + dioxido_carbono_nombre + " es un " +  dioxido_carbono_estado)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 10:', error);
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
            return code.includes('dioxido_carbono_nombre = "Dióxido de carbono"\n' +
                'dioxido_carbono_formula = "CO2"\n' +
                'dioxido_carbono_estado = "gas"\n' +
                'dioxido_carbono_concentracion_atmosferica = "0.04%"\n' +
                '\n' +
                'print("El " + dioxido_carbono_nombre + " tiene la fórmula " + dioxido_carbono_formula + “.”)\n' +
                'print("Es un " + dioxido_carbono_estado + " que se encuentra en la atmósfera con una concentración de " + dioxido_carbono_concentracion_atmosferica + “.”’)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 11:', error);
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
            return code.includes('dioxido_carbono_nombre = "Dióxido de carbono"\n' +
                'dioxido_carbono_formula = "CO2"\n' +
                'dioxido_carbono_estado = "gas"\n' +
                'dioxido_carbono_concentracion_atmosferica = "0.04%"\n' +
                'dioxido_carbono_efecto_invernadero = "Contribuye al cambio climático."\n' +
                '\n' +
                'print("El compuesto "+ dioxido_carbono_nombre + " tiene la fórmula " + dioxido_carbono_formula + \n' +
                '      ", se encuentra en estado " + dioxido_carbono_estado + \n' +
                '      " y su concentración en la atmósfera es de " + dioxido_carbono_concentracion_atmosferica + \n' +
                '      ". " + dioxido_carbono_efecto_invernadero)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 12:', error);
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
            return code.includes('acido_clorhidrico_nombre = "Ácido clorhídrico"\n' +
                'acido_clorhidrico_formula = "HCl"\n' +
                '\n' +
                'print(f"El compuesto {acido_clorhidrico_nombre} tiene la fórmula {acido_clorhidrico_formula}.")\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 13:', error);
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
            return code.includes('acido_clorhidrico_nombre = "Ácido clorhídrico"\n' +
                'acido_clorhidrico_formula = "HCl"\n' +
                'acido_clorhidrico_estado = "líquido"\n' +
                'acido_clorhidrico_ph = "1"\n' +
                '\n' +
                'print(f"El compuesto {acido_clorhidrico_nombre} tiene la fórmula {acido_clorhidrico_formula}, es un {acido_clorhidrico_estado} y su pH es {acido_clorhidrico_ph}.")\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 14:', error);
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
            return code.includes('acido_clorhidrico_nombre = "Ácido clorhídrico"\n' +
                'acido_clorhidrico_formula = "HCl"\n' +
                'acido_clorhidrico_estado = "líquido"\n' +
                'acido_clorhidrico_ph = "1"\n' +
                'acido_clorhidrico_usos = "Se utiliza en la limpieza industrial y en la producción de cloro."\n' +
                '\n' +
                'print(f"El compuesto {acido_clorhidrico_nombre} tiene la fórmula {acido_clorhidrico_formula}, se encuentra en estado {acido_clorhidrico_estado}, su pH es {acido_clorhidrico_ph} y {acido_clorhidrico_usos}")\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 15:', error);
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
            return code.includes('acido_sulfurico_nombre = "Ácido sulfúrico"\n' +
                'acido_sulfurico_formula = "H₂SO₄"\n' +
                '\n' +
                'print(f”Nombre: {acido_sulfurico_nombre}\\n Fórmula: {acido_sulfurico_formula}”)\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 16:', error);
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
            return code.includes('acido_sulfurico_usos = "Se utiliza en la fabricación de fertilizantes, detergentes y en el refinado de petróleo."\n' +
                'acido_sulfurico_formula = "H₂SO₄"\n' +
                'acido_sulfurico_ph = "0.3"\n' +
                '\n' +
                'print(f"La fórmula del ácido sulfúrico es {acido_sulfurico_formula}.\\nEl pH del ácido sulfúrico es {acido_sulfurico_ph}.\\n{acido_sulfurico_usos}")\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 17:', error);
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
            return code.includes('acido_sulfurico_nombre = "Ácido sulfúrico"\n' +
                'acido_sulfurico_formula = "H₂SO₄"\n' +
                'acido_sulfurico_estado = "líquido"\n' +
                'acido_sulfurico_ph = "0.3"\n' +
                'acido_sulfurico_usos = "Se utiliza en la fabricación de fertilizantes, detergentes y en el refinado de petróleo."\n' +
                '\n' +
                'print(f\'acido_sulfurico_nombre = "{acido_sulfurico_nombre}"\\nacido_sulfurico_formula = "{acido_sulfurico_formula}"\\nacido_sulfurico_estado = "{acido_sulfurico_estado}"\\nacido_sulfurico_ph = "{acido_sulfurico_ph}"\\nacido_sulfurico_usos = "{acido_sulfurico_usos}"\')\n');
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
        console.error('Error verifying token or validating python course 2 sublevel 18:', error);
        res.status(401).send('Unauthorized');
    }
});

module.exports = router;