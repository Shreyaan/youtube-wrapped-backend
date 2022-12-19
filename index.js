"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const { v4: uuidv4 } = require("uuid");
const app = (0, express_1.default)();
const upload = (0, multer_1.default)();
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 4000;
// console.log(main(data));
function YoutubeWrappedCalculator(data) {
    let output = {};
    let numOfVideosRemoved = 0;
    let listOfChannels = {};
    let numOfVideos = 0;
    let numberOfChanels = 0;
    // numOfVideos = data.length;
    let listOfVideos = {};
    let firstVideoOf2022 = {};
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        //   console.log(element.subtitles);
        const timestamp = element.time;
        const year = timestamp.substr(0, 4);
        if (year == `2022`) {
            if (element.header == "YouTube Music") {
            }
            else if (element.header == "YouTube") {
                firstVideoOf2022 = element;
                numOfVideos++;
                if (!element.subtitles) {
                    numOfVideosRemoved++;
                }
                else {
                    if (!listOfChannels[element.subtitles[0].name])
                        listOfChannels[element.subtitles[0].name] = 1;
                    else {
                        listOfChannels[element.subtitles[0].name] =
                            listOfChannels[element.subtitles[0].name] + 1;
                    }
                }
                if (listOfVideos[element.title]) {
                    listOfVideos[element.title] = listOfVideos[element.title] + 1;
                }
                else {
                    listOfVideos[element.title] = 1;
                }
            }
        }
    }
    const sortedChannelsArr = Object.entries(listOfChannels).sort((a, b) => b[1] - a[1]);
    const sortedVidsArray = Object.entries(listOfVideos).sort((a, b) => b[1] - a[1]);
    numberOfChanels = sortedChannelsArr.length;
    const timestamp = firstVideoOf2022.time;
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let ampm = 'AM';
    if (hours >= 12) {
        ampm = 'PM';
        hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    console.log();
    return (output = {
        numOfVideos: numOfVideos,
        numberOfChanels: numberOfChanels,
        numOfVideosRemoved: numOfVideosRemoved,
        topChannels: sortedChannelsArr.slice(0, 21),
        topVids: sortedVidsArray.slice(0, 21),
        firstVideoOf2022: {
            title: firstVideoOf2022.title,
            titleUrl: firstVideoOf2022.titleUrl,
            channel: firstVideoOf2022.subtitles[0].name,
            time: `${day} ${monthNames[month]} ${year} ${hours}:${minutes} ${ampm}`
        }
    });
}
// app .get / should return a welcome message in html p tag with the text "Welcome to the Youtube Wrapped API to use go to link in a tag localhost:4000 "
app.get("/", (req, res) => {
    res.send(`<p>
    Welcome to the Youtube Wrapped
    To use it go <a href="https://youtube-wrapped.anosher.com/">here</a>
</p>`);
});
// app .post /api/uploadjson should accept a json file and return the data in the json file in the response
app.post("/api/uploadjson", upload.single("jsonFile"), (req, res) => {
    const file = req.file;
    // console.log(file);
    if (file) {
        const fileName = `/tmp/${uuidv4()}.json`;
        fs.writeFile(fileName, file.buffer, "utf8", (err) => {
            if (err) {
                // handle error
                return res.status(500).send({ message: "Error writing file" });
            }
            //   let rawdata = fs.readFileSync(file);
            fs.readFile(fileName, "utf8", (err, data) => {
                if (err) {
                    // handle error
                    return res.status(500).send({ message: "Error reading file" });
                }
                // parse the JSON data
                try {
                    const jsonData = JSON.parse(data);
                    let youtubeWrappedData = YoutubeWrappedCalculator(jsonData);
                    // console.log(jsonData);
                    return res
                        .status(200)
                        .send({ status: "success", message: youtubeWrappedData });
                }
                catch (error) {
                    // handle error
                    return res.status(400).send({ status: "error", errorMsg: error });
                }
            });
            // delete the temporary file
            fs.unlink(fileName, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        });
    }
    // do something with the file
});
app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});
