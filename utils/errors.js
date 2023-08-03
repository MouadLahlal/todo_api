var errors = {
    global : {
        /**
         * Must be used for errors during the connection with the database
         */
        connError : "An error occured while getting a connection with the database.",
        /**
         * Must be used when there is errors throwed after executing a query
         */
        queryError : "An error occured while executing a query.",
        /**
         * Must be used when there aren't required data in the request
         */
        dataError : "Required data hasn't been provided."
    },
    auth : {
        /**
         * Must be used when given credentials aren't valid
         */
        loginFail : "You provided wrong username and/or password.",
        /**
         * Must be used when given token is not valid at all.
         */
        tokenNotFound : "You're token is not valid.",
        /**
         * Must be used whene given token is valid but is expired.
         */
        tokenExpired : "You're token is expired.",
        /**
         * Must be used when the singup process fails.
         */
        signupFail : "An error occured while creating your account."
    },
    lists : {
        /**
         * 
         */
        noListFound : "No list found in your account.",
        noTaskFound : "No task found in that list.",
    },
    stats : {},
    tasks : {
        taskNotFound : "The task doesn't exist.",
        taskAlreadyDone : "The task is already done.",
        taskAlreadyUndone : "The task is already undone.",
    }
}

module.exports = errors;