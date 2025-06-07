// js/modules/state.js

const state = {
    loggedInUserName: sessionStorage.getItem('userName'),
    isAdmin: sessionStorage.getItem('isAdmin') === 'true'
};

export function getUserName() {
    return state.loggedInUserName;
}

export function isAdminUser() {
    return state.isAdmin;
}

export function setUserSession(userName, isAdmin) {
    state.loggedInUserName = userName;
    state.isAdmin = isAdmin;
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('isAdmin', isAdmin);
}

export function clearUserSession() {
    state.loggedInUserName = null;
    state.isAdmin = false;
    sessionStorage.clear();
}