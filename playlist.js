const { google } = require('googleapis');
const youtube = google.youtube('v3');
var mysql = require('mysql');
require('dotenv').config();

const connection  = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    database : process.env.RDS_DB_NAME
  });
  
connection.connect();

function convertISO8601ToDuration(isoDuration) {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10) || 0;
    const seconds = parseInt(match[3], 10) || 0;

    return `${hours > 0 ? hours + ':' : ''}${minutes > 0 ? minutes + ':' : ''}${seconds > 0 ? seconds + '' : ''}`.trim();
}

async function getVideoDuration(videoId, apiKey) {

    const response = await youtube.videos.list({
        key: apiKey,
        part: 'contentDetails',
        id: videoId
    });

    const duration = convertISO8601ToDuration(response.data.items[0].contentDetails.duration);
     // 예: PT15M51S
    return duration;
}

async function getPlaylistVideos(playlistId, apiKey) {
    let nextPageToken = '';
    let videos = [];

    do {
        const response = await youtube.playlistItems.list({
            key: apiKey,
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken
        });


        for (const item of response.data.items) {
            const videoId = item.snippet.resourceId.videoId;
            const duration = await getVideoDuration(videoId, apiKey);

            videos.push({
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                duration: duration
            });
        }

        nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return videos;
}



const playlistId = 'PLOgX7DLM4hnZqUE9jvjrv3I2wSmesSLwG'; // 재생목록 ID
const apiKey = 'AIzaSyAxJPkjMIDMAj8Fv2OfeVTovnKUw9L-Rn8'; // API 키
const subjectId = 3; // 과목의 subjectId

getPlaylistVideos(playlistId, apiKey)
    .then(videos => {
        console.log(videos);
        videos.forEach(video => {
            const { title, thumbnail, url, duration } = video;
            const query = 'INSERT INTO Lectures (subjectId, title, youtubeUrl, thumbnailUrl, duration) VALUES (?, ?, ?, ?,?)';
            connection.query(query, [subjectId, title, url,thumbnail, duration], function (error, results, fields) {
              if (error) throw error;
              // 삽입 결과 처리
              console.log("Inserted lecture with ID: ", results.insertId);
            });
          }); // 가져온 영상 정보 출력
    })
    .catch(error => {
        console.error('Error: ', error);
    });
