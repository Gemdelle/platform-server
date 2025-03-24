const {db} = require('../firebaseConfig');

let globalJavaCoursesData = [];
let globalPythonCoursesData = [];

let levelsExperience = {
    1: 150,
    2: 500
}

let coursesAvailability = {
    "java": true,
    "python": true
}

function getGlobalJavaCourses() {
    return globalJavaCoursesData;
}

function getGlobalPythonCourses() {
    return globalPythonCoursesData;
}

function getCoursesAvailability() {
    return coursesAvailability;
}

function getLevelsExperience() {
    return levelsExperience;
}

async function fetchCoursesData() {
    try {
        const coursesJavaSnapshot = await db.collection('courses').get();
        globalJavaCoursesData = coursesJavaSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const coursesPythonSnapshot = await db.collection('courses_python').get();
        globalPythonCoursesData = coursesPythonSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (error) {
        console.error('Error fetching courses data:', error);
    }
}

async function getUserProfileFromDatabase(uid) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
        return null;
    }

    return doc.data();
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


module.exports = {
    getUserProfileFromDatabase,
    mergeCoursesWithProgress,
    fetchCoursesData,
    getLevelsExperience,
    getCoursesAvailability,
    getGlobalJavaCourses,
    getGlobalPythonCourses
};