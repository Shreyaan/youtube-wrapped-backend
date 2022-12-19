var fs = require("fs");
import multer, { Multer } from "multer";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import * as dotenv from 'dotenv' 
dotenv.config()
const { v4: uuidv4 } = require("uuid");
const MongoClient = require('mongodb').MongoClient;


type dataType = {
  header: string;
  title: string;
  titleUrl: string;
  subtitles: [
    {
      name: string;
      url: string;
    }
  ];
  time: string;
  products: [string];
  activityControls: [string];
}[];

interface MyObject {
  [key: string]: number;
}

const app: Application = express();
const upload: Multer = multer();
app.use(cors());

const PORT = process.env.PORT || 4000;

const url = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

// console.log(main(data));

function YoutubeWrappedCalculator(data: any) {
  

  let output = {};
  let numOfVideosRemoved: number = 0;
  let listOfChannels: MyObject = {};
  let numOfVideos: number = 0;
  let numberOfChanels: number = 0;

  // numOfVideos = data.length;
  let listOfVideos: MyObject = {};

  let firstVideoOf2022 = {} as dataType[0];

  for (let i = 0; i < data.length; i++) {
    const element: dataType[0] = data[i];
    //   console.log(element.subtitles);

    const timestamp = element.time;
    const year = timestamp.substr(0, 4);

    if (year ==`2022`) {
      if (element.header == "YouTube Music") {
      } else if (element.header == "YouTube") {
        firstVideoOf2022 = element
        numOfVideos++;
        if (!element.subtitles) {
          numOfVideosRemoved++;
        } else {
          if (!listOfChannels[element.subtitles[0].name])
            listOfChannels[element.subtitles[0].name] = 1;
          else {
            listOfChannels[element.subtitles[0].name] =
              listOfChannels[element.subtitles[0].name] + 1;
          }
        }
        if (listOfVideos[element.title]) {
          listOfVideos[element.title] = listOfVideos[element.title] + 1;
        } else {
          listOfVideos[element.title] = 1;
        }
      }
    }
  }

  const sortedChannelsArr: Array<[string, number]> = Object.entries(
    listOfChannels
  ).sort((a, b) => b[1] - a[1]);

  const sortedVidsArray: Array<[string, number]> = Object.entries(
    listOfVideos
  ).sort((a, b) => b[1] - a[1]);
  numberOfChanels = sortedChannelsArr.length;

  const timestamp = firstVideoOf2022.time
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

app.get("/", (req: Request, res: Response) => {
  res.send(
    `<p>
    Welcome to the Youtube Wrapped
    To use it go <a href="https://youtube-wrapped.anosher.com/">here</a>
</p>`
  );
});

// app .post /api/uploadjson should accept a json file and return the data in the json file in the response
app.post(
  "/api/uploadjson",
  upload.single("jsonFile"),
  (req: Request, res: Response) => {
    const file = req.file;
    // console.log(file);

    if (file) {
      const fileName = `/tmp/${uuidv4()}.json`;
      fs.writeFile(fileName, file.buffer, "utf8", (err: any) => {
        if (err) {
          // handle error
          return res.status(500).send({ message: "Error writing file" });
        }
        //   let rawdata = fs.readFileSync(file);
        fs.readFile(fileName, "utf8", (err: any, data: any) => {
          if (err) {
            // handle error
            return res.status(500).send({ message: "Error reading file" });
          }
          // parse the JSON data
          try {
            const jsonData = JSON.parse(data);
            let youtubeWrappedData = YoutubeWrappedCalculator(jsonData);
            // console.log(jsonData);

            try {
              MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err: any, client: { db: (arg0: string | undefined) => any; }) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send({ status: "error", errorMsg: err });
                }
                const db = client.db(dbName);
                const collection = db.collection('youtubeWrappedData');
              
                collection.insertOne(youtubeWrappedData, (err: any, result: { insertedId: any; }) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).send({ status: "error", errorMsg: err });
                  }
                  console.log(`Saved youtubeWrappedData to MongoDB: ${result.insertedId}`);
                  return res
                  .status(200)
                  .send({ status: "success", message: youtubeWrappedData });
                });
              });
            } catch (error) {
              
            }

            // return res
            //   .status(200)
            //   .send({ status: "success", message: youtubeWrappedData });
          } catch (error) {
            // handle error
            return res.status(400).send({ status: "error", errorMsg: error });
          }
        });
        // delete the temporary file
        fs.unlink(fileName, (err: any) => {
          if (err) {
            console.error(err);
          }
        });
      });
    }
    // do something with the file
  }
);

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
