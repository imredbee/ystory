require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const KakaoStrategy = require('passport-kakao').Strategy;
const flash = require('connect-flash');

// 애플리케이션에 미들웨어 추가
var mysql = require('mysql');

const app = express();
app.set('view engine', 'ejs'); // EJS 템플릿 엔진 설정
app.set('views', 'public/html'); // EJS 템플릿 파일이 위치한 디렉토리 설정
app.use(flash());


// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // 세션을 항상 저장할지 여부 (보통 false 권장)
  saveUninitialized: false, // 초기화되지 않은 세션을 저장소에 저장할지 여부
  cookie: {
    httpOnly: true, // 클라이언트 사이드 JS가 쿠키를 읽지 못하도록
    secure: false // HTTPS 사용시 true로 설정
  }
}));

// Passport 초기화 및 세션 연결
app.use(passport.initialize());
app.use(passport.session());

const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
    return;
  }
  console.log('MySQL에 연결되었습니다.');
});

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());


// Passport 직렬화 및 역직렬화
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user.userId);
  console.log("직렬화됨");
});
passport.deserializeUser((userId, done) => {
  // 사용자 ID로 사용자 정보 찾기
  connection.query('SELECT * FROM Users WHERE userId = ?', [userId], function (err, results) {
    if (err) { return done(err); }
    if (results.length > 0) {
      done(null, results[0]);
    } else {
      done(null, null);
    }
  });
});

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_ID_TEST,
  callbackURL: '/auth/kakao/callback'
},
function(accessToken, refreshToken, profile, done) {
  // console.log(profile);
  const kakaoId = profile.id;
  connection.query('SELECT * FROM Users WHERE kakaoId = ?', [kakaoId], function(err, results) {
    if (err) return done(err);

    if (results.length > 0) {
      // 기존 사용자
      done(null, results[0]);
    } else {
      // 새 사용자 생성
      const newUser = {
        
        name: profile._json.kakao_account.name,
        phone: profile._json.kakao_account.phone_number, // 전화번호 필드가 필요한 경우
        kakaoId: profile.id,
        gender: profile._json.kakao_account.gender
        
        
        // 필요한 추가 정보를 여기에 추가하세요.
      };

      connection.query('INSERT INTO Users SET ?', newUser, function(err, result) {
        if (err) return done(err);
        newUser.userId = result.insertId;
        done(null, newUser);
      });
    }
  });
}
));

// 카카오 인증 라우트
app.get('/auth/kakao', passport.authenticate('kakao'));
app.get('/auth/kakao/callback',
  passport.authenticate('kakao', {
    successRedirect: '/home', // 로그인 성공 시 리다이렉트 경로
    failureRedirect: '/', // 로그인 실패 시 리다이렉트 경로
  })
);



app.get('/additional-info', (req, res) => {
  console.log('에디셔널 인포 라우트에 접근했습니다.');

  // if (req.flash('error')[0] === 'additional-info-required') {
  //   // 새 사용자의 추가 정보 입력 페이지를 렌더링
  //   console.log('에디셔널 인포 라우트에 접근하여 해당 파일 랜더링 합니다.');
  //   res.render('additional_info');
  // } else {
  //   // 그렇지 않은 경우 로그인 페이지로 리다이렉션
  //   console.log(req.flash('error'));
  //   res.redirect('/');
  // }
});


// 라우팅 설정
// app.get('/home', (req, res) => {
//   res.sendFile(__dirname + '/public/html/index.html');
// });
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/pre-login.html');
});
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/public/html/dashboard_main.html');
});
app.get('/comingsoon', (req, res) => {
  res.sendFile(__dirname + '/public/html/coming_soon.html');
});
app.get('/guest_access', (req, res) => {
  res.sendFile(__dirname + '/public/html/guest_access.html');
});
app.get('/comingSoonImg', (req, res) => {
  res.sendFile(__dirname + '/public/common/images/comingSoon.jpg');
});





