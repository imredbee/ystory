const { google } = require('googleapis');
const mysql = require('mysql');
require('dotenv').config();

// MySQL 데이터베이스 연결 설정
const connection  = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    database : process.env.RDS_DB_NAME
  });
  
// YouTube API 설정
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyAxJPkjMIDMAj8Fv2OfeVTovnKUw9L-Rn8' // API 키 입력
});

// 유튜브 영상 정보 가져오기 함수
async function getYouTubeVideoInfo(videoId) {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoId
    });

    const videoInfo = response.data.items[0];
    return {
      title: videoInfo.snippet.title,
      thumbnail: videoInfo.snippet.thumbnails.default.url,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      duration: videoInfo.contentDetails.duration
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error;
  }
}

// 영상 정보를 데이터베이스에 저장하는 함수
function saveVideoInfoToDatabase(videoInfo) {
  const query = 'INSERT INTO videos (title, thumbnail, url, duration) VALUES (?, ?, ?, ?)';
  connection.query(query, [videoInfo.title, videoInfo.thumbnail, videoInfo.url, videoInfo.duration], (err, results) => {
    if (err) {
      console.error('Error inserting video info into database:', err);
      return;
    }
    console.log('Video info saved to database:', results.insertId);
  });
}

// 예시: 특정 유튜브 영상 정보 가져오기 및 저장
getYouTubeVideoInfo('특정유튜브영상ID')
  .then(videoInfo => {
    saveVideoInfoToDatabase(videoInfo);  
  })
  .catch(error => {
    console.error('Error:', error);
  });
