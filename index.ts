var fs = require("fs");
import multer, { Multer } from "multer";
import express, { Application, Request, Response } from "express";
import cors from "cors";
const { v4: uuidv4 } = require("uuid");

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

// console.log(main(data));

function YoutubeWrappedCalculator(data: any) {
  let output = {};
  let numOfVideosRemoved: number = 0;
  let listOfChannels: MyObject = {};
  let numOfVideos: number = 0;
  let numberOfChanels: number = 0;

  // numOfVideos = data.length;
  let listOfVideos: MyObject = {};

  for (let i = 0; i < data.length; i++) {
    const element: dataType[0] = data[i];
    //   console.log(element.subtitles);
    if (element.header == "YouTube Music") {
    } else if (element.header == "YouTube") {
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

  const sortedChannelsArr: Array<[string, number]> = Object.entries(
    listOfChannels
  ).sort((a, b) => b[1] - a[1]);

  const sortedVidsArray: Array<[string, number]> = Object.entries(
    listOfVideos
  ).sort((a, b) => b[1] - a[1]);
  numberOfChanels = sortedChannelsArr.length;

  return (output = {
    numOfVideos: numOfVideos,
    numberOfChanels: numberOfChanels,
    numOfVideosRemoved: numOfVideosRemoved,
    topChannels: sortedChannelsArr.slice(0, 21),
    topVids: sortedVidsArray.slice(0, 21),
  });
}

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
            return res
              .status(200)
              .send({ status: "success", message: youtubeWrappedData });
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
