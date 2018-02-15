const draw = new SVG('container').size(window.innerWidth, window.innerHeight);
const SEARCH = document.getElementById('searchInput')
SEARCH.addEventListener('keypress', function (e) {
    key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter\n'
        //update();
        searchInput(SEARCH.value);
        SEARCH.value = "";


    }
})

function searchInput(word) {
    previousTags = [];
    focus = raw.filter(d => d.word.toLowerCase() === word.toLowerCase())[0];
    console.log(focus, word, "asdas")
    focus.distance = 0;
    updateAll(focus)
}

let previousWords = [];


const gradYellowOrange = draw.gradient('linear', function (stop) {
    stop.at(0, '#ffd87c', 1)
    stop.at(1, '#ff7193', 1)
})
const gradBlueDark = draw.gradient('linear', function (stop) {
    stop.at(0, '#3193ff', 0.9)
    stop.at(1, '#67f2ff', 0.9)
})

const gradPinkPurple = draw.gradient('linear', function (stop) {
    stop.at(0, '#fbaaff', 0.95)
    stop.at(1, '#4f4fff', 0.95)
})

const gradGreen = draw.gradient('linear', function (stop) {
    stop.at(0.3, '#3fffee', 0.75)
    stop.at(1, '#bcff72', 0.95)
})


function getDataSequentially(dataAcc = [], ending = 0, dirName = './data/', prefix = "data",) {
    const path = dirName + prefix + ending.toString() + ".json";
    return new Promise(function (resolve, reject) {
        fetch(path)
            .then(
                function (response) {
                    if (response.status !== 200 && response.status !== 404) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }

                    if (response.status === 404) { //no more files
                        console.log("DONE with ALL", dataAcc)
                        resolve(dataAcc)
                        return
                    }

// Examine the text in the response
                    response.json().then(function (data) {
                        console.log(data, path);
                        const next = ending + 1;
                        // const parsedData = cleanData(data);
                        const mergedData = dataAcc.concat(data);

                        dat = mergedData;
                        getDataSequentially(mergedData, next)
                    });
                }
            )
            .catch(function (err) {
                reject();
                console.log('Fetch Error :-S', err);
            });
    })
}

let data;
let dat;
let raw;
let centerPos = [window.innerWidth / 2, window.innerHeight / 2];
let CENTER = screenCenter(window);
CENTER.diff = function (otherPos) {
    return {x: CENTER.x - otherPos.x, y: CENTER.y - otherPos.y}
};

window.addEventListener('resize', function () {
    CENTER = screenCenter(window)
})


function screenCenter(w = window) {
    return {x: w.innerWidth / 2, y: w.innerHeight / 2}
}

let circles;
let textViews;
let textBackgrounds;
let focusNode;
const MAX_NEIGHBORS = 30;
let focus;


let previousTags = [];

//data.map(spaceOut)

function spaceOut(d) {
    d.screenDist = 0;
    if (d.distance > 0) {
        d.distance *= 2100;
        // d.distance += 40;
        d.screenDist = (d.distance * 2100);
    }
    return d;
}

//TODO: drop shadows
//      history timelines
//      venn diagramming / only show tag overlaps

getData('./data3.json').then(rawData => {
    raw = JSON.parse(JSON.stringify(rawData))
    raw = parseVectorStrings(raw);

    raw = raw.slice(0, 1000);
    //100 = vector lengthß
    focus = raw[5];

    //assignWordDistance

    updateData(focus, raw);


    circles = data.map(d => draw.circle(40)
        .attr(x_cx(CENTER.diff(d.pos)))
        .addClass('circles'));

    textBackgrounds = data
        .map(d => draw.rect(Math.sqrt(d.word.length) * 25, 20)
            .attr(CENTER.diff(d.pos)));
    textBackgrounds.map(e => e.fill(gradBlueDark));
    textBackgrounds.map(e => e.addClass('textBG'))

    textViews = data.map((d) => draw.text(d.word));
    textViews.map(e => {
        e.font(
            {
                family: 'Helvetica',
                size: 12,
                fontWeight: "bold"
            });
        e.attr({fill: "white"})
    });

    circles.map((e, i) => {
        e.fill(gradYellowOrange)
        e.data = data[i]
        e.addClass('circles')
    });
    textViews.map((t, i) => t.data = data[i]);
    //events
    circles.map(c => c.click(function () {
        previousTags.push(c);
        updateAll(c.data);
    }))

    //center Circle / Concept
    setTextWithBG(data);
})


