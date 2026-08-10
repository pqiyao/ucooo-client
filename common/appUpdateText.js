var languageCodes = ['zh-hk', 'zh-cn', 'en', 'ko', 'ja', 'de', 'fr']
var languagePreference = require('./languagePreference.js')

var copies = {
	'zh-hk': {
		newVersion: '發現新版本', releaseNotes: '本次更新', forceHint: '此版本已停止服務，請更新後繼續使用',
		updateNow: '現在更新', downloadUpdate: '下載新版本', openGooglePlay: '前往 Google Play 更新',
		openAppStore: '前往 App Store 更新', later: '稍後再說', ignore: '忽略此版本',
		latest: '目前已是最新版本', checkFailed: '暫時無法檢查更新，請稍後再試', openFailed: '無法開啟更新地址', packageSize: '安裝包'
	},
	'zh-cn': {
		newVersion: '发现新版本', releaseNotes: '本次更新', forceHint: '此版本已停止服务，请更新后继续使用',
		updateNow: '现在更新', downloadUpdate: '下载新版本', openGooglePlay: '前往 Google Play 更新',
		openAppStore: '前往 App Store 更新', later: '稍后再说', ignore: '忽略此版本',
		latest: '当前已是最新版本', checkFailed: '暂时无法检查更新，请稍后重试', openFailed: '无法打开更新地址', packageSize: '安装包'
	},
	en: {
		newVersion: 'A new version is available', releaseNotes: "What's new", forceHint: 'Update the app to continue using this version.',
		updateNow: 'Update now', downloadUpdate: 'Download update', openGooglePlay: 'Update on Google Play',
		openAppStore: 'Update on the App Store', later: 'Later', ignore: 'Skip this version',
		latest: 'You are using the latest version', checkFailed: 'Unable to check for updates. Try again later.', openFailed: 'Unable to open the update link', packageSize: 'Download'
	},
	ko: {
		newVersion: '새 버전이 있습니다', releaseNotes: '업데이트 내용', forceHint: '계속 사용하려면 앱을 업데이트하세요.',
		updateNow: '지금 업데이트', downloadUpdate: '새 버전 다운로드', openGooglePlay: 'Google Play에서 업데이트',
		openAppStore: 'App Store에서 업데이트', later: '나중에', ignore: '이 버전 건너뛰기',
		latest: '최신 버전을 사용 중입니다', checkFailed: '업데이트를 확인할 수 없습니다. 나중에 다시 시도하세요.', openFailed: '업데이트 링크를 열 수 없습니다', packageSize: '다운로드'
	},
	ja: {
		newVersion: '新しいバージョンがあります', releaseNotes: '更新内容', forceHint: '続けるにはアプリを更新してください。',
		updateNow: '今すぐ更新', downloadUpdate: '新しいバージョンをダウンロード', openGooglePlay: 'Google Playで更新',
		openAppStore: 'App Storeで更新', later: 'あとで', ignore: 'このバージョンを無視',
		latest: '最新バージョンです', checkFailed: '更新を確認できません。しばらくしてから再試行してください。', openFailed: '更新リンクを開けません', packageSize: 'ダウンロード'
	},
	de: {
		newVersion: 'Neue Version verfügbar', releaseNotes: 'Neuerungen', forceHint: 'Aktualisiere die App, um fortzufahren.',
		updateNow: 'Jetzt aktualisieren', downloadUpdate: 'Neue Version laden', openGooglePlay: 'Bei Google Play aktualisieren',
		openAppStore: 'Im App Store aktualisieren', later: 'Später', ignore: 'Diese Version überspringen',
		latest: 'Du verwendest die neueste Version', checkFailed: 'Updates können derzeit nicht geprüft werden.', openFailed: 'Der Update-Link konnte nicht geöffnet werden', packageSize: 'Download'
	},
	fr: {
		newVersion: 'Une nouvelle version est disponible', releaseNotes: 'Nouveautés', forceHint: "Mettez l'application à jour pour continuer.",
		updateNow: 'Mettre à jour', downloadUpdate: 'Télécharger la mise à jour', openGooglePlay: 'Mettre à jour sur Google Play',
		openAppStore: "Mettre à jour sur l'App Store", later: 'Plus tard', ignore: 'Ignorer cette version',
		latest: 'Vous utilisez la dernière version', checkFailed: 'Impossible de rechercher les mises à jour.', openFailed: "Impossible d'ouvrir le lien de mise à jour", packageSize: 'Téléchargement'
	}
}

function getLanguageCode() {
	var index = languagePreference.getLanguageIndex()
	return languageCodes[index] || 'en'
}

function getCopy(code) {
	return copies[code] || copies.en
}

module.exports = {
	getLanguageCode: getLanguageCode,
	getCopy: getCopy
}
