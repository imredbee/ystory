<2023-11-30>
1. 'public/html(unused)' 경로에 현재 사용되고 있지 않은 *.html 파일 모아뒀습니다.
2. 'public/html' 경로에 현재 사용중인 *.html, *.ejs 파일 모아뒀습니다. (*.ejs 파일은 서버와 상호작용하는 html파일로 생각하시면 좋습니다. css, js 연결 방식은 *.html과 같습니다.)
3. 'common/js/vhSetting.js' : 사용자 브라우저 창의 높이를 측정하고 측정한 높이를 100으로 나눈 값을 스타일 변수로 반환하는 자바스크립트입니다. css상에서 '--vh'라는 변수로 받아서 사용됩니다. css상에서의 활용 예시는 아래와 같습니다.

[기존방식]
.wrapper {
    ...
    height: 100vh;
    ...
}

[변수를 사용한 방식]

.wrapper {
    ...
    height: calc(var(--vh,1vh)*100);
    ...
}

*var(--vh,1vh)는 --vh변수가 있으면 변수값을 반환하고 변수값이 없다면 1vh를 반환합니다.


4. 'common/css'폴더에 'additional_info.css','coming_soon.css','guest_access.css','start.css'는 가장 최근 개발 작업에서 제가 단독으로 생성한 css입니다. 기존 css틀에서 해당 페이지들에 대한 스타일이 잡히면 삭제되어도 무방합니다.