function updateAll(target) {
    focus = target;
    focus.distance = 0;
    updateData(focus, raw);
    updateNodeData();
    textViews.map(t => t.text(t.data.word)) //new subset of RAW data --> new words
    wait(collapseNodes, 700)
        .then(d => wait(expandNodes, 500))
    setTextWithBG(data)
}

function updateData(focus, raw) {
    setFocus(focus, raw)
        .map(spaceOut)         //go from W2Vec distance to screenDistance

    data = raw
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_NEIGHBORS);

    console.log(data, "newdata")
    data.map((d, i, arr) => {
        d.unitPos = UnitCirlce(i / (arr.length - 1));
        return d
    })   //place on a UnitCircle (arbitrarily)
        .map(d => d.pos = {x: d.unitPos.x * d.distance, y: d.unitPos.y * d.distance})    //scale place on UC by distance to center
}

function setTextWithBG(data) {
    data.map((d, i) => {
        const pos = CENTER.diff(d.pos);
        textBackgrounds[i].attr(pos)
            .attr(CENTER.diff(d.pos))
            .size(Math.sqrt(d.word.length) * 25, 20)
        pos.x += 5;
        textViews[i].attr(pos);
    });
}

function setFocus(focus, data) {
    const vf = focus.vector;
    for (let d of data) {
        const v1 = d.vector;
        d.distance = vecDiff(v1, vf)
    }
    return data;
}

function x_cx(pos) {
    const {x, y} = pos;
    return {cx: x, cy: y}
}

function updateNodeData() {
    circles.map((c, i) => c.data = data[i]);
    textViews.map((t, i) => t.data = data[i]);
}

function collapseNodes(duration) {
    textViews.map(t => t.hide());
    textBackgrounds.map(tb => tb.hide())
    circles.map(c => {
        c.animate(duration).move(CENTER.x, CENTER.y - 55).radius(12)
            .after(function () {
                if (c.data.distance === 0) {
                    c.fill(gradGreen)
                }
            })
    })
}

function expandNodes(duration) {
    return new Promise(function (resolve, reject) {
        circles.map(function (c) {
            c.animate(duration).attr(x_cx(CENTER.diff(c.data.pos)))
        })
        window.setTimeout(function () {
            circles.map(e => growth(e))
            textViews.map((t, i) => {
                const pos = CENTER.diff(t.data.pos);
                t.attr(pos)
                textBackgrounds[i].attr(pos);

                if (data[i].distance === 0) {
                    textBackgrounds[i].fill(gradPinkPurple)
                }
            })
            resolve();
        }, duration + 20)

        function growth(c) {
            if (c.data.distance === 0) {
                c.animate(350).radius(45)
            }
            else {
                window.setTimeout(function () {
                    c.animate(450).radius(15 + Math.random() * 5).after(function () {
                        textViews.map(t => t.show());
                        textBackgrounds.map(tb => tb.show())
                    })

                }, 300)
                // if (previousTags.includes(c) && data.map(e=> e.word).includes(c.data.word)) {
                //     c.animate(300).fill("#c989ea");
                // }
            }
        }
    })
}

function wait(fn, timeout = 1500) {
    return new Promise(function (resolve, reject) {
        try {
            fn(timeout);
            window.setTimeout(function () {
                resolve()
            }, timeout + 100)
        }
        catch (error) {
            console.error("Set timeout didn't work, error ==>", error)
            reject();
        }

    })
}

//UTILS

