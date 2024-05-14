const fs = require('fs');
const yaml = require('js-yaml');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

// 환경 변수에서 값 가져오기
const clientId = process.env.GITALK_CLIENT_ID;
const clientSecret = process.env.GITALK_CLIENT_SECRET;

// YAML 파일 로드
const configTemplate = yaml.load(fs.readFileSync('_config.redefine.template.yml', 'utf8'));

// 환경 변수 값 주입
configTemplate.comment.config.gitalk.clientID = clientId;
configTemplate.comment.config.gitalk.clientSecret = clientSecret;

// 수정된 YAML 파일 저장
fs.writeFileSync('_config.redefine.yml', yaml.dump(configTemplate));

console.log('Config file updated with environment variables.');