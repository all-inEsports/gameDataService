const fetch = require('node-fetch');
const Url = require('url').URL;
const apiUrl = 'https://bettingserviceallin.herokuapp.com/'
module.exports = {
    getBetsById : async (matchId) =>{
        try{
            const route= `v1/match/bets/${matchId}`
            let res = await fetch(new Url(apiUrl+route));
            return await res.json();
        }
        catch(err) {
            console.log(err);
        }

    },
    resolveBets : async (betId,bet) => {
        try{
            const route= `v1/bet/resolve/${betId}`
            let res = await fetch((new Url(apiUrl+route)),{method:'PUT',body:bet});
            let msg = (await res.json())?.message.toString();

            if(msg.indexOf('error')>-1){
                throw msg;
            }

            console.log(msg);
        }
        catch(err) {
            console.log(err);
        }
    }
}