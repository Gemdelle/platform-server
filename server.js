const express = require('express');
const bodyParser = require('body-parser');
const {exec} = require('child_process');
const fs = require('fs');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const {db} = require('./firebaseConfig');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let globalCoursesData = [];
let levelsExperience = {
    1: 150,
    2: 500
}


async function fetchCoursesData() {
    try {
        const coursesSnapshot = await db.collection('courses').get();
        globalCoursesData = coursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching courses data:', error);
    }
}

fetchCoursesData();

setInterval(fetchCoursesData, 1000 * 60 * 60);

app.get('/profile', async (req, res) => {
    const idToken = req.headers.authorization.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        let userProfile = await getUserProfileFromDatabase(uid);

        if (!userProfile) {
            userProfile = await createNewUserProfile(uid, decodedToken.email);
        }

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or fetching profile:', error);
        res.status(401).send('Unauthorized');
    }
});

app.put('/select-pet', async (req, res) => {
    const petSelected = req.body.pet_selected;
    const uid = req.headers.authorization.split('Bearer ')[1];

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                avatar: petSelected
            }
        }

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or selecting pet:', error);
        res.status(401).send('Unauthorized');
    }
});

app.post('/validate/course/1/theoretical', async (req, res) => {
    const theoretical = req.body.theoretical;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false

    function resolveTheoreticalGradeFromScore(currentScore) {
        return currentScore >= 15 ? TheoreticalGrades.GOLD :
            currentScore >= 12 ? TheoreticalGrades.SILVER :
                TheoreticalGrades.NONE;
    }

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 50;
        return levelsExperience[userProfile.profile.level] === nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        let scoreDifferenceBetweenScores = theoretical.score.current - firstCourse.theoretical.score.current;
        let currentScore = scoreDifferenceBetweenScores > 0 ? firstCourse.theoretical.score.current + scoreDifferenceBetweenScores : firstCourse.theoretical.score.current;

        if (currentScore === firstCourse.theoretical.score.current) {
            res.json(userProfile);
            return
        }

        if (firstCourse.theoretical.grade !== TheoreticalGrades.NONE) {
            xpAlreadyAccredited = true
        }

        const updatedFirstCourse = {
            ...firstCourse,
            current: currentScore >= 12 && firstCourse.current === 0 ? firstCourse.current + 1 : firstCourse.current,
            theoretical: {
                grade: resolveTheoreticalGradeFromScore(currentScore),
                score: {
                    current: currentScore,
                    total: theoretical.score.total
                }
            }
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level:  xpAlreadyAccredited ? userProfile.profile.level: resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 50,
            },
            progress: {
                ...userProfile.progress,
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 1:', error);
        res.status(401).send('Unauthorized');
    }
});

