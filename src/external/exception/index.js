module.exports = class TimeOutException extends Error {
    constructor(){
        super("Timeout exceeded");
        this.name = "TimeOutException"
    }
}