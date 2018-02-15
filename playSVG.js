const draw = new SVG('container').size(window.innerWidth, window.innerHeight);
const SEARCH = document.getElementById('searchInput')

let CENTER = screenCenter(window);
CENTER.diff = function (otherPos) {
    return {x: CENTER.x - otherPos.x, y: CENTER.y - otherPos.y}
};
SEARCH.addEventListener('keypress', function (e) {
    key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter\n'
        //update();
        searchInput(SEARCH.value);
        SEARCH.value = "";
        updatePreviousWordsDiv()
    }
})

function linkField(linkName, readers =[], link ="jajaja") {
    const lField = document.createElement('div')
    lField.setAttribute('class', "linkField")
    const a = document.createElement('a')
    a.setAttribute('href', link)

    const lName = document.createElement('div')
    lName.setAttribute('class', "link")
    lName.textContent = linkName;

    // const rBy = document.createElement('div');
    // rBy.setAttribute('class', 'readBy')
    //
    // const readrs = readers.map(person => {
    //     const r = document.createElement('div')
    //     r.setAttribute('class', 'reader')
    //     r.textContent = person;
    //     return r;
    // })
    // Array.from(readrs).map(r => rBy.appendChild(r))
    lName.appendChild(a)

    lField.appendChild(lName)
    // lField.appendChild(rBy)

    return lField;
}

let relevantpapers;
const sel = document.getElementById('myoptions')
let paperConceptDiff;
let concObj
let concPapers
// let selectedUser;

function newPapers(word) {
    // selectedUser = sel.options[sel.selectedIndex].text
    concObj = raw.filter(d => d.word.toLowerCase() === word.toLowerCase())[0];
    concPapers = papersPerConcept(concObj);
    Array.from(document.getElementsByClassName('linkField')).forEach(e=> e.remove());

    concPapers.forEach(e => {
        document.getElementsByClassName('sourceLinks')[0].appendChild(linkField(e.slice(0, -4)))
    })
}

function searchInput(word) {
    if (word.split('&&').length===1) {
        previousTags = [];

        // currentConcepts = word.split('&&');
        // const selectedUser = sel.options[sel.selectedIndex].text
        // relevantpapers=getPapersForConceptDiff(currentConcepts, raw);
        // paperConceptDiff = arrOverlap(relevantpapers);
        //
        // const paperFin = overlapUserAndPapers(paperConceptDiff, selectedUser)
        // console.log(paperFin, 'Papers Final')

       newPapers(word)

        // linkField()
        focus = concObj;
        console.log(focus, word, "asdas")
        focus.distance = 0;
        updateAll(focus)
    }
}

let previousWords = [];
let allUserswithPapers;

let currentPapers = [];
let currentConcepts = [];

function updatePreviousWordsDiv(prevWords = previousWords, and = false) {
    let str = prevWords.reduce((acc, val) => acc + val + " --> ", "");
    if (typeof prevWords === 'string') {
        str = prevWords;
    }
    document.getElementById('previousWords').textContent = str;
}

function isProbablyName(searchText, names) {
    return names.includes(searchText);
}

function setOptions(options) {
    var select = document.getElementById('myoptions');
    let i = 0;
    for (let user in allUserswithPapers) {
        select.options[i] = new Option(user, i);  //new Option("Text", "Value")
        i++;
    }
}

function getAllNames(data){
    const paths = data.map(d=> d.from);
    return Array.from(new Set(paths.map(f => f.map(parsePath_reader_paper(f).reader))))
}


// const AllpapersWithReaders = extractPapersWithReaders(dat)

function extractPapersWithReaders(data) {
    const papers = {};
    for (let d of data) {
        for (let path of d.from) {
            const reader = path.split('/')[1]
            const pap = path.split('/')[0]

            if (!papers[pap]) {
                papers[pap] = new Set();

            }
            papers[pap].add(reader)
        }
    }
    return papers;
}

function overlapUserAndPapers(papers, user) {

    return papers.filter(p => user.has(p)).length > 0;
}

function papersPerConcept(d) {
    const papers = [];
    d.from.map(f => papers.push(f.split('/')[1]));
    return papers;
}
function readersPerConcept(d) {
    const readers = [];
    d.from.map(f => readers.push(f.split('/')[0]));
    return readers;
}



function getPapersForConceptDiff(concepts, data) {
    const objs = data.filter(d => concepts.includes(d.word))
    const commonPapers = [];
    objs.forEach(f => commonPapers.push(papersPerConcept(f)))
    return commonPapers;
}


function parsePath_reader_paper(path) {
    const str = path.split('/');
    return {reader: str[0], paper: str[0]}
}

//shift click = && concept


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

                        allUserswithPapers= extractPapersWithReaders(raw);
                        setOptions(allUserswithPapers)
                        const allNames = new Set();
                        resolve(dataAcc)
                        return
                    }

// Examine the text in the response
                    response.json().then(function (partialData) {
                        console.log(partialData, path);
                        const next = ending + 1;

                        // ----- IN GLOBAL SCOPE _)))W HAHAHAH deadlines...
                        let parsedData = parseVectorStrings(partialData);
                        const mergedData = dataAcc.concat(parsedData);

                        raw = mergedData;

                        //----

                        resolve(dat) //for the first .then to load images
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

// window.addEventListener('resize', function () {
//     CENTER = screenCenter(window)
// })


function screenCenter() {
    return {x: window.innerWidth / 2, y: window.innerHeight / 2}
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
        d.distance *= 900;
        // d.distance += 40;
        // d.screenDist = (d.distance * 2100);
    }
    return d;
}

function arrOverlap(arr1, arr2) {
    return arr1.filter(function (n) {
        return arr2.indexOf(n) !== -1;
    });
}

//TODO: drop shadows
//      history timelines
//      venn diagramming / only show tag overlaps

getDataSequentially().then(firstData => {
    // raw = JSON.parse(JSON.stringify(rawData))
    raw = firstData;

    // raw = raw.slice(0, 1000);
    //100 = vector lengthß
    focus = raw[5];

    //assignWordDistance

    updateData(focus, raw);


    circles = data.map(d => draw.circle(40)
        .attr(x_cx(CENTER.diff(d.pos)))
        .addClass('circles'));

    textBackgrounds = data
        .map(d => draw.rect(Math.sqrt(d.word.length) * 30, 20)
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
        newPapers(c.data.word)
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
        c.animate(duration).move(CENTER.x, CENTER.y).radius(12)
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