app.post('/validate/course/1/1', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_CLASS_STRUCTURE: 'VALID_CLASS_STRUCTURE'
    });

    const Invalidations = Object.freeze({
        INVALID_CLASS_STRUCTURE: 'INVALID_CLASS_STRUCTURE'
    });
    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return levelsExperience[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const validateClassCode = (code) => {
            return code.includes('public class Egg {');
        };

        if (!validateClassCode(classCode)) {
            invalidations.push(Invalidations.INVALID_CLASS_STRUCTURE);
            res.json({
                error: 'The class does not match the expected structure.',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        validations.push(Validations.VALID_CLASS_STRUCTURE);

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
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
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 1:', error);
        res.status(401).send('Unauthorized');
    }
});



app.post('/validate/course/1/2', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_CLASS_STRUCTURE: 'VALID_CLASS_STRUCTURE',
        VALID_ATTRIBUTE_COLOR: 'VALID_ATTRIBUTE_COLOR'
    });

    const Invalidations = Object.freeze({
        INVALID_CLASS_STRUCTURE: 'INVALID_CLASS_STRUCTURE',
        INVALID_ATTRIBUTE_COLOR: 'INVALID_ATTRIBUTE_COLOR'
    });

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return levelsExperience[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        // Validate that the classCode contains the class declaration and the specified attribute
        if (!classCode.includes('public class Egg {')) {
            invalidations.push(Invalidations.INVALID_CLASS_STRUCTURE);
        } else {
            validations.push(Validations.VALID_CLASS_STRUCTURE);
        }

        if (!classCode.includes('private String color;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_COLOR);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_COLOR);
        }

        if (invalidations.length > 0) {
            res.json({
                error: 'The class does not meet the required structure.',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 2 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 2]
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
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 2:', error);
        res.status(401).send('Unauthorized');
    }
});



app.post('/validate/course/1/3', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_CLASS_STRUCTURE: 'VALID_CLASS_STRUCTURE',
        VALID_ATTRIBUTE_COLOR: 'VALID_ATTRIBUTE_COLOR',
        VALID_ATTRIBUTE_HATCHING_DAYS: 'VALID_ATTRIBUTE_HATCHING_DAYS',
        VALID_ATTRIBUTE_WEIGHT: 'VALID_ATTRIBUTE_WEIGHT',
        VALID_ATTRIBUTE_TEMPERATURE: 'VALID_ATTRIBUTE_TEMPERATURE',
        VALID_ATTRIBUTE_HATCH_TEMPERATURE: 'VALID_ATTRIBUTE_HATCH_TEMPERATURE'
    });

    const Invalidations = Object.freeze({
        INVALID_CLASS_STRUCTURE: 'INVALID_CLASS_STRUCTURE',
        INVALID_ATTRIBUTE_COLOR: 'INVALID_ATTRIBUTE_COLOR',
        INVALID_ATTRIBUTE_HATCHING_DAYS: 'INVALID_ATTRIBUTE_HATCHING_DAYS',
        INVALID_ATTRIBUTE_WEIGHT: 'INVALID_ATTRIBUTE_WEIGHT',
        INVALID_ATTRIBUTE_TEMPERATURE: 'INVALID_ATTRIBUTE_TEMPERATURE',
        INVALID_ATTRIBUTE_HATCH_TEMPERATURE: 'INVALID_ATTRIBUTE_HATCH_TEMPERATURE'
    });

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 60;
        return levelsExperience[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        // Validate specific class declaration
        if (!classCode.includes('public class Egg {')) {
            invalidations.push(Invalidations.INVALID_CLASS_STRUCTURE);
        } else {
            validations.push(Validations.VALID_CLASS_STRUCTURE);
        }

        // Validate required fields
        if (!classCode.includes('private String color;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_COLOR);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_COLOR);
        }

        if (!classCode.includes('private int hatchingDays;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_HATCHING_DAYS);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_HATCHING_DAYS);
        }

        if (!classCode.includes('private double weight;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_WEIGHT);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_WEIGHT);
        }

        if (!classCode.includes('private double temperature;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_TEMPERATURE);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_TEMPERATURE);
        }

        if (!classCode.includes('private double hatchTemperature;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_HATCH_TEMPERATURE);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_HATCH_TEMPERATURE);
        }

        if (invalidations.length > 0) {
            res.json({
                error: 'The class does not meet the required structure.',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 3 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 3]
        };

        userProfile = {
            ...userProfile,
            profile: {
                ...userProfile.profile,
                level: xpAlreadyAccredited ? userProfile.profile.level : resolveNextLevel(userProfile),
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 60
            },
            progress: {
                ...userProfile.progress,
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 3:', error);
        res.status(401).send('Unauthorized');
    }
});


app.post('/validate/course/1/4', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_CLASS_STRUCTURE: 'VALID_CLASS_STRUCTURE'
    });

    const Invalidations = Object.freeze({
        INVALID_CLASS_STRUCTURE: 'INVALID_CLASS_STRUCTURE'
    });

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return levelsExperience[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        // Validate specific class declaration
        if (!classCode.includes('public class Terrestrial {')) {
            invalidations.push(Invalidations.INVALID_CLASS_STRUCTURE);
        } else {
            validations.push(Validations.VALID_CLASS_STRUCTURE);
        }

        if (invalidations.length > 0) {
            res.json({
                error: 'The class does not match the expected structure.',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 4 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 4]
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
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 4:', error);
        res.status(401).send('Unauthorized');
    }
});

app.post('/validate/course/1/5', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;
    let validations = [];
    let invalidations = [];

    const Validations = Object.freeze({
        VALID_CLASS_STRUCTURE: 'VALID_CLASS_STRUCTURE',
        VALID_ATTRIBUTE_NAME: 'VALID_ATTRIBUTE_NAME'
    });

    const Invalidations = Object.freeze({
        INVALID_CLASS_STRUCTURE: 'INVALID_CLASS_STRUCTURE',
        INVALID_ATTRIBUTE_NAME: 'INVALID_ATTRIBUTE_NAME'
    });

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return levelsExperience[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        // Validate specific class declaration and required attribute
        if (!classCode.includes('public class Terrestrial {')) {
            invalidations.push(Invalidations.INVALID_CLASS_STRUCTURE);
        } else {
            validations.push(Validations.VALID_CLASS_STRUCTURE);
        }

        if (!classCode.includes('private String name;')) {
            invalidations.push(Invalidations.INVALID_ATTRIBUTE_NAME);
        } else {
            validations.push(Validations.VALID_ATTRIBUTE_NAME);
        }

        if (invalidations.length > 0) {
            res.json({
                error: 'The class does not meet the required structure.',
                userProfile,
                validations,
                invalidations
            });
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 5 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 5]
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
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json({
            userProfile,
            validations,
            invalidations
        });
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 5:', error);
        res.status(401).send('Unauthorized');
    }
});

app.post('/validate/course/1/6', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];
    let xpAlreadyAccredited = false;

    function resolveNextLevel(userProfile) {
        let nextXP = userProfile.profile.current_xp + 20;
        return levelsExperience[userProfile.profile.level] <= nextXP ? userProfile.profile.level + 1 : userProfile.profile.level;
    }

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const requiredAttributes = [
            'private String name;',
            'private String favoriteFood;',
            'private int birthDay;',
            'private int birthMonth;',
            'private int birthYear;',
            'private int legs;',
            'private int eyes;',
            'private int antennae;',
            'private double weight;',
            'private double height;'
        ];

        const classHeader = 'public class Terrestrial {';

        // Check if the class starts with the correct header and ends with a closing brace
        if (!classCode.startsWith(classHeader) || !classCode.trim().endsWith('}')) {
            res.json({error: 'The class does not meet the required structure.'});
            return;
        }

        // Check if all required attributes are present in the classCode
        const allAttributesPresent = requiredAttributes.every(attr => classCode.includes(attr));

        if (!allAttributesPresent) {
            res.json({error: 'The class does not meet the required structure.'});
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        let subLevelAlreadyDone = firstCourse.completed_sub_levels.find((sublevelNumber) => {
            return 6 === sublevelNumber;
        }) !== undefined;
        if (subLevelAlreadyDone) {
            xpAlreadyAccredited = true;
        }
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: subLevelAlreadyDone ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 6]
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
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);
        userProfile.profile.total_xp = levelsExperience[userProfile.profile.level];

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 6:', error);
        res.status(401).send('Unauthorized');
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


async function getUserProfileFromDatabase(uid) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
        return null;
    }

    return doc.data();
}

const TheoreticalGrades = Object.freeze({
    NONE: 'NONE',
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD'
});

const SubLevelsGrades = Object.freeze({
    NONE: 'NONE',
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD'
});

async function createNewUserProfile(uid, email) {
    const newUserProfile = {
        email: email,
        id: uid,
        profile: {
            avatar: "default_avatar",
            level: 1,
            current_xp: 0,
            total_xp: 150,
            badges: []
        },
        progress: {
            goals: [
                {
                    description: "Conocer conceptos de clase, instancia y tipos de atributos.",
                },
                {
                    description: "Conocer conceptos de clase, instancia y tipos de atributos.",
                },
                {
                    description: "Conocer conceptos de clase, instancia y tipos de atributos.",
                },
                {
                    description: "Conocer conceptos de clase, instancia y tipos de atributos.",
                }
            ],
            courses: globalCoursesData.map(course => ({
                id: course.id,
                current: 1,
                completed_sub_levels: [],
                theoretical: {
                    grade: TheoreticalGrades.NONE,
                    score: {
                        current: 0,
                        total: 0
                    }
                }
            }))
        }
    };

    const userRef = db.collection('users').doc(uid);
    await userRef.set(newUserProfile);

    return newUserProfile;
}

function mergeCoursesWithProgress(globalCourses, userProgress) {
    return globalCourses.map(course => {
        const userCourse = userProgress.find(c => c.id === course.id) || {id: course.id, current: 1};
        return {
            ...course,
            current: userCourse.current,
            completed_sub_levels: userCourse.completed_sub_levels,
            theoretical: userCourse.theoretical
        };
    });
}
