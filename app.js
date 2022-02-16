/* en pase a produccion cambiar: 
1. apitoken variable env
2. urluser variable env
3. cambiar variable startR. (es el punto de inicio del get)
4. minutos en condicion de axios para guardar leads. En test esta en 1, pasar a 20160
5. configurar de cron de horario de ejecucion de la funcion diaria
6. id de label ESTANCADO. Dos veces, primero en condicion del get y luego en el POST. 
El id label estancado de flux es a153a4e0-8b2f-11ec-b581-5f29cd529551
*/

const express = require('express');
const app = express();
require('dotenv').config()
var axios = require('axios');
var cron = require('node-cron');
var moment = require('moment'); 


let apiToken = process.env.apiTokenSandbox   // actualizar en produccion
let urlUser = process.env.urlUserSandBox // actualizar en produccion

const PORT = 1800;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

/* AXIOS HTTP Method and definitions of leads to call */
let LeadsAll = []
let idLeadsToCall = []
let repeat = true
let startR = 0 // luego en produccion cambiar a 750


/* cron */
cron.schedule('0 11 * * *', () => {
    console.log('running every day 11am');
    apiAxios()
})

function apiAxios () {
    var config = {
        method: 'get',
        url: `https://${urlUser}.pipedrive.com/v1/leads?limit=500&start=${startR}&api_token=${apiToken}`,
        headers: { }
        };  
        axios(config)
        .then(function (response) {
        repeat=response.data.additional_data.pagination.more_items_in_collection
        LeadsAll = response.data.data 
        })
        .then (function(){
            idLeadsToCall = [] // vaciando el array de laysToCall cada dia antes de comenzar la iteracion
            LeadsAll.forEach(element => {
                if (       
                    // Diferente a estancado para no re-llamar
                    element.label_ids.includes("70971a10-8e88-11ec-bff3-dd2859c94d82") == false
                    // doble check, que no tenga otro label, eso significaria en gestion
                    && element.label_ids.length == 0
                    // tiempo mayor a 14 dias
                    && (new Date (moment().toISOString()) - new Date(element.add_time)) /1000 / 60 >= 1 // en prod. cambiar el minuto por 20160

                    ){
                    // si cumple las 3 condiciones integran el siguiente array para ser modificados en el siguiente .then
                    idLeadsToCall.push(element.id)
                    } 
            })
        })     
        .then (function (){
            idLeadsToCall.forEach(idToUpdate => {
                var data = JSON.stringify({
                    "label_ids": ['70971a10-8e88-11ec-bff3-dd2859c94d82'] // 
                    // "label_ids": ['a153a4e0-8b2f-11ec-b581-5f29cd529551'] // FLUX ID LABEL ESTANCADO
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
        .then (function () {
            // si la api comunica que aun quedan paginas para consultar repite funcion con pagina siguiente, si no termina el ciclo
            if (repeat) {
                startR = startR + 1
                return apiAxios()}
            else {
                null
            }
        })
        .catch(function (error) {
            console.log(error);
    })
}

