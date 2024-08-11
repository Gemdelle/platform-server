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
                current_xp: xpAlreadyAccredited ? userProfile.profile.current_xp : userProfile.profile.current_xp + 50
            },
            progress: {
                ...userProfile.progress,
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);

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

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const requiredFields = [
            'private String name;',
            'private double weight;',
            'private double height;',
            'private int birthDay;',
            'private int birthMonth;',
            'private int birthYear;',
            'private int legs;',
            'private int eyes;',
            'private int antennae;'
        ];

        const validateClassCode = (code, fields) => {
            return fields.every(field => code.includes(field));
        };

        if (!validateClassCode(classCode, requiredFields)) {
            res.json({error: 'The class does not contain all the required attributes.'});
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: firstCourse.completed_sub_levels.find((sublevelNumber) => {
                return 1 === sublevelNumber
            }) !== undefined ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 1]
        };

        userProfile = {
            ...userProfile,
            progress: {
                ...userProfile.progress,
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 1:', error);
        res.status(401).send('Unauthorized');
    }
});

app.post('/validate/course/1/2', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const requiredFields = [
            'private String name;',
            'private double weight;',
            'private double height;',
            'private int birthDay;',
            'private int birthMonth;',
            'private int birthYear;',
            'private int legs;',
            'private int eyes;',
            'private int fins;',
            'private int tails;'
        ];

        const validateClassCode = (code, fields) => {
            return fields.every(field => code.includes(field));
        };

        if (!validateClassCode(classCode, requiredFields)) {
            res.json({error: 'The class does not contain all the required attributes.'});
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: firstCourse.completed_sub_levels.find((sublevelNumber) => {
                return 2 === sublevelNumber
            }) !== undefined ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 2]
        };

        userProfile = {
            ...userProfile,
            progress: {
                ...userProfile.progress,
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 1:', error);
        res.status(401).send('Unauthorized');
    }
});


app.post('/validate/course/1/3', async (req, res) => {
    const classCode = req.body.class_code;
    const uid = req.headers.authorization.split('Bearer ')[1];

    try {
        let userProfile = await getUserProfileFromDatabase(uid);

        const requiredFields = [
            'private String name;',
            'private double weight;',
            'private double height;',
            'private int birthDay;',
            'private int birthMonth;',
            'private int birthYear;',
            'private int legs;',
            'private int arms;',
            'private int eyes;',
            'private int wings;',
            'private int tails;'
        ];

        const validateClassCode = (code, fields) => {
            return fields.every(field => code.includes(field));
        };

        if (!validateClassCode(classCode, requiredFields)) {
            res.json({error: 'The class does not contain all the required attributes.'});
            return;
        }

        const [firstCourse, ...otherCourses] = userProfile.progress.courses;
        const updatedFirstCourse = {
            ...firstCourse,
            current: firstCourse.current + 1,
            completed_sub_levels: firstCourse.completed_sub_levels.find((sublevelNumber) => {
                return 3 === sublevelNumber
            }) !== undefined ? firstCourse.completed_sub_levels : [...firstCourse.completed_sub_levels, 3]
        };

        userProfile = {
            ...userProfile,
            progress: {
                ...userProfile.progress,
                courses: [updatedFirstCourse, ...otherCourses]
            }
        };

        userProfile.progress.courses = mergeCoursesWithProgress(globalCoursesData, userProfile.progress.courses);

        const userRef = db.collection('users').doc(uid);
        await userRef.set(userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error verifying token or validating course 1 sublevel 1:', error);
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