app.get('/home', async (req, res) => {
  console.log('home라우트 접근');
  try {
    // 로그인이 되어 있으면
    if (req.isAuthenticated()) { 
      //추가정보를 입력한 사용자라면
      if (req.user.agree === 'on'){
        // 과목과 첫 번째 과목의 강의 목록을 데이터베이스에서 가져옴
        const subjects = await getSubjects();
        const lectures = await getLectures(subjects[0].subjectId);
  
        res.render('index', {
          userName: req.user.name,
          subjects: subjects,
          lectures: lectures
        });
      }
      else {
        console.log(req.user.kakaoId);
        res.render('additional_info',{kakaoId: req.user.kakaoId});
      }
    } else {
      // 로그인이 되어 있지 않으면 guest_access.html 파일을 전송
      console.log('here2');
      res.sendFile(__dirname + '/public/html/guest_access.html');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 에러');
  }
});

app.get('/guest', async (req, res) => {
  console.log('guest라우트 접근');
  try {
    // 로그인이 되어 있으면
    if (req.isAuthenticated()) { 
      //추가정보를 입력한 사용자라면
      if (req.user.agree === 'on'){
        // 과목과 첫 번째 과목의 강의 목록을 데이터베이스에서 가져옴
        const subjects = await getSubjects();
        const lectures = await getLectures(subjects[0].subjectId);
  
        res.render('index_guest', {
          userName: req.user.name,
          subjects: subjects,
          lectures: lectures
        });
      }
      else {
        const subjects = await getSubjects();
        const lectures = await getLectures(subjects[0].subjectId);
        console.log(req.user.kakaoId);
        res.render('index_guest',{kakaoId: req.user.kakaoId});
      }
    } else {
      // 로그인이 되어 있지 않으면 guest_access.html 파일을 전송
      const subjects = await getSubjects();
      const lectures = await getLectures(subjects[0].subjectId);
      req.session.userID = generateGuestID();
      req.session.isGuest = true;
      res.render('index_guest',{ userName: req.session.userID,
              subjects: subjects, lectures: lectures });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 에러');
  }
});

// 사용자 데이터 제출 라우트
app.post('/submit-user-data', (req, res) => {
  const { kakaoId, agree, name, gender, phone, nickname, birthYear, birthMonth, birthDate } = req.body;

  const updateQuery = `
    UPDATE Users
    SET
      agree = ?,
      name = ?,
      gender = ?,
      phone = ?,
      nickname = ?,
      birthYear = ?,
      birthMonth = ?,
      birthDate = ?
    WHERE kakaoId = ?
  `;

  connection.query(updateQuery, [agree, name, gender, phone, nickname, birthYear, birthMonth, birthDate, kakaoId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('서버 에러 발생');
    }
    res.json({ message: '데이터 처리 성공', status: 'success' });
    console.log('데이터가 업데이트되었습니다.');
  });
});
// app.post('/submit-user-data', (req, res) => {

//   const { kakaoId, agree, name, gender, phone, nickname, birthYear, birthMonth, birthDate } = req.body;
 
//   const updateQuery = `
//   UPDATE Users
//   SET
//     agree = '${agree}',
//     name = '${name}',
//     gender = '${gender}',
//     phone = '${phone}',
//     nickname = '${nickname}',
//     birthYear = '${birthYear}',
//     birthMonth = '${birthMonth}',
//     birthDate = '${birthDate}'
//   WHERE kakaoId = '${kakaoId}'
//   `;
 

//   connection.query(updateQuery, (err, results) => {
//     if (err) {
//       res.status(500).send('서버 에러 발생');
//       throw err;
//     }
//     console.log('데이터가 업데이트되었습니다.');
//   });

//   res.redirect('/start');
// });

app.get('/start',(req,res)=>{
  res.sendFile(__dirname + '/public/start.html');
})


app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // 세션 삭제 중 에러 처리
      res.status(500).send('로그아웃 중 오류가 발생했습니다.');
    } else {
      // 세션 삭제 성공, 사용자를 홈페이지로 리다이렉트
      res.redirect('/');

    }
  });
});


// app.get('/guest', (req, res) => {
//   if (!req.session.userID) {
//     req.session.userID = generateGuestID();
//     req.session.isGuest = true;
//   }
//   try{
//     const subjects = await getSubjects();
//     // const lectures = getLectures(subjects[0].subjectId);

//     res.render('index_guest', { userName: req.session.userID,
//       subjects: subjects });
    
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('서버 에러');
//     }
  

// });


function generateGuestID() {
  // 간단한 게스트 ID 생성 로직
  return 'guest_' + Math.random().toString(36).substring(2, 9);
}



// 과목 목록을 조회하는 라우트
app.get('/edu_tabpage', async (req, res) => {
  const subjectId = req.query.subjectId; // URL에서 subjectId를 추출

  try {
    // 과목과 subjectId의 강의 목록을 데이터베이스에서 가져옴
    const subjects = await getSubjects();
    const lectures = await getLectures(subjects[subjectId - 1].subjectId);

    console.log(subjects);
    res.render('edu_tabpage', { subjects, lectures });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 에러');
  }
});

// 과목 목록 조회 함수
function getSubjects() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Subjects', (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}
// 강의 목록 조회 함수
function getLectures(subjectId) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Lectures WHERE subjectId = ?', [subjectId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

// 강의 목록을 동적으로 로드하는 라우트
app.get('/lectures/:subjectId', async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const lectures = await getLectures(subjectId);

    res.json(lectures);
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 에러');
  }
});




// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));



// 인증 후 받은 코드를 사용하여 토큰을 얻는 코드는 별도로 구현되어야 합니다.
