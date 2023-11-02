/*
    npm i xhr2
*/
const XMLHttpRequest = require('xhr2');
const http = require('https');
const fs = require('fs');

let email = "";
let password = "";
let token = 'Bearer eyJhbGciO...';

//getToken();
getActivities();

function getToken() {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function () {
        //const data = JSON.parse(this.responseText);

        console.log(this.responseText);
    }

    let body = {};
    body.email = email;
    body.password = password;
    body.grant_type = "password";
    body.client_id = "Developer Client";

    xmlhttp.open("POST", "https://secure.zwift.com/auth/realms/zwift/tokens/access/codes");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(body));
}

function getActivities() {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function () {
        const data = JSON.parse(this.responseText);

        for (let n = 0; n < data.length; n++) {
            getFitFiles(data[n].id_str);
        }

        getMoreActivities(data[data.length - 1].id_str);
    }

    xmlhttp.open("GET", "https://us-or-rly101.zwift.com/api/activity-feed/feed/?limit=30&includeInProgress=false&feedType=JUST_ME");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Authorization", token);
    xmlhttp.send();
}

function getMoreActivities(id_str) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function () {
        const data = JSON.parse(this.responseText);

        for (let n = 0; n < data.length; n++) {
            getFitFiles(data[n].id_str)
        }

        if (data.length == 30) {
            getMoreActivities(data[data.length - 1].id_str);
        }
    }

    xmlhttp.open("GET", "https://us-or-rly101.zwift.com/api/activity-feed/feed/?limit=30&includeInProgress=false&feedType=JUST_ME&start_after_activity_id=" + id_str);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Authorization", token);
    xmlhttp.send();
}

function getFitFiles(id_str) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function () {
        const data = JSON.parse(this.responseText);

        //console.log("https://" + data.fitFileBucket + ".s3.amazonaws.com/" + data.fitFileKey);
        doanloadFitFile("https://" + data.fitFileBucket + ".s3.amazonaws.com/" + data.fitFileKey);
    }

    xmlhttp.open("GET", "https://us-or-rly101.zwift.com/api/activities/" + id_str);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Authorization", token);
    xmlhttp.send();
}

function doanloadFitFile(url) {

    console.log(url);

    const file = fs.createWriteStream("fit-files/" + url.split("/")[5] + ".fit");
    const request = http.get(url, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });
}