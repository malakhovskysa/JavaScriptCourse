'use strict';

const LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('./input/dataSet3.csv');

const data = [];


lr.on('error', function (err) {
    // 'err' contains error object
});

lr.on('line', function (line) {
    // pause emitting of lines...
    lr.pause();

    // ...do your asynchronous line processing..
    setTimeout(function () {
        // ...and continue emitting lines.
        data.push(line);
        lr.resume();
    }, 10);
});

lr.on('end', function () {
    // All lines are read, file is closed now.
    main();
});

/**********************************/

const COUNT_LINE_ELEMENTS = 19;
const TWEET_ELEMENTS_SPLITTER = ";";

// Tweet contet postion:
const MESSAGE_POSITION = 6;

// Tweet author postion:
const AUTHOR_POSITION = 4;

// Tweet author postion:
const RT_POSITION = 8;

// Tweet country postion:
const COUNTRY_POSITION = 11;

// Tweet fpollowers postion:
const FOLLOWERS_POSITION = 14;


function main() {
    // Пропускаем строку заголовка
    data.shift();

    Promise.all(data.map(runTasks))
        .then((result) => {
            let res = result.reduce((sum, arrVal) => {
                for (let k in arrVal) {
                    if (sum[k] != undefined) {
                        sum[k] += arrVal[k]
                    } else {
                        sum[k] = 1;
                    }
                }
                return sum;
            }, []);
            return res;
        })
        .then((result) => {
            getTop(10, result, "10 наиболее часто встречающихся слов.");
            return 1;
        })
        .catch(error => {
            console.log(error)
        });


}

function runTasks(tweet) {
    let part = tweet.split(TWEET_ELEMENTS_SPLITTER);
    let res = taskFindWords(part[MESSAGE_POSITION]);
    return res;
}


/**
 * 10 наиболее часто встречающихся слов.
 */
function taskFindWords(str) {
    let res = [];
    let words = str.split(" ");
    //Если ретвит
    if (words[0] == "RT") return res;

    for (let word of words) {
        let w = getWord(word);
        // Если пусто, или не буква, или url
        if (w == "" || w < "a" || w > "z" || ~w.indexOf("/")) continue;
        if (res[w] != undefined) {
            ++res[w];
        } else {
            res[w] = 1;
        }
    }
    return res;
}

// TODO: костыль, заменить на регулярное выражение
function getWord(word) {
    let res = word.toLowerCase();
    res = res.replace(",", "");
    res = res.replace(".", "");
    res = res.replace("!", "");
    res = res.replace("?", "");
    res = res.replace("(", "");
    res = res.replace(")", "");
    res = res.replace('"', "");
    res = res.replace("#", "");
    res = res.replace("@", "");
    res = res.replace(":", "");
    res = res.replace("'", "");
    return res;
}


function getTop(top, arr, mes) {
    console.log(Object.keys(arr).length);
    if (Object.keys(arr).length<= top) {
        console.log(arr);
        return;
    }
    let tempArr = [];

    for (let key in arr) {
        let val = arr[key];
        // console.log(val);

        let flagAdding = false;
        for (let j in tempArr) {
            // console.log(val + " " + arr[tempArr[j]]);
            if (val >= arr[tempArr[j]]) {
                tempArr.splice(j, 0, key);
                flagAdding = true;
                break;
            }
            if (j > top) {
                break;
            }
        }
        if (!flagAdding && tempArr.length < top) {
            tempArr[tempArr.length] = key;
        }
        // console.log(" ");
        // Оптимизация: удаляем лишние элементы массива
        if (tempArr.length > top) {
            for (let j = top; j < tempArr.length; ++j) {
                tempArr.pop();
            }
        }
    }

    let res = [];
    for (let i in tempArr) {
        res[i] = tempArr[i] + " " + arr[tempArr[i]];
    }
    console.log(mes);
    console.log(res);
    return;
}


/*
 1. 10 наиболее часто встречающихся слов.
 2. 10 наиболее популярных твитов, их авторов и сколько раз они были ретвитнуты.
 3. 10 самых популярных авторов.
 4. Информацио о странах, в которых пользователи создают контент (твиты) и в которых его потребляют (ретвитят).
 */