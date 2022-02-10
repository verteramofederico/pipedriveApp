const express = require('express');
const app = express();
var axios = require('axios');
var cron = require('node-cron');
var moment = require('moment'); 

let apiToken = "7f24b6255bb7a017aefb3aeac6e822919e44e8c9"

const PORT = 1800;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

/* AXIOS HTTP Method and definitions of leads to call */
let LeadsAll = []
let idLeadsToCall = []

/* cron */
cron.schedule('*/2 * * * *', () => {
    console.log('running a task every two minutes');
    apiAxios()
    apiAxiosPatch()
});

function apiAxios () {
    console.log("console log de api")
    var config = {
        method: 'get',
        url: `https://gux-sandbox2.pipedrive.com/v1/leads?api_token=${apiToken}`,
        headers: { }
        };  
        axios(config)
        .then(function (response) {
        LeadsAll = response.data.data 
        })
        .then (function(){
            idLeadsToCall = [] // vaciando el array de laysToCall cada dia antes de comenzar la iteracion
            LeadsAll.forEach(element => {
                if (
                    element.label_ids == "dab1516b-a5d9-44f4-bea7-61ce64910395"
                    //element.label_ids == "f0e9f59f-07d5-4e97-b7e3-5aa4815b1f97"
                    && new Date (moment().toISOString()) - new Date(element.add_time) >= 124
                    ){
                    idLeadsToCall.push(element.id)
                    } 
            });
        })
        /* .then (function (){
            idLeadsToCall.forEach(idToUpdate => {
                var data = JSON.stringify({
                    "title": "timeok",
                    "label_ids": ['f0e9f59f-07d5-4e97-b7e3-5aa4815b1f97']   
                    //"label_ids": ['dab1516b-a5d9-44f4-bea7-61ce64910395']            
                });
                    var config = {
                    method: 'patch',
                    url: `https://gux-sandbox2.pipedrive.com/v1/leads/${idToUpdate}?api_token=${apiToken}`,
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
        }) */
        .catch(function (error) {
            console.log(error);
    })
}

function apiAxiosPatch() {
    idLeadsToCall.forEach(idToUpdate => {
        var data = JSON.stringify({
            "title": "timeok",
            "label_ids": ['f0e9f59f-07d5-4e97-b7e3-5aa4815b1f97']   
            //label_ids": ['dab1516b-a5d9-44f4-bea7-61ce64910395']            
        });
            var config = {
            method: 'patch',
            url: `https://gux-sandbox2.pipedrive.com/v1/leads/${idToUpdate}?api_token=${apiToken}`,
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
}