const express = require('express');
const app = express();
require('dotenv').config()
var axios = require('axios');
var cron = require('node-cron');
var moment = require('moment'); 
const res = require('express/lib/response');

let apiToken = process.env.apiToken
let urlUser = process.env.urlUser

const PORT = 1800;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

/* AXIOS HTTP Method and definitions of leads to call */
let LeadsAll = []
let idLeadsToCall = []

/* cron */
cron.schedule('*/1 * * * *', () => {
    console.log('running a  every  minutes');
    apiAxios()
});

function apiAxios () {
    console.log("console log de api")
    var config = {
        method: 'get',
        url: `https://${urlUser}.pipedrive.com/v1/leads?limit=500&start=862&api_token=${apiToken}`,
        headers: { }
        };  
        axios(config)
        .then(function (response) {
        console.log("aditional data",response.data.additional_data)
        LeadsAll = response.data.data 
        })
        .then (function(){
            idLeadsToCall = [] // vaciando el array de laysToCall cada dia antes de comenzar la iteracion
            LeadsAll.forEach(element => {
                if (
                    element.label_ids == "2eb8c750-8b32-11ec-ac0c-2938be6414d0" /* test  */
                    //element.label_ids !== "a153a4e0-8b2f-11ec-b581-5f29cd529551" /* Diferente a estancado para no re-llamar */
                    && new Date (moment().toISOString()) - new Date(element.add_time) >= 1 /* 20160 */
                    ){
                    idLeadsToCall.push(element.id)
                    /* eliminar log */console.log('log de ids to call',idLeadsToCall)
                    } 
            });
        })
        
        .then (function (){
            idLeadsToCall.forEach(idToUpdate => {
                var data = JSON.stringify({
                    // "label_ids": ['a153a4e0-8b2f-11ec-b581-5f29cd529551'] // ID LABEL ESTANCADO
                    "label_ids": ['01da0ea0-8da9-11ec-b9ca-1ba0465c3859']  // test 3 
                    
                });
                    var config = {
                    method: 'patch',
                    url: `https://${urlUser}.pipedrive.com/v1/leads/${idToUpdate}?api_token=${apiToken}`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Cookie': '__cf_bm=D9CpSn090T24Dfmo0uA55LFNBbjxlvsWpWgRSGJz0ns-1644505069-0-AeS5UMlWH7gHGIKSZmziZ6pHnX2f82mahMKLNEKgXR8NoqyZjJfZRPyyq2CwdnuHDc/w6suqLGaxGMJC9jnEPv4='
                    },
                    data : data
                };  
                    axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                })
                    .catch(function (error) {
                        console.log(error);
                    });
            })
        })
        .catch(function (error) {
            console.log(error);
    })
}

