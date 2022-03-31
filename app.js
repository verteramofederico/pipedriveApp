const express = require("express");
const app = express();
require("dotenv").config();
var axios = require("axios");
var cron = require("node-cron");
var moment = require("moment");

let apiToken = process.env.apiToken; 
let urlUser = process.env.urlUser;
let labelRecuperacion = process.env.labelRecuperacion; 
let labelEstancado = process.env.labelEstancado 

const PORT = 1800;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

let LeadsAll = [];
let idLeadsToCall = [];
let repeat = true;
let startR = 2402

/* timer call the 2 functions (24hs and 72) */
cron.schedule(
  "15 10 * * *",
  () => {
    console.log("running every day 8am");
    apiAxios();
    apiAxios72hs()
  },
  {
    scheduled: true,
    timezone: "America/Santiago",
  }
);

function apiAxios() {
  var config = {
    method: "get",
    url: `https://${urlUser}.pipedrive.com/v1/leads?limit=500&start=${startR}&api_token=${apiToken}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      repeat = response.data.additional_data.pagination.more_items_in_collection;
      LeadsAll = response.data.data;
    })
    .then(function () {
      idLeadsToCall = []; // vaciando el array de laysToCall cada dia antes de comenzar la iteracion
      LeadsAll.forEach((element) => {
        if (
          // Diferente a estancado para no re-llamar
          element.label_ids.includes(`${labelEstancado}`) == false &&
          // doble check, que no tenga otro label, eso significaria en gestion 
          element.label_ids.length == 0 &&
          // tiempo mayor a 1 dias
          (new Date(moment().toISOString()) - new Date(element.add_time)) /
            1000 / 60 >= 1440 // (24hs)
        ) {
          // si cumple las 3 condiciones integran el siguiente array para ser modificados en el siguiente .then
          idLeadsToCall.push(element.id);
        }
      });
    })
    .then(function () {
      idLeadsToCall.forEach((idToUpdate) => {
        var data = JSON.stringify({
          label_ids: [`${labelEstancado}`] 
        });
        var config = {
          method: "patch",
          url: `https://${urlUser}.pipedrive.com/v1/leads/${idToUpdate}?api_token=${apiToken}`,
          headers: {
            "Content-Type": "application/json",
            Cookie:
              "__cf_bm=D9CpSn090T24Dfmo0uA55LFNBbjxlvsWpWgRSGJz0ns-1644505069-0-AeS5UMlWH7gHGIKSZmziZ6pHnX2f82mahMKLNEKgXR8NoqyZjJfZRPyyq2CwdnuHDc/w6suqLGaxGMJC9jnEPv4=",
          },
          data: data,
        };
        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    })
    .then(function () {
      // si la api comunica que aun quedan paginas para consultar repite funcion con pagina siguiente, si no termina el ciclo
      if (repeat) {
        startR = startR + 1;
        return apiAxios();
      } else {
        null;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function apiAxios72hs() {
  var config = {
    method: "get",
    url: `https://${urlUser}.pipedrive.com/v1/leads?limit=500&start=${startR}&api_token=${apiToken}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      repeat =
        response.data.additional_data.pagination.more_items_in_collection;
      LeadsAll = response.data.data;
    })
    .then(function () {
      idLeadsToCall = []; // vaciando el array de laysToCall cada dia antes de comenzar la iteracion
      LeadsAll.forEach((element) => {
        if (
          // Igual a estancado
          element.label_ids.includes(`${labelEstancado}`) ==
            true &&
          // tiempo mayor a 3 dias
          (new Date(moment().toISOString()) - new Date(element.add_time)) /
            1000 / 60 >= 4320 // (72hs)
        ) {
          // si cumple las 2 condiciones integran el siguiente array para ser modificados en el siguiente .then
          idLeadsToCall.push(element.id);
        }
      });
    })
    .then(function () {
      idLeadsToCall.forEach((idToUpdate) => {
        var data = JSON.stringify({
          label_ids: [`${labelRecuperacion}`], 
        });
        var config = {
          method: "patch",
          url: `https://${urlUser}.pipedrive.com/v1/leads/${idToUpdate}?api_token=${apiToken}`,
          headers: {
            "Content-Type": "application/json",
            Cookie:
              "__cf_bm=D9CpSn090T24Dfmo0uA55LFNBbjxlvsWpWgRSGJz0ns-1644505069-0-AeS5UMlWH7gHGIKSZmziZ6pHnX2f82mahMKLNEKgXR8NoqyZjJfZRPyyq2CwdnuHDc/w6suqLGaxGMJC9jnEPv4=",
          },
          data: data,
        };
        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    })
    .then(function () {
      // si la api comunica que aun quedan paginas para consultar repite funcion con pagina siguiente, si no termina el ciclo
      if (repeat) {
        startR = startR + 1;
        return apiAxios();
      } else {
        null;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}
