

function vecDiff(v1, v2) {
    return Math.sqrt(
        vectorSubtract(v1, v2)
            .map(e => Math.pow(e, 2))
            .reduce((acc, val) => acc + val, 0)
    )
}

function randomOnUnitCirlce() {
    let rad = Math.random() * Math.PI * 2;
    let x = Math.cos(rad); //x of einheitskreis
    let y = Math.sin(rad); //y of einheitsKreis
    return [x, y]
}



function parseVectorStrings(data) {
    dat = JSON.parse(JSON.stringify(data)) //don't do this if data is more than 2 layers deep!
    dat.map(d => d.vector = d.vector.split(' '));
    dat.map(d => {
        d.vector[0] = d.vector[0].slice(1);
        d.vector[d.vector.length - 1] = d.vector[d.vector.length - 1].slice(0, -1)
    })
    //data ==> entry.vector ==> entry
    dat.map(d => d.vector = d.vector.filter(s => s !== ""))
    dat.map(d => d.vector = d.vector.map((parseFloat)))
    return dat;
}

function percToUnitCirlce(percentage) {
    let rad = Math.PI * 2 * percentage
    let x = Math.cos(rad); //x of einheitskreis
    let y = Math.sin(rad); //y of einheitsKreis
    return [x, y]
}
function UnitCirlce(percentage) {
    let rad = Math.PI * 2 * percentage
    let x = Math.cos(rad); //x of einheitskreis
    let y = Math.sin(rad); //y of einheitsKreis
    return {x, y}
}

function posForText(center, distance, rnd) {
    return {
        x: center[0] + rnd[0] * distance,
        y: center[1] + rnd[1] * distance
    }
}

function posForCircle(center, distance = 0, rnd) {
    if (distance == 0) {
        rnd = [0, 0]
    }
    return {
        cx: center[0] + rnd[0] * distance,
        cy: center[1] + rnd[1] * distance
    }
}

//make into multi-use Applicatives!!!
function vectorSubtract(V1, V2) {
    return V1.map((e, i) => e - V2[i]);
}

function getData(path) {
    return new Promise(function (resolve, reject) {
        fetch(path)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }
                    // Examine the text in the response
                    response.json().then(function (data) {
                        console.log(data, "data");
                        resolve(data)
                    });
                }
            )
            .catch(function (err) {
                reject();
                console.log('Fetch Error :-S', err);
            });
    })
}