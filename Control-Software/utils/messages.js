//const moment = require('moment');

import moment from "moment";

function formatMessage(username, text){
    return {
        username, text, time: moment().format('H:mm')
    };
}


export default formatMessage
//module.exports = formatMessage;