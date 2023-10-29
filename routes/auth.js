const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');  // 토큰 생성을 위해

// 입력값 검증 함수
function validateRegistrationData(req, res, next) {
    if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    if (req.body.password.length < 6) {
        return res.status(400).json({ message: '비밀번호는 최소 6자리 이상이어야 합니다.' });
    }

    next();
}

// 회원 가입 라우트
router.post('/register', validateRegistrationData, async (req, res) => {
    try {
        // 중복된 사용자 이름이나 이메일이 있는지 확인
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }]
        });

        if (existingUser) {
            return res.status(400).json({ message: '해당 사용자 이름 또는 이메일은 이미 사용 중입니다.' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 로그인 라우트
router.post('/login', async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ message: '사용자 이름과 비밀번호를 입력해주세요.' });
        }

        const user = await User.findOne({ username: req.body.username });
        
        if (!user) {
            return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: '비밀번호가 잘못되었습니다.' });
        }

        // (이후에는 JWT 토큰 발급 등의 로직이 추가될 수 있습니다.)
        res.json({ message: 'Logged in successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 사용자 정보 수정 라우트
router.put('/update', async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ message: '필요한 정보가 누락되었습니다.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        user.email = email;  // 예를 들어 이메일만 변경한다고 가정
        await user.save();

        res.json({ message: '사용자 정보가 수정되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 비밀번호 변경 라우트
router.put('/change-password', async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ message: '필요한 정보가 누락되었습니다.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '기존 비밀번호가 일치하지 않습니다.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: '비밀번호가 변경되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 계정 탈퇴 라우트
router.delete('/delete-account', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: '필요한 정보가 누락되었습니다.' });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ message: '계정이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: '이메일을 입력해주세요.' });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: '해당 이메일의 사용자를 찾을 수 없습니다.' });
        }

        // 임시 토큰 생성
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;  // 1시간 후 만료

        await user.save();

        // 이메일 전송 설정
        let transporter = nodemailer.createTransport({
            service: 'Gmail',  // 사용할 서비스 (예: Gmail)
            auth: {
                user: 'hcm07mch@gmail.com',  // 본인의 이메일 주소
                pass: '#1733Billy'  // 본인의 이메일 비밀번호
            }
        });

        // 메일 내용 설정
        let mailOptions = {
            to: user.email,
            from: 'your_email@gmail.com',
            subject: '비밀번호 재설정 요청',
            text: `비밀번호 재설정을 원하시면 다음 링크를 클릭하세요: 
            http://yourwebsite.com/reset/${resetToken}`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
            }
            res.json({ message: '비밀번호 재설정 이메일이 전송되었습니다.' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 비밀번호 재설정 페이지 접근 라우트
router.get('/reset/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }  // 만료 시간이 현재 시간보다 큰 경우
        });

        if (!user) {
            return res.status(400).json({ message: '비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.' });
        }

        // 사용자에게 비밀번호 재설정 페이지를 제공합니다. (프론트엔드 로직 필요)
        // res.render('reset', { token: req.params.token });  // 예: ejs 템플릿 엔진 사용시

        // 여기서는 예시로 JSON 응답만 제공합니다.
        res.json({ message: '비밀번호 재설정 페이지로 이동하세요.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 비밀번호 재설정 처리 라우트
router.post('/reset/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: '비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.' });
        }

        if (req.body.password === req.body.confirmPassword) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
        } else {
            res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
