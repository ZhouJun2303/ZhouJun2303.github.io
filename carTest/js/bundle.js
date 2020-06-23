(function () {
   'use strict';

   class HomeView extends Laya.View {

       constructor() {
           super();
       }

       onOpened(data) {
           this.startGameBtn.on(Laya.Event.CLICK, this, this._$onButtonClick);
       }

       onClosed() {
           
       }

       onEnable() {
           ML.event.on('User_dataChanged', this, this._$onUserDataChanged);
           ML.event.on('StartExportWudian', this, this._$startExportWudian);
           this._$initData();
           ml.homeview = this;
       }

       onDisable() {
           ML.event.offAllCaller(this);
       }

       //按钮总管理
       _$onButtonClick(e){
           e.stopPropagation();
           let name = e.target.name;
           switch (name) {
               case "startGameBtn":
                   this._onStartGameBtnClick();
                   break;
               default:
                   break;
           }
       }


       _$initData() {
           //DEBUG
           return;
           let userData = ml.user.UserData;
           this.levelLabel.text = "关卡" + userData.level;
           this.goldLabel.text = userData.gold;
           this._$setKeyIndex(userData.key);
           if (ML.platform.isIphoneX()) {
               this.keyPanel.top = 160;
           }
       }

       _$onUserDataChanged() {
           this._$initData();
       }

       _onStartGameBtnClick() {
           ml.game.exitgame();
           // ml.game.startGame();
           // this.destroy();
       }

       
      
   }

   class WebPlatformConfig{
       constructor() { 
           //项目版本号
           this.version = "1.0.0";
           //是否分包
           this.shouldSubpackage = false;
           //分包名
           this.subpackage = "package1";
           //资源包版本(不分包则无效)
           this.assetsVersionName = "1_0";
           //资源存放路径
           this.assetsPathRoot = "package1/Conventional/";
           //音频文件根目录 ”package1/audio/“
           this.audioPathRoot = "package1/audio/";
           this.configPathRoot = "package1/config/";
           this.appId = "wxf1d32aa8d1b023eb";
           this.appKey = "e8ce3ce66421444892f4620112c987f4";
           this.bannerIds = [
           ];
           this.videoIds = [
           ];
           this.interstitialIds = [
           ];
       }
   }

   class WebResourceModuleHelper {

       constructor() { 
       }

       downloadAssets(callbacks){
           callbacks.assetsReady();
       }
       
       onEnable() {
       }

       onDisable() {
       }
   }

   class WXResourceModuleHelper {

       constructor() {
       }

       downloadAssets(callbacks) {
           // 1.删除历史资源包文件
           // 2.判断本地是否存在资源包文件
           // 3.不存在资源包，则下载
           // 4、下载完成后解压资源包
           let self = this;
           let shouldSubpackage = ML.config.shouldSubpackage;
           //不需要分包
           if(!shouldSubpackage){
               callbacks.assetsReady();
               return;
           }

           //资源版本
           let assetVersionName = ML.config.assetsVersionName;
           //分包名
           let subPackgeName = ML.config.subpackage;
           //压缩包路径
           let zipPath = ML.config.assetsZipPath;
           //资源存储根目录
           let assetsRoot = ML.mini.env.USER_DATA_PATH;
           //资源解压后文件路径
           let assetsDir = ML.config.assetsPathRoot;
           //1
           this.deleteAssets(assetVersionName);
           //3 下载分包
           let load = self.loadSubpackage(subPackgeName, callbacks.downloadSuccess, callbacks.downloadFail, callbacks.downloadProgress);
           load.then(() => {
               //4 下载完成,解压
               let unZip = self.unzip(zipPath, assetsRoot, callbacks.unZipComplete);
               unZip.then(() => {
                   callbacks.assetsReady();
               });
           });
           //2
           // let fileAccess = this.access(assetsDir).catch((res) => {
           //     //资源不存在
           //     console.log('资源不存在，需要下载 ');
           // });
           //存在资源
           // fileAccess.then((res) => {
           //     if(res){
           //         callbacks.assetsReady();
           //         console.log('资源存在 ');
           //     }
           // });

       }

       unzip(src, target, success, fail) {
           let unZiptask = new Promise((r, s) => {
               let f = ML.mini.getFileSystemManager();
               f.unzip({
                   zipFilePath: src,
                   targetPath: target,
                   success: () => {
                       success && success();
                       r();
                   },
                   fail: (res) => {
                       fail && fail(res);
                       s(res);
                   },
               });
           });
           return unZiptask;
       }

       loadSubpackage(name, success, fail, progress) {
           let load = new Promise((r, s) => {
               const loadTask = ML.mini.loadSubpackage({
                   name: name,
                   success: (res) => {
                       console.log("分包加载完成", res);
                       success && success(res);
                       r(res);
                       // ML.event.emit(ML.Constant.Event_OnSubpackageLoadComplete, res);
                   },
                   fail: (res) => {
                       console.log("分包加载失败", res);
                       fail && fail(res);
                       s(res);
                       // ML.event.emit(ML.Constant.Event_OnSubpackageLoadFail, res);
                   }
               });

               loadTask.onProgressUpdate(res => {
                   progress && progress(res);
                   // console.log('下载进度', res.progress);
                   // console.log('已经下载的数据长度', res.totalBytesWritten);
                   // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite);
                   // ML.event.emit(ML.Constant.Event_OnSubpackageLoadProgress, res.progress);
               });
           });
           return load;
       }

       access(dir) {
           let fileAccess = new Promise((r, s) => {
               let fileManager = ML.mini.getFileSystemManager();
               fileManager.access({
                   path: dir,
                   success: (res) => { r(res); },
                   fail: (res) => { s(res); },
               });
           });
           return fileAccess;
       }

       deleteAssets(assetVersionName) {
           let self = this;
           var fileManager = ML.mini.getFileSystemManager();
           var assetsDir = ML.mini.env.USER_DATA_PATH;
           let currentAssets = "assets" + assetVersionName;
           fileManager.readdir({
               dirPath: assetsDir, success: (f) => {
                   let files = f.files;
                   for (let i = 0; i < files.length; i++) {
                       let d = files[i];
                       if (d === currentAssets) continue;
                       let t = d.indexOf('assets') == 0;
                       if (t) {
                           fileManager.rmdir({
                               dirPath: ML.mini.env.USER_DATA_PATH + "/" + d,
                               recursive: true,
                           });
                       }

                   }
               }
           });
       }
   }

   class WXPlatformConfig {

       constructor() {
           //项目版本号
           this.version = "1.0.0";
           //是否分包
           this.shouldSubpackage = true;
           //分包名(不分包则无效)
           this.subpackage = "package1";
           //资源包版本(不分包则无效)
           this.assetsVersionName = "1_1";
           //资源zip包路径  "package1/assets1_0.zip"
           this.assetsZipPath = this.subpackage + "/assets" + this.assetsVersionName + ".zip";
           //资源存放路径 "http://usr/assets1_0/“
           this.assetsPathRoot = wx.env.USER_DATA_PATH + "/assets" + this.assetsVersionName + "/";
           //音频文件根目录 ”package1/audio/“
           this.audioPathRoot = this.subpackage + "/audio/";
           //配置文件根目录 ”package1/config/“
           this.configPathRoot = this.subpackage + "/config/";
           this.appId = "wxe4ee547a41708fd2";
           this.appKey = "fc4d78558e78561fa6ab9604bd1f3795";
           this.bannerIds = [
               // "adunit-7101907bfc8635ad",
               // "adunit-d8eed425b34357d1",
               // "adunit-add6c16803ec9701",
           ];
           this.videoIds = [
               // "adunit-1687009bf050fe37",
               // "adunit-f52f3356a8cc975b"
           ];
           this.interstitialIds = [

           ];
       }

   }

   // 文档地址 https://developers.weixin.qq.com/minigame/dev/guide/

   class WebPlatformHelper {

       constructor() {

       }

       onInit() {
           this.showShareMenuWithTicket();
           this.updateProgram();
           this._$regisiterLifecycle();
       }

       getLaunchOption() {
       }

       getSystemInfoSync() {

       }

       isIphoneX() {
           let screenHeight = Laya.stage.height;
           let screenWidth = Laya.stage.width;
           let ratioWH = screenWidth / screenHeight;
           if (ratioWH <= 0.5 || ratioWH >= 2) {
               return true;
           } else {
               return false;
           }
       }

       isIos() {
           return false;
       }

       vibrateShort() {

       }

       vibrateLong() {

       }

       setClipboardData(data, success = null, fail = null) {

       }

       navigatTomini(obj) {

       }

       showModal(data) {

       }

       showToast(title, toastType = 'none', mask = false) {
           console.log('Toast ', title);
       }

       showLoading(title = "".mask = false){
           console.log("Loading show ",title);
       }

       hideLoading(){
           console.log("Loading hide");
       }

       updateProgram() {

       }

       showShareMenuWithTicket() { }
       share(title, imageUrl, query, callback) {
       }

       onShareAppMessage(title, imageUrl, query){
       }

       _$regisiterLifecycle() {
           let self = this;
           // Laya.stage.on(Laya.Event.VISIBILITY_CHANGE,()=>{
           //     console.log('Platform- Mini_onShow ',Laya.stage.isVisibility);
           //     if(Laya.stage.isVisibility){
           //         self._$onShowCallback(null);
           //     }else{
           //         self._$onHideCallback();
           //     }
           // })

           // Laya.stage.on(Laya.Event.BLUR,this,()=>{
           //     self._$onShowCallback(null);
           //     console.log('Platform- BLUR');
           // });
           document.addEventListener("visibilitychange", e => {
               if (document.hidden) {
                   // this.onBlur()
                   self._$onHideCallback();
               } else {
                   // this.onFocus()
                   self._$onShowCallback(null);
               }
           });
       }

       _$onShowCallback(res) {
           ML.event.emit('Mini_onShow', res);
       }

       _$onHideCallback() {
           ML.event.emit('Mini_onHide');
       }


   }

   class MiniPlatformHelper {

       constructor() {

       }

       onInit() {
           this.showShareMenuWithTicket();
           this.updateProgram();
           this._$regisiterLifecycle();
       }

       getLaunchOption() {
           return ML.mini.getLaunchOptionsSync();
       }

       getSystemInfoSync() {
           return ML.mini.getSystemInfoSync();
       }

       isIphoneX() {
           let sysInfo = this.getSystemInfoSync();
           let screenHeight = sysInfo.screenHeight;
           let screenWidth = sysInfo.screenWidth;
           let ratioWH = screenWidth / screenHeight;
           if (ratioWH <= 0.5 || ratioWH >= 2) {
               return true;
           } else {
               return false;
           }
       }

       isIos() {
           let sysinfo = this.getSystemInfoSync();
           return sysinfo.system.toLowerCase().indexOf("ios") >= 0;
       }

       vibrateShort() {
           ML.mini.vibrateShort();
       }

       vibrateLong() {
           ML.mini.vibrateLong();
       }

       setClipboardData(data, success = null, fail = null) {
           ML.mini.setClipboardData({
               data: data,
               success: function (res) {
                   success && success(res);
               },
               fail: function (res) {
                   fail && fail(res);
               }
           });
       }

       navigatTomini(obj) {
           ML.mini.navigateToMiniProgram(obj);
       }

       showModal(data) {
           ML.mini.showModal(data);
       }

       showToast(title, toastType = 'none', mask = false) {
           ML.mini.showToast({
               title:title,
               icon:toastType,
               mask:mask,
           });
       }

       showLoading(title = "".mask = false) {
           ML.mini.showLoading({
               title: title,
               mask:mask
             });
       }

       hideLoading() {
           ML.mini.hideLoading();
        }

       updateProgram() {
           let self = this;
           if (typeof ML.mini.getUpdateManager === 'function') { // 请在使用前先判断是否支持
               const updateManager = ML.mini.getUpdateManager();
               updateManager.onUpdateReady(function (res) {
                   self.showModal({
                       title: "发现新版本",
                       content: "新版本已经准备好！",
                       showCancel: false,
                       success: (res) => {
                           updateManager.applyUpdate();
                       }
                   });
               });

               updateManager.onUpdateFailed(function () {
                   // 新的版本下载失败
               });
           }
       }

       showShareMenuWithTicket(ticket) {
           ML.mini.showShareMenu({
               withShareTicket: ticket
           });
       }

       share(title, imageUrl, query, callback) {
           // this.currentShareCallback = callback;
           // this.share_clickTime = Date.now();
           this._share(title, imageUrl, query);
       }

       _share(title, imageUrl, query = null) {
           let self = this;
           let shareInfo = this._buildShareInfo(title, imageUrl, query);
           ML.mini.shareAppMessage(shareInfo);
       }

       onShareAppMessage(title, imageUrl, query) {
           let self = this;
           ML.mini.onShareAppMessage(() => {
               let info = self._buildShareInfo(title, imageUrl, query);
               console.log("platform mini onShareAppMessage ", info);
               return info;
           });
       }

       //构建分享内容
       _buildShareInfo(title, imageUrl, query) {
           let shareInfo = {
               title: title,
               imageUrl: imageUrl,
               query: query,
           };
           return shareInfo;
       }

       _$regisiterLifecycle() {
           let self = this;
           ML.mini.onShow(function (res) {
               self._$onShowCallback(res);
           });
           ML.mini.onHide(function () {
               self._$onHideCallback();
           });
       }

       _$onShowCallback(res) {
           ML.event.emit('Mini_onShow', res);
       }

       _$onHideCallback() {
           ML.event.emit('Mini_onHide');
       }
   }

   class OVPlatformHelper extends MiniPlatformHelper {

       constructor() { 
           super(); 
       }
       
       isIos() {
           return false;
       }

       showShareMenuWithTicket(){

       }

       share(title, imageUrl, query, callback) {
       }

       onShareAppMessage(title, imageUrl, query){
       }

       updateProgram(){}
   }

   class WebAdHelper {

       constructor() { 
       }
       
       showBanner(){

       }

       hideBanner(){

       }

       showVideo(complete){
           complete && complete(true);
       }

       showInterstitial(onClose){

       }

       showNativeAd(drawCallback){

       }

       hideNativeAd(){
           
       }
   }

   class Tools { }
   Tools.Deg2Rad = 0.01745329;
   Tools.Rad2Deg = 57.29578;

   Tools.GUID = function (len, radix) {
       var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
       var uuid = [], i;
       radix = radix || chars.length;

       if (len) {
           // Compact form
           for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
       } else {
           // rfc4122, version 4 form
           var r;

           // rfc4122 requires these characters
           uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
           uuid[14] = '4';

           // Fill in random data.  At i==19 set the high bits of clock sequence as
           // per rfc4122, sec. 4.1.5
           for (i = 0; i < 36; i++) {
               if (!uuid[i]) {
                   r = 0 | Math.random() * 16;
                   uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
               }
           }
       }

       return uuid.join('');
   };

   Tools.RandomSort = function (arr) {
       return arr.sort(() => { return Math.random() > .5 ? -1 : 1; });
   };

   Tools.IsNumber = function (obj) {
       return obj === +obj;
   };

   Tools.Random = function (min, max) {
       var range = max - min;
       var rand = Math.random();
       var num = min + Math.floor(rand * range);
       return num;
   };

   Tools.RandomOne = function (arr) {
       if (!arr || arr.length == 0)
           return null;
       var n = Tools.Random(0, arr.length);
       return arr[n];
   };
   Tools.Clamp = function (value, min, max) {
       if (value <= min) {
           return min;
       }
       if (value >= max) {
           return max;
       }
       return value;
   };
   /**
   * 获取两个时间相隔的天数
   * @param t1 时间1 ms
   * @param t2 时间2 ms
   */
   Tools.GetTimesDays = function (t1, t2) {
       let _month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
       let date = new Date();
       date.setTime(t1);
       let day = date.getDate();
       let month = date.getMonth();
       let year = date.getFullYear();

       let begin = Date.parse(_month[month] + " " + day + ", " + year);
       let intral = t2 - begin;
       let numDays = Math.floor(intral / (24 * 60 * 60 * 1000));
       //console.log(begin + " " + numDays);
       return numDays;
   };

   Tools.ObjectToForm = function (obj) {
       let str = [];
       for (let p in obj) {
           if (p == "openId") continue;
           str.push(p + "=" + obj[p]);
       }
       return str.join("&");
   };

   /*
   let bool = true;
   let num = 1;
   let str = 'abc';
   let  und= undefined;
   let nul = null;
   let arr = [1,2,3,4];
   let obj = {name:'xiaoming',age:22};
   let fun = function(){console.log('hello')};
   let s1 = Symbol();

   console.log(Object.prototype.toString.call(bool));//[object Boolean]
   console.log(Object.prototype.toString.call(num));//[object Number]
   console.log(Object.prototype.toString.call(str));//[object String]
   console.log(Object.prototype.toString.call(und));//[object Undefined]
   console.log(Object.prototype.toString.call(nul));//[object Null]
   console.log(Object.prototype.toString.call(arr));//[object Array]
   console.log(Object.prototype.toString.call(obj));//[object Object]
   console.log(Object.prototype.toString.call(fun));//[object Function]
   console.log(Object.prototype.toString.call(s1)); //[object Symbol]
   */


   Tools.GetObjectType = function (obj) {
       return Object.prototype.toString.call(obj);
   };

   Tools.IsBool = function (obj) {
       return Object.prototype.toString.call(obj) == "[object Boolean]";
   };

   Tools.IsArray = function (obj) {
       return Object.prototype.toString.call(obj) == "[object Array]";
   };

   Tools.IsObject = function (obj) {
       return Object.prototype.toString.call(obj) == "[object Object]";
   };

   Tools.showBtnClickAnim = function (node, callback) {
       Laya.Tween.to(node, { scaleX: 1.1, scaleY: 1.1 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, () => {
           Laya.Tween.to(node, { scaleX: 1, scaleY: 1 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, () => {
               if (callback) {
                   callback();
               }
           }), 0);
       }), 0);
   };

   Tools.scaleBtnAni = function (node, time = 500, d = 0.1) {
       let oriScale = node.scaleX;
       let scaleMin = (1 - d) * oriScale;
       let scaleMax = (1 + d) * oriScale;
       node.scaleX = node.scaleY = scaleMin;
       let timeLine = Laya.TimeLine.to(node, { scaleX: scaleMax, scaleY: scaleMax }, time);
       timeLine.to(node, { scaleX: scaleMin, scaleY: scaleMin }, time);
       timeLine.play(0, true);
       return timeLine;
   };

   Tools.flyImage = function (imageUrl, oriPoint, targetPoint, cb) {
       let coinNum = 6;
       let randomRange = 300;
       let finishCount = 0;
       for (let i = 0; i < coinNum; i++) {
           let coinImage = new Laya.Image(imageUrl);
           let x = oriPoint.x + randomRange * (Math.random() - 0.5);
           let y = oriPoint.y + randomRange * (Math.random() - 0.5);
           coinImage.anchorX = coinImage.anchorY = 0.5;
           coinImage.pos(oriPoint.x, oriPoint.y);
           Laya.stage.addChild(coinImage);

           let timeLine = Laya.TimeLine.to(coinImage, { x: x, y: y }, 200, Laya.Ease.sineOut).to(coinImage, { x: targetPoint.x, y: targetPoint.y }, 300, Laya.Ease.sineIn, 50);
           timeLine.once(Laya.Event.COMPLETE, this, () => {
               finishCount++;
               coinImage.destroy();
               if (finishCount == coinNum - 1) {
                   cb && cb();
               }
               timeLine.destroy();
           });
           timeLine.play(0, false);
       }
   };

   Tools.toast = function () {
       let toast = new Laya.Image('comm/toast_icon.png');
       toast.centerX = 0;
       toast.y = Laya.stage.height - 150;
       Laya.stage.addChild(toast);
       Laya.Tween.to(toast, { y: Laya.stage.height * 0.5 }, 1000, null, Laya.Handler.create(this, () => {
           toast.destroy();
       }), 0);
   };

   class WXBanner{

       constructor() { 
          
       }

       show(onResizeCallback) {
           this._onResizeCallback = onResizeCallback;
           let self = this;
           self.bannerContext && self.bannerContext.show();
           return self.bannerContext;
       }

       load(bannerId){
           let self = this;
           this.bannerId = bannerId;
           self.bannerContext = self._$createBannerAd(bannerId);
           self.bannerContext.onResize(self._$onResize.bind(self));
           self.bannerContext.onError(self._$onError);
           return self.bannerContext;
       }

       _$onResize(size) {
           let sys = ML.mini.getSystemInfoSync();
           let w = sys.windowWidth;
           let h = sys.windowHeight;
           this.bannerContext.style.top = h-size.height;
           this.bannerContext.style.left = (w - size.width) / 2;
           this._onResizeCallback && this._onResizeCallback(this.bannerContext, size);
       }

       _$onError(res) {
           console.warn('banner error', res);
           ML.event.emit("Banner_onError", res);
       }

       hide() {
           if (!this.bannerContext) return;
           this.bannerContext.hide();
           this.bannerContext.destroy();
           this.bannerContext = null;
       }

       _$createBannerAd(bannerId) {
           let sys = ML.mini.getSystemInfoSync();
           if (sys.SDKVersion < '2.0.4') return;
           let w = sys.windowWidth;
           let h = sys.windowHeight;
           let bannerContext = ML.mini.createBannerAd({
               adUnitId: bannerId,
               adIntervals: 30,
               style: {
                   width: 300,
                   left: (w - 300) / 2,
                   top: h - 100
               },
           });
           return bannerContext;
       }
   }

   class WXVideo {

       constructor() {
           this.state = 0; // 0未加载，1加载中，2已加载
           this.ad = null;
       }

       show(adUnitId, closedCallback = null) {
           this._closedCallback = closedCallback;
           this._$createRewardAD(adUnitId);
       }

       _$createRewardAD(adUnitId) {
           if (ML.mini.getSystemInfoSync().SDKVersion < '2.0.4') return;
           let self = this;
           self.ad && self.ad.destroy && self.ad.destroy();
           self.state = 1;
           self.ad = ML.mini.createRewardedVideoAd({
               adUnitId: adUnitId,
               multiton: true,
           });

           ML.mini.showLoading({
               title: '加载中',
           });

           self.ad.onError(self._$onError.bind(self));
           self.ad.onClose(self._$onClose.bind(self));
           self.ad.load().then(() => {
               self.ad.show(); 
               ML.mini.hideLoading();
           });
       }

       _$onClose(isEnd) {
           this._closedCallback && this._closedCallback(isEnd.isEnded);
           ML.mini.hideLoading();
       }

       _$onError(res) {
           this.state = 0;
           ML.mini.hideLoading();
           // console.warn('videoAd error', res);
           ML.platform.showToast("当前没有可用的广告");
           this.handleErrorCode(res.errMsg, res.errCode);
       }

       handleErrorCode(msg, code) {
           console.log('ADVideo_Error:', code, msg);
           switch (code) {
               case 1000:
                   console.log('ADVideo_Error:', '后端接口调用失败');
                   break;
               case 1001:
                   console.log('ADVideo_Error:', '参数错误');
                   break;
               case 1002:
                   console.log('ADVideo_Error:', '广告单元无效');
                   break;
               case 1003:
                   console.log('ADVideo_Error:', '内部错误');
                   break;
               case 1004:
                   console.log('ADVideo_Error:', '无合适的广告');
                   break;
               case 1005:
                   console.log('ADVideo_Error:', '广告组件审核中');
                   break;
               case 1006:
                   console.log('ADVideo_Error:', '广告组件被驳回');
                   break;
               case 1007:
                   console.log('ADVideo_Error:', '广告组件被封禁');
                   break;
               case 1008:
                   console.log('ADVideo_Error:', '广告单元已关闭');
                   break;

               default:
                   break;
           }
       }

   }

   class WXInterstitial {

       constructor() {
           this.ad = null;
           this.loaded = false;
       }

       show(onShow, onclose) {
           this.onClose = onclose;
           this.ad && this.ad.show().then((res) => {
               onShow && onShow();
           });
       }

       load(id) {
           if(!id) return;
           this.id = id;
           this.ad = this._$createAd(id);
       }

       _$createAd(id) {
           if (!ML.mini.createInterstitialAd) {
               return null;
           }
           let ad = ML.mini.createInterstitialAd({
               adUnitId: id,
           });
           ad.onLoad(this._$onload.bind(this));
           ad.onClose(this._$onclose.bind(this));
           return ad;
       }

       _$onload() {
       }

       _$onclose() {
           this.onClose && this.onClose();
       }
   }

   class WXAdHelper {

       constructor() {
           this.bannerIds = ML.config.bannerIds;
           this.videoIds = ML.config.videoIds;
           this.interstitialIds = ML.config.interstitialIds;
           this.init();
       }

       init() {
           //向队列预先插入两个
           this.bannerQueue = [this.createBanner(), this.createBanner()];
           this.videoAd = new WXVideo();
           this.interstitial = new WXInterstitial();
           let interstitialId = Tools.RandomOne(this.interstitialIds);
           if(interstitialId){
               this.interstitial.load(interstitialId);
           }
       }

       createBanner() {
           let banner = new WXBanner();
           banner.load(Tools.RandomOne(this.bannerIds));
           return banner;
       }

       showBanner() {
           this.banner && this.hideBanner();
           //从队列取出第一个
           this.banner = this.bannerQueue.shift();
           //向队列尾部插入一个
           this.bannerQueue.push(this.createBanner());
           this.banner.show();
       }

       hideBanner() {
           this.banner && this.banner.hide();
       }

       showVideo(complete, videoId = null) {
           if (!videoId) {
               videoId = Tools.RandomOne(this.videoIds);
           }
           this.videoAd.show(videoId, complete);
       }

       showInterstitial(onShow=null,onClose=null) {
           this.interstitial.show(onShow,onClose);
       }
   }

   class QQPlatformConfig {

       constructor() { 
           //项目版本号
           this.version = "1.0.0";
           //是否分包
           this.shouldSubpackage = true;
           //分包名(不分包则无效)
           this.subpackage = "package1";
           //资源包版本(不分包则无效)
           this.assetsVersionName = "1_0";
           //资源zip包路径  "package1/assets1_0.zip"
           this.assetsZipPath = this.subpackage+"/assets"+this.assetsVersionName+".zip";
           //资源存放路径 "http://usr/assets1_0/“
           this.assetsPathRoot = qq.env.USER_DATA_PATH + "/assets" + this.assetsVersionName+"/";
           //音频文件根目录 ”package1/audio/“
           this.audioPathRoot = this.subpackage+"/audio/";
           this.appId = "wxf1d32aa8d1b023eb";
           this.appKey = "e8ce3ce66421444892f4620112c987f4";
           this.bannerIds = [
               "adunit-40f8998765af3caf",
               "adunit-09c53a6dd242797b"
           ];
           this.videoIds = [
               "adunit-c00049666a85085a",
               "adunit-2026ec5c4de3e2bd"
           ];
           this.interstitialIds = [
               "adunit-53777cdfc537609a"
           ];
       }
   }

   // 文档地址 https://q.qq.com/wiki/

   class OPPOPlatformConfig {
       constructor() { 
           //项目版本号
           this.version = "1.0.0";
           //是否分包(一般不需要分包)
           this.shouldSubpackage = false;
           //分包名(不分包则无效)
           this.subpackage = "package1";
           //资源包版本(不分包则无效)
           this.assetsVersionName = "1_0";
           //资源存放路径
           this.assetsPathRoot = "package1/Conventional/";
           //音频文件根目录 ”package1/audio/“
           this.audioPathRoot = "package1/audio/";
           this.configPathRoot = "package1/config/";
           this.appId = "30250243";
           this.appKey = "fc4d78558e78561fa6ab9604bd1f3795";
           this.advKey = "a2d1f9dc97d24a54b16402603e1e90ee";
           this.bannerIds = [
               "166350"
           ];
           this.videoIds = [
               "166355"
           ];
           this.interstitialIds = [
           ];
           this.nativeIds = [
               "166352"
           ];
           
       }
   }

   // 文档地址 https://cdofs.oppomobile.com/cdo-activity/static/201810/26/quickgame/documentation/system/system-info.html

   class VIVOPlatformConfig {

       constructor() {
           //项目版本号
           this.version = "1.0.0";
           //是否分包(头条不需要分包)
           this.shouldSubpackage = false;
           //分包名(不分包则无效)
           this.subpackage = "package1";
           //资源包版本(不分包则无效)
           this.assetsVersionName = "1_0";
           //资源存放路径
           this.assetsPathRoot = "package1/Conventional/";
           //音频文件根目录 ”package1/audio/“
           this.audioPathRoot = "package1/audio/";
           this.appId = "wxf1d32aa8d1b023eb";
           this.appKey = "e8ce3ce66421444892f4620112c987f4";
           this.bannerIds = [
           ];
           this.videoIds = [
           ];
           this.interstitialIds = [
           ];
       }
   }

   // 文档地址 https://minigame.vivo.com.cn/documents/#/

   class TTPlatformConfig {

       constructor() {
           //项目版本号
           this.version = "1.0.0";
           //是否分包(头条不需要分包)
           this.shouldSubpackage = false;
           //分包名(不分包则无效)
           this.subpackage = "package1";
           //资源包版本(不分包则无效)
           this.assetsVersionName = "1_0";
           //资源存放路径
           this.assetsPathRoot = "package1/Conventional/";
           //音频文件根目录 ”package1/audio/“
           this.audioPathRoot = "package1/audio/";
           this.appId = "wxf1d32aa8d1b023eb";
           this.appKey = "e8ce3ce66421444892f4620112c987f4";
           this.bannerIds = [
           ];
           this.videoIds = [
           ];
           this.interstitialIds = [
           ];
       }
   }

   // 文档地址 https://microapp.bytedance.com/dev/cn/mini-app/introduction/about-mini-app/general-introduction

   class WebPlatformAudioHelper {

       constructor() {
           this._bgmStopped = true;
           this.lastBgmUrl = null;
       }

       playMusic(url, loop = true, volume = 1) {
           if (url) {
               this.lastBgmUrl = url;
           }
           if (!this.lastBgmUrl) {
               return;
           }
           let loopCount = loop ? 0 : 1;
           let channel = Laya.SoundManager.playMusic(this.lastBgmUrl, loopCount, new Laya.Handler(this, () => {
               console.log('播放');
           }));
           channel.volume = volume;
           return {
               audio: channel,
           }
       }

       stopMusic() {
           Laya.SoundManager.stopMusic();
       }

       playEffect(url) {
           let channel = Laya.SoundManager.playSound(url);
           return {
               audio: channel,
           }
       }

       isMusicStop() {
           this._bgmStopped;
       }
   }

   class MiniPlatformAudioHelper {

       constructor() {
           this.effectAudioList = [];
           this.effectAudioPool = [];
           this._bgm = this.createAudioContext();
           this._bgmStopped = true;
           this.lastBgmUrl = null;
           this.lastBgmVolume = 1;
           this.lastBgmLoop = true;
           let self = this;
           ML.mini.onAudioInterruptionBegin(() => {
               self._bgm.pause();
           });
           ML.mini.onAudioInterruptionEnd(() => {
               if (!self._bgmStopped) {
                   self._bgm.play();
               }
           });
       }

       playMusic(url, loop = true, volume = 1) {
           if (url) {
               this.lastBgmUrl = url;
           }
           this.lastBgmLoop = loop;
           this.lastBgmVolume = volume;
           if (!this.lastBgmUrl) {
               return;
           }
           this._bgmStopped = false;
           this._play(this._bgm, this.lastBgmUrl, this.lastBgmLoop, this.lastBgmVolume);
           return {
               audio: this._bgm,
           }
       }

       stopMusic() {
           this._bgmStopped = true;
           this._bgm.stop();
       }

       playEffect(src) {
           let context = this.getEffectAudioContext();
           this._play(context, src, false);
           return {
               audio: context,
           }
       }
       isMusicStop() {
           this._bgmStopped;
       }

       _play(context, src, loop = true, volume = 1) {
           context.src = src;
           context.loop = loop;
           context.volume = volume;
           context.play && context.play();
       }

       // getEffectAudioContext() {
       //     for (let i = 0; i < this.effectAudioList.length; i++) {
       //         let item = this.effectAudioList[i];
       //         if (item && item.paused) return item;
       //     }
       //     let audioContext = this.createAudioContext();
       //     this.effectAudioList.push(audioContext);
       //     return audioContext;
       // }

       getEffectAudioContext() {
           let con = this.effectAudioPool.pop();
           if (!con) {
               con = this.createAudioContext();
           }
           for (let i = 0; i < this.effectAudioList.length; i++) {
               let item = this.effectAudioList[i];
               if (item && item.paused) {
                   this.effectAudioPool.unshift(item);
                   let index = this.effectAudioList.indexOf(item);
                   this.effectAudioList.splice(index, 1);
                   i--;
               }
           }
           this.effectAudioList.push(con);
           return con;
       }

       createAudioContext() {
           return ML.mini.createInnerAudioContext();
       }
   }

   class OPPOBanner {

       constructor() {

       }

       show() {
           let self = this;
           self.bannerContext && self.bannerContext.show();
           return self.bannerContext;
       }

       load(bannerId) {
           let self = this;
           this.bannerId = bannerId;
           self.bannerContext = self._$createBannerAd(bannerId);
           self.bannerContext.onResize(self._$onResize.bind(self));
           self.bannerContext.onError(self._$onError.bind(self));
           return self.bannerContext;
       }

       _$onResize(size) {
           // this._onResizeCallback && this._onResizeCallback(this.bannerContext, size);
       }

       _$onError(res) {
           console.error('banner error', res);
           ML.event.emit(ML.Constant.Event_OnBannerError, res);
       }

       hide() {
           if (!this.bannerContext) return;
           this.bannerContext.hide();
       }

       _$createBannerAd(adUnitId) {
           let wxsys = qg.getSystemInfoSync();
           let windowWidth = wxsys.windowWidth;
           let windowHeight = wxsys.windowHeight;
           let banner = qg.createBannerAd({
               adUnitId: adUnitId,
               adIntervals: 30,
               style: {
                   left: 0,
                   top: windowHeight - 100,
                   width: windowWidth,
                   height: 100,
               }
           });
           return banner;
       }
   }

   class OPPOVideo {
       constructor() {
           this.state = 0; // 0未加载，1加载中，2已加载
           this.ad = null;
       }

       show(adUnitId, closedCallback = null) {
           this._closedCallback = closedCallback;
           this._$createRewardAD(adUnitId);
       }

       _$createRewardAD(adUnitId) {
           let self = this;
           self.ad && self.ad.destroy();
           self.ad = qg.createRewardedVideoAd({
               adUnitId: adUnitId,
           });

           qg.showLoading({
               title: '加载中',
           });

           self.ad.onError(self._$onError.bind(self));
           self.ad.onClose(self._$onClose.bind(self));
           self.ad.onLoad(self._$onLoad.bind(self));
           self.ad.load();
       }

       _$onClose(isEnd) {
           this._closedCallback && this._closedCallback(isEnd.isEnded);
           qg.hideLoading({});
       }

       _$onLoad() {
           console.log('激励视频加载成功');
           this.ad.show(); 
           qg.hideLoading({});
       }

       _$onError(res) {
           console.log('视频广告异常', res);
           ML.platform.showToast("当前没有可用的广告");
           qg.hideLoading({});
       }
   }

   class OPPONative {
       constructor() { 
           this.nativeAd = null;
       }

       show(nativeId,drawCallback){
           this.nativeAd = qg.createNativeAd({adUnitId: nativeId});
           this.nativeAd.load();
           this.nativeAd.onLoad((res) =>{
               console.log('原生广告加载成功');
               drawCallback(1,this.nativeAd,res.adList);
           });
           this.nativeAd.onError((err)=> {
               console.log('原生广告加载失败',err);
               drawCallback(0);
           });
       }

       hide(){
           if(this.nativeAd){
               this.nativeAd.destroy();
               this.nativeAd = null;
           }
       }
   }

   class OPPOInterstitial {

       constructor() {

       }

       
   }

   class OPPOAdHelper {

       constructor() {
           this.bannerIds = ML.config.bannerIds;
           this.videoIds = ML.config.videoIds;
           this.interstitialIds = ML.config.interstitialIds;
           this.nativeIds = ML.config.nativeIds;

           this.banner = null;
           this.video = null;
           this.interstitial = null;
           this.nativeAd = null;

           this.showInterstitialCount = 0;
           this.lastShowInterstitialTime = 0;

           this.init();
       }

       init() {
           this.banner = new OPPOBanner();
           this.banner.load(Tools.RandomOne(this.bannerIds));

           this.video = new OPPOVideo();
           // this.interstitial = new OPPOInterstitial();
           this.nativeAd = new OPPONative();
       }

       showBanner() {
           this.banner.show();
       }

       hideBanner() {
           if (!this.banner) return;
           this.banner.hide();
       }

       showVideo(callback,id = null) {
           if(!id){
               id = Tools.RandomOne(this.videoIds);
           }
           this.video.show(id,callback);
       }

       showInterstitial() {
           if (this.showInterstitialCount >= 8) {
               console.log('showInterstitialCount 8');
               return false;
           }
           let now = Date.now();
           if (now - this.lastShowInterstitialTime < 60 * 1000) {
               console.log('showInterstitialTime');
               return false;
           }
           let self = this;
           this.interstitial.show(this.interstitialIdList[0], () => {
               self.showInterstitialCount++;
               self.lastShowInterstitialTime = now;
               self.hideBanner();
           },
               () => {
                   self.showBanner();
               });
           return true;
       }

       showNativeAd(drawCallback) {
           let nativeId = Tools.RandomOne(this.nativeIds);
           this.nativeAd.show(nativeId, drawCallback);
       }

       hideNativeAd() {
           this.nativeAd.hide();
       }
   }

   class Platform {
   }
   /**
    *Platform定义了各个平台的平台名和平台api调用前最 
    */

   //平台名
   Platform.WEB = "WEB";
   Platform.WX = "WX";
   Platform.QQ = "QQ";
   Platform.OPPO = "OPPO";
   Platform.VIVO = "VIVO";
   Platform.TT = "TT";

   //平台api调用命名空间
   Platform.NameSpace = {
       WEB: "",
       WX: "wx",
       QQ: "qq",
       OPPO: "qg",
       VIVO: "qg",
       TT: "tt"
   };
   //平台配置类
   Platform.Config = {
       WEB: WebPlatformConfig,
       WX: WXPlatformConfig,
       QQ: QQPlatformConfig,
       OPPO: OPPOPlatformConfig,
       VIVO: VIVOPlatformConfig,
       TT: TTPlatformConfig,
   };

   Platform.ResourceLoader = {
       WEB: WebResourceModuleHelper,
       WX: WXResourceModuleHelper,
       QQ: WXResourceModuleHelper,
       OPPO: WebResourceModuleHelper,
       VIVO: WXResourceModuleHelper,
       TT: WebResourceModuleHelper,
   };

   Platform.Helper = {
       WEB: WebPlatformHelper,
       WX: MiniPlatformHelper,
       QQ: MiniPlatformHelper,
       OPPO: OVPlatformHelper,
       VIVO: OVPlatformHelper,
       TT: MiniPlatformHelper,
   };

   Platform.Ad = {
       WEB: WebAdHelper,
       WX: WXAdHelper,
       QQ: WXAdHelper,
       OPPO: OPPOAdHelper,
       VIVO: WXAdHelper,
       TT: WXAdHelper,
   };

   Platform.Audio = {
       WEB: WebPlatformAudioHelper,
       WX: MiniPlatformAudioHelper,
       QQ: MiniPlatformAudioHelper,
       OPPO: MiniPlatformAudioHelper,
       VIVO: MiniPlatformAudioHelper,
       TT: MiniPlatformAudioHelper,
   };

   class ModuleBase extends Laya.Script {

       constructor() {
           super();
           this.moduleName = "base";
       }

       onAwake() {
       }

       onStart(){

       }

       onUpdate(){

       }


   }

   class SkinModuleConfig { }

   SkinModuleConfig.DefaultSelected = {
       1:1001,     //杆子
       2:2001      //角色
   };
   // -id
   // -类型（套装、头部、手。。。）
   // -品级（白装、紫装、橙装）
   // -标题（春节套、圣诞帽、手套）
   // -描述（。。。）
   // -模型资源相对路径（唯一标识模型资源，通过该字段可查找）
   // -2D贴图相对路径（展示用的图片资源）
   // -额外属性1（攻击力加成）
   // -额外属性2（移动速加成）
   // -额外属性3（收益加成）
   SkinModuleConfig.data = {
       skins: [
           {
               id: 1001,
               type: 1,    //1撑杆 2角色
               lv: 1,
               title: "杆子1",
               desc: "杆子1",
               resUrl: "1",    //该字段根据项目自定，用来加载对应模型
               image: "skins/101.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1002,
               type: 1,
               lv: 1,
               title: "杆子2",
               desc: "杆子2",
               resUrl: "2",    //该字段根据项目自定，用来加载对应模型
               image: "skins/102.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1003,
               type: 1,
               lv: 1,
               title: "杆子3",
               desc: "杆子3",
               resUrl: "3",    //该字段根据项目自定，用来加载对应模型
               image: "skins/103.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1004,
               type: 1,
               lv: 1,
               title: "杆子4",
               desc: "杆子4",
               resUrl: "4",    //该字段根据项目自定，用来加载对应模型
               image: "skins/104.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1005,
               type: 1,
               lv: 1,
               title: "杆子5",
               desc: "杆子5",
               resUrl: "5",    //该字段根据项目自定，用来加载对应模型
               image: "skins/105.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1006,
               type: 1,
               lv: 1,
               title: "杆子6",
               desc: "杆子6",
               resUrl: "6",    //该字段根据项目自定，用来加载对应模型
               image: "skins/106.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1007,
               type: 1,
               lv: 1,
               title: "杆子7",
               desc: "杆子7",
               resUrl: "7",    //该字段根据项目自定，用来加载对应模型
               image: "skins/107.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1008,
               type: 1,
               lv: 1,
               title: "杆子8",
               desc: "杆子8",
               resUrl: "8",    //该字段根据项目自定，用来加载对应模型
               image: "skins/108.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 1009,
               type: 1,
               lv: 1,
               title: "杆子9",
               desc: "杆子9",
               resUrl: "9",    //该字段根据项目自定，用来加载对应模型
               image: "skins/109.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2001,
               type: 2,
               lv: 1,
               title: "角色1",
               desc: "角色1",
               resUrl: "1",    //该字段根据项目自定，用来加载对应模型
               image: "skins/1.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2002,
               type: 2,
               lv: 1,
               title: "角色2",
               desc: "角色2",
               resUrl: "2",    //该字段根据项目自定，用来加载对应模型
               image: "skins/2.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2003,
               type: 2,
               lv: 1,
               title: "角色3",
               desc: "角色3",
               resUrl: "3",    //该字段根据项目自定，用来加载对应模型
               image: "skins/3.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2004,
               type: 2,
               lv: 1,
               title: "角色4",
               desc: "角色4",
               resUrl: "4",    //该字段根据项目自定，用来加载对应模型
               image: "skins/4.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2005,
               type: 2,
               lv: 1,
               title: "角色5",
               desc: "角色5",
               resUrl: "5",    //该字段根据项目自定，用来加载对应模型
               image: "skins/5.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2006,
               type: 2,
               lv: 1,
               title: "角色6",
               desc: "角色6",
               resUrl: "6",    //该字段根据项目自定，用来加载对应模型
               image: "skins/6.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2007,
               type: 2,
               lv: 1,
               title: "角色7",
               desc: "角色7",
               resUrl: "7",    //该字段根据项目自定，用来加载对应模型
               image: "skins/7.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2008,
               type: 2,
               lv: 1,
               title: "角色8",
               desc: "角色8",
               resUrl: "8",    //该字段根据项目自定，用来加载对应模型
               image: "skins/8.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2009,
               type: 2,
               lv: 1,
               title: "角色9",
               desc: "角色9",
               resUrl: "9",    //该字段根据项目自定，用来加载对应模型
               image: "skins/9.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2010,
               type: 2,
               lv: 1,
               title: "角色10",
               desc: "角色10",
               resUrl: "10",    //该字段根据项目自定，用来加载对应模型
               image: "skins/10.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2011,
               type: 2,
               lv: 1,
               title: "角色11",
               desc: "角色11",
               resUrl: "11",    //该字段根据项目自定，用来加载对应模型
               image: "skins/11.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2012,
               type: 2,
               lv: 1,
               title: "角色9",
               desc: "角色9",
               resUrl: "12",    //该字段根据项目自定，用来加载对应模型
               image: "skins/12.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2013,
               type: 2,
               lv: 1,
               title: "角色9",
               desc: "角色9",
               resUrl: "13",    //该字段根据项目自定，用来加载对应模型
               image: "skins/13.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
           {
               id: 2014,
               type: 2,
               lv: 1,
               title: "角色9",
               desc: "角色9",
               resUrl: "14",    //该字段根据项目自定，用来加载对应模型
               image: "skins/14.png",
               speedAdd: 1,
               attackAdd: 1,
               scoreAdd: 1
           },
       ],
   };

   class JQuery { }
   JQuery.isPlainObject= function(obj){
       if(!obj || typeof obj !== 'object' || obj.nodeType){
           return false;
       }
       if(obj.constructor && !hasOwnProperty.call(obj, 'constructor') && !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')){
           return false;
       }
       var key;
       for(key in obj){}
       return key === undefined || hasOwnProperty.call(obj, key)
   },
   JQuery.extend = function () {
       /*
       *target被扩展的对象
       *length参数的数量
       *deep是否深度操作
       */
       var options, name, src, copy, copyIsArray, clone,
           target = arguments[0] || {},
           i = 1,
           length = arguments.length,
           deep = false;

       // target为第一个参数，如果第一个参数是Boolean类型的值，则把target赋值给deep
       // deep表示是否进行深层面的复制，当为true时，进行深度复制，否则只进行第一层扩展
       // 然后把第二个参数赋值给target
       if (typeof target === "boolean") {
           deep = target;
           target = arguments[1] || {};

           // 将i赋值为2，跳过前两个参数
           i = 2;
       }

       // target既不是对象也不是函数则把target设置为空对象。
       if (typeof target !== "object" && ! typeof target === 'function') {
           target = {};
       }

       // 如果只有一个参数，则把jQuery对象赋值给target，即扩展到jQuery对象上
       if (length === i) {
           target = this;

           // i减1，指向被扩展对象
           --i;
       }

       // 开始遍历需要被扩展到target上的参数

       for (; i < length; i++) {
           // 处理第i个被扩展的对象，即除去deep和target之外的对象
           if ((options = arguments[i]) != null) {
               // 遍历第i个对象的所有可遍历的属性
               for (name in options) {
                   // 根据被扩展对象的键获得目标对象相应值，并赋值给src
                   src = target[name];
                   // 得到被扩展对象的值
                   copy = options[name];

                   // 比较target和copy，解决在深复制中的存在环的问题，如果存在环会造成栈溢出
                   if (target === copy) {
                       continue;
                   }

                   // 当用户想要深度操作时，递归合并
                   // copy是纯对象或者是数组
                   if (deep && copy && (JQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                       // 如果是数组
                       if (copyIsArray) {
                           // 将copyIsArray重新设置为false，为下次遍历做准备。
                           copyIsArray = false;
                           // 判断被扩展的对象中src是不是数组
                           clone = src && Array.isArray(src) ? src : [];
                       } else {
                           // 判断被扩展的对象中src是不是纯对象
                           clone = src && JQuery.isPlainObject(src) ? src : {};
                       }

                       // 递归调用extend方法，继续进行深度遍历
                       target[name] = JQuery.extend(deep, clone, copy);

                       // 如果不需要深度复制，则直接把copy（第i个被扩展对象中被遍历的那个键的值）
                   } else if (copy !== undefined) {
                       target[name] = copy;
                   }
               }
           }
       }

       // 原对象被改变，因此如果不想改变原对象，target可传入{}
       return target;
   };

   JQuery.clone = function (obj) {
       var buf;
       if (obj instanceof Array) {
           buf = [];
           var i = obj.length;
           while (i--) {
               buf[i] = JQuery.clone(obj[i]);
           }
           return buf;
       } else if (obj instanceof Object) {
           buf = {};
           for (var k in obj) {
               buf[k] = JQuery.clone(obj[k]);
           }
           return buf;
       } else {
           return obj;
       }
   };

   class SkinModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "skin";
           this._data = null;
       }

       onAwake() {
           this._data = JQuery.clone(SkinModuleConfig.data);
       }

       onEnable() {
       }

       onDisable() {
       }

       /**
        * 获取全部皮肤数据
        */
       getAllData() {
           return this._data;
       }

       /**
        * 获取某个类型的全部皮肤数据
        * @param {int} type 类型
        */
       getDataByType(type) {
           return JQuery.clone(this._data.skins.filter((item) => {
               return item.type === type;
           }));
       }

       /**
        * 根据皮肤ID获取皮肤数据
        * @param {int} id 皮肤id
        */
       getDataById(id) {
           return JQuery.clone(this._data.skins.find((item) => {
               return item.id === id;
           }));
       }

       /**
        * 获取已经解锁的皮肤的id列表
        */
       getAllUnlockId() {
           return ml.user.UserData.skins.unlock;
       }

       /**
        * 获取已解锁的皮肤信息
        */
       getAllUnlockInfo() {
           let skins = [];
           let ids = this.getAllUnlockId();
           for (let index = 0; index < ids.length; index++) {
               const selectedId = ids[index];
               const data = this.getDataById(selectedId);
               skins.push(data);
           }
           return skins;
       }
       /**
        * 获取所有未解锁的皮肤信息
        */
       getAllLockInfo() {
           let skins = [];
           let ids = this.getAllUnlockId();
           return this._data.skins.filter((item) => {
               let some = ids.some((id) => {
                   return id == item.id;
               });
               return !some;
           })
       }

       /**
        * 获取已装备的皮肤id
        */
       getAllSelectedId() {
           return ml.user.UserData.skins.selected;
       }

       /**
        * 获取指定类型的已装备的皮肤信息
        * @param {*} type 
        */
       getSelectedByType(type) {
           let selectedInfo = this.getAllSelectedInfo();
           let skin = selectedInfo.find((item) => {
               return item.type == type;
           });
           if (!skin) {
               skin = this.getDefaultSelectedByType(type);
           }
           return skin;
       }

       /**
        * 获取指定类型的默认装备皮肤
        * @param {*} type 
        */
       getDefaultSelectedByType(type) {
           let id = SkinModuleConfig.DefaultSelected[type];
           return this.getDataById(id);
       }

       /**
        * 获取已装备的皮肤信息
        */
       getAllSelectedInfo() {
           let skins = [];
           let ids = this.getAllSelectedId();
           for (let index = 0; index < ids.length; index++) {
               const selectedId = ids[index];
               const data = this.getDataById(selectedId);
               skins.push(data);
           }
           return skins;
       }

       /**
        * 增加已解锁皮肤
        * @param {int} id 皮肤id
        */
       addUnlockId(id) {
           if (this.checkUnlockedById(id)) {
               console.log('已解锁');
               return false;
           }
           let some = this._data.skins.some((item) => {
               return item.id === id;
           });
           if (!some) {
               console.log('不存在的皮肤id');
               return false;
           } else {
               let unlock = this.getAllUnlockId();
               unlock.push(id);
               ml.user.saveUser();
               return true;
           }
       }

       /**
        * 查询皮肤id是否解锁
        * @param {int} id 皮肤id
        */
       checkUnlockedById(id) {
           let all = this.getAllUnlockId();
           return all.includes(id);
       }

       /**
        * 查询皮肤id是否被选中
        * @param {*} id 皮肤id
        */
       checkSelectedById(id) {
           let all = this.getAllSelectedId();
           return all.includes(id);
       }

       /**
        * 设置装备的皮肤
        * @param {int}} id 皮肤id
        */
       addSelectedId(id) {
           if (this.checkSelectedById(id)) {
               console.log('重复选择');
               return false;
           }
           let skin = this.getDataById(id);
           if (!skin) {
               console.log('不存在的皮肤id');
               return false;
           }
           //替换已选择的皮肤类型
           let selectedSkins = this.getAllSelectedInfo();
           let targetSkin = selectedSkins.find((item) => {
               return item.type == skin.type;
           });

           let selected = this.getAllSelectedId();
           let index = selected.indexOf(targetSkin.id);
           if (index == -1) {
               selected.push(id);
           } else {
               selected[index] = id;
           }
           ml.user.saveUser();
           ML.event.emit("Skin_SelectedChanged",skin);
           return true;
       }
   }

   class ResourceLoaderConfig {}

   ResourceLoaderConfig.AssetsList = [
      //DEBUG
      "Car5",
      "Car6",
      "tyre1",
      "tyre2",
      "tyre3",
      "tyre4",
      
   ];

   ResourceLoaderConfig.SkinCount = 0;
   ResourceLoaderConfig.StickCount = 0;

   ResourceLoaderConfig.GetAssetsListWithoutSuf = function () {
       let skinList = [];
       for (let i = 1; i <= ResourceLoaderConfig.SkinCount; i++) {
           let n = "man_skin" + i;
           skinList.push(n);
       }
       let  stickList = [];
       for (let j = 1; j <= ResourceLoaderConfig.StickCount; j++) {
           let m = "Stick_"+j;
           stickList.push(m);
       }
       return ResourceLoaderConfig.AssetsList.concat(skinList,stickList);
   };

   ResourceLoaderConfig.GetAssetsListWithSuf = function(){
       let names = ResourceLoaderConfig.GetAssetsListWithoutSuf();
       return names.map((item,index)=>{
           let v=item+".lh";
           v = ML.config.assetsPathRoot+v;
           return v;
       });
   };

   class CameraFollow extends Laya.Script {

       constructor() {
           super();
       }

       init(target) {
           console.log("init");
           console.log(this.owner);
           this.targetPos = this.owner.transform.position.clone();
           this.cameraPosition = new Laya.Vector3(-4.4, 13, -29);
           this.cameraRotation = new Laya.Vector3(-15, 180, 0);
           this.cameraRotate = 30;
           this.camera = this.owner;
           this.isRun = false;
       }

       setTarget(target, lerp = true) {
           //DEBUG
           // target.addChild(this.owner);
           // return
           
           //pos
           this.target = target;
           let pos = new Laya.Vector3(0, 0, 0);
           // this.target.addChild(this.owner);
           // pos.z = -20;
           // // pos.z = -40;
           // pos.y = 15;
           // // pos.y = 30;
           // pos.x = 10;
           // // pos.x = 15;
           // this.owner.transform.localPosition = pos;
           // //rotation
           // let rotation = this.owner.transform.rotation.clone();
           // rotation.y = 160;
           // // rotation.z =  - 15;
           // rotation.x = -30; 
           // this.owner.transform.localRotationEuler = rotation;

           // this.ros = this.owner.transform.rotationEuler.clone();

           this.offsetVec = new Laya.Vector3(0,0,0);
           Laya.Vector3.subtract(this.target.transform.position,this.owner.transform.position,this.offsetVec);
          
       }

       setRotation(r, lerp = true) {
           this.cameraRotate = r;
           if (!lerp) {
               let selfr = this.owner.transform.rotationEuler;
               let targetr = this.target.transform.rotationEuler;
               selfr.y = targetr.y + this.cameraRotate;
               this.owner.transform.rotationEuler = selfr;
           }
       }


       //upRUN
       upRun() {
           if(this.isRun){
               return
           }
           this.isRun = true;
           // -5 -15
           console.log("up");
           Laya.timer.clearAll(this);
           Laya.timer.frameLoop(1, this, () => {
               let rotation = this.owner.transform.rotation.clone();
               rotation.z-=0.0005; //  -向上抬
               if(rotation.z<-0.1){
                   Laya.timer.clearAll(this);
               }
               this.owner.transform.rotation = rotation;
           });

       }

       //DownRUn
       dowunRun() {
           if(!this.isRun){
               return
           }
           this.isRun = false;
           Laya.timer.clearAll(this);
           console.log("down");
           Laya.timer.frameLoop(1, this, () => {
               let rotation = this.owner.transform.rotation.clone();
               rotation.z+=0.0005; //  -向上抬
               if(rotation.z>0.02){
                   Laya.timer.clearAll(this);
               }
               this.owner.transform.rotation = rotation;
           });

       }


       reset() {
           this.camera.transform.localPosition = this.cameraPosition;
           this.camera.transform.localRotationEuler = this.cameraRotation;
       }

       onEnable() {
           // this.offsetVec = new Laya.Vector3(0,0,0);
           // Laya.Vector3.subtract(this.target.transform.position,this.owner.transform.position,this.offsetVec);
       }

       onDisable() {
           Laya.timer.clearAll(this);
       }

       _move() {
           let targetPos = this.owner.transform.position.clone();
           targetPos.z += 1;
           this.owner.transform.position = targetPos;
       }

       _down() {
           let targetPos = this.owner.transform.position.clone();
           targetPos.z -= 1;
           this.owner.transform.position = targetPos;
       }

       _jump() {
           let targetPos = this.owner.transform.position.clone();
           targetPos.y += 1;
           this.owner.transform.position = targetPos;
       }

       onUpdate(){
           // console.log(this.owner.transform.rotationEuler)
           // this.owner.transform.rotationEuler  = this.ros;
       }
       
       onLateUpdate(){
           if (this.target && this.target) {
               let tmpPos = new Laya.Vector3(0,0,0);
               Laya.Vector3.subtract(this.target.transform.position,this.offsetVec,tmpPos);
               this.owner.transform.position = tmpPos;
           }
       }


   }

   class LevelConfigReader {
   }
   window.mllevel = window.mllevel || LevelConfigReader;

   LevelConfigReader.cachedConfigData = null;

   LevelConfigReader.ReadLevelConfig = function (index, complete, progress = null) {
       let path = ML.config.configPathRoot + "level" + index + ".txt";
       Laya.loader.create(path,
           Laya.Handler.create(LevelConfigReader, (res) => {
               LevelConfigReader.cachedConfigData = res;
               //资源加载完成
               let data = LevelConfigReader.Parse(res);
               complete && complete(data);
           }),
           Laya.Handler.create(LevelConfigReader, (v) => {
               progress && progress(v);
           }));
   };

   LevelConfigReader.Parse = function (res) {
       let json = JSON.parse(res);
       let roads =[];
       for (let i = 0; i < json.length; i++) {
           let roadData = [];
           let roadStr = json[i];
           let pointsStr = roadStr.split(',');
           for (let j = 0; j < pointsStr.length; j++) {
               let pointStr = pointsStr[j];
               let point = pointStr.split('_'); 
               let pointData = {
                   position:new Laya.Vector3(-parseFloat(point[0]),0,parseFloat(point[2])),
                   revive:parseInt(point[3])==1
               };
               roadData.push(pointData);
           }
           roads[i] = roadData;
       }
       return roads;
   };

   LevelConfigReader.UnloadConfig = function(lv){
       let path = ML.config.configPathRoot + "level" + lv + ".txt";

   };

   class LevelSceneReader {
   }

   LevelSceneReader.Read = function (levelNode) {
       let children = levelNode._children;
       for (let i = 0; i < children.length; i++) {
           let child = children[i];
           LevelSceneReader.ReadTrack(child);
           LevelSceneReader.ReadRoad(child);
           LevelSceneReader.ReadItem(child);
       }
   };

   LevelSceneReader.ReadTrack = function (trackNode) {
       let name = trackNode.name;
       let sp = name.split('-');
       let cls = null;
       switch (sp[0]) {
           
           default:
               break;
       }

       if (cls) {
           let track = trackNode.addComponent(cls);
           track.onShow && track.onShow(sp);
       }

   };

   LevelSceneReader.ReadItem = function (node) {
       let name = node.name;
       let sp = name.split('-');
       let cls = null;
       switch (sp[0]) {
           case "jumppod":
           
           default:
               break;
       }
       if (cls) {
           let item = node.addComponent(cls);
           item.onShow && item.onShow(sp);
       }
   };

   LevelSceneReader.ReadRoad = function (node) {
       let name = node.name;
       if (name === "road_finish") {
           node.addComponent(RoadFinishEntity);
       }
   };

   class Maingame extends Laya.Script {

       constructor() {
           super();
           this.gameCount = 0;
           this.isResurrection = 0;
           this._canStart = false;
           this.isExitgame = false; //是否已经退出游戏

       }

       onAwake() {
           //TODO 音乐文件
           ML.event.on("Mini_onShow", this, () => {
               if (this.gameStart) {
                   // ml.audio.playMusic("bgm", 0.15);
               }
           });
           ML.event.on("Mini_onHide", this, () => {
               if (this.gameStart) {
                   // ml.audio.stopMusic();
               }
           });
           ML.event.on("Skin_SelectedChanged", this, (data) => {
               if (!this.gameStart) {
                   if (data.type == 2) {
                       this.changePlayer(data.id);
                   }
               }
           });
           this.loadGame();
       }
       onEnable() {}

       onDisable() {}

       loadGame(complete = null) {
           Laya.timer.clearAll(this);
           let self = this;
           this.gameStart = false;
           this.gametime = 0;
           this.finishCount = 0;
           this.playerWin = false;
           //加载homeView.sence
           Laya.Scene.MLOpen("view/homeView.scene");
           //实际关卡数
           this.realLevelIndex = ml.user.getRealLevel();
           console.log('reallevelIndex: ', this.realLevelIndex);
           ml.audio.playEffect('next');
           // this.loadMap(10, () => {
           this.loadMap(this.realLevelIndex, () => {
               self._loadlight();
               self.reloadPlayer(1006);
               complete && complete();
           });
       }

       //加载摄像机
       _loadlight() {
           if(!ml.light){
               console.log("light Miss");
               return;
           }
           // ml.light.shadowMode = Laya.ShadowMode.Hard;
           // ml.light.shadow = true;
           // //可见阴影距离
           // ml.light.shadowDistance = 1000;
           // //生成阴影贴图尺寸
           // ml.light.shadowResolution = 1024;
           // //生成阴影贴图数量
           // ml.light.shadowPSSMCount = 100;
           // //模糊等级,越大越高,更耗性能
           // ml.light.shadowPCFType = 10;
           // let node = ml.scene3D;
           // for (let i = 0; i < node._children.length; i++) {
           //     if (node._children[i].meshRenderer) {
           //         // node._children[i].meshRenderer.castShadow = true;
           //         node._children[i].meshRenderer.receiveShadow = true;
           //     }
           // }
       }

       startGame() {
           this.isExitgame = false;
           this.gameStart = true;
           // Laya.timer.loop(1000, this, this.checkRank);
           // ml.audio.playMusic("bgm", 0.15);
           // ml.audio.playEffect('Start');
           ML.event.emit("Game_Start", null);
       }

       //完成游戏
       finishGame(player,flag) {   
           if (player === ml.player) {
               ml.audio.stopMusic("bgm");
               this.playerWin = this.checkRank() <= 3;
               if(this.playerWin){
                   ml.audio.playEffect('body');
               }
               Laya.timer.clear(this, this.checkRank);
               Laya.timer.once(200, this, () => {
                   this.showCompleteView(flag);
               });
               ml.user.saveUser();
           }else{
               console.log("AI复活");
               if(flag){
                   player.resurrection();
               }
           } 
       }

       showCompleteView(flag) {
           this._canStart = false;
           if(flag){
               // Laya.Scene.open("view/resurrectionView.scene");
               if(this.realLevelIndex == 1){
                   ml.player.resurrection();
                   return
               }
               if(this.isResurrection<1){
                   Laya.Scene.open("view/resurrectionView.scene",false,flag);
               }else{
                   Laya.Scene.open("view/failView.scene");
               }
               return
           }
           if (this.playerWin) {
               Laya.Scene.open("view/settlementView.scene");
               ml.user.addLevel();
           } else {
               //失败
           Laya.Scene.open("view/failView.scene");
           }
       }

       exitgame() {
           // if(this.isExitgame){
           //     return;
           // }
           // this.isExitgame = true;
           this.isResurrection = 0;
           this.gameCount++;
           ml.user.addLevel();
           //销毁当前关卡
           ML.entity.hideAllEntity();
           this.curLevelScene && this.curLevelScene.destroy();
           // this.curLevelNode && this.curLevelNode.destroy();
           this.loadGame(() => {
               Laya.Resource.destroyUnusedResources();
           });
       }

       onUpdate() {
           if (!this.gameStart) return;
           this.gametime += Laya.timer.delta;
       }

       loadMap(level, complete) {
           console.log("loadMap");
           let self = this;
           ml.resourceloader.loadLevel(level, (res) => {
               if (!res) {
                   console.log("level Miss " + level);
                   return
               }
               if (ml.scene3D) {
                   ml.scene3D.destroy();
               }
               let camera =  res.getChildByName("Camera");
               if(!ml.camera){
                   camera._enableHDR = false; //高范围动态图像  低端手机不支持
               }
               self.curLevelScene = res;
               // LevelSceneReader.Read(res);
               console.log("关卡"+level+"加载成功");
               ml.scene3D = res;
               Laya.stage.addChildAt(ml.scene3D, 0);
               if (!ml.light) {
                   ml.light = ml.scene3D.getChildByName("Light");
               }
               complete && complete();
           }, (v) => {

           });
       }

       //预加载玩家
       reloadPlayer(skinid) {
           ml.player = this.showPlayer(skinid);
           let Character = ml.scene3D.getChildByName("Car1");
           let pos = Character.transform.position.clone();
           // pos.z += 0;
           // pos.z -= 18;
           // //Debug
           // pos.y-=1;
           // pos.y+=5;
           ml.player.owner.transform.position = pos;
           Character.active = false;
           Character.destroy();
           //残影
           // console.log(ml.player.owner);
           // ml.player.owner.getChildAt(1).skinnedMeshRenderer.castShadow = true;
           this._loadCamera();
           //  机器人DEBUG
           this._loadRobat();

       }

       //加载摄像机
       _loadCamera(){
           // return
           //摄像机初始化
           ml.camera = ml.player.owner.getChildByName("Camera");
           if (ml.camera) {
               ml.scene3D.getChildByName("Camera").destroy();
               // ml.cameraFollow.reset();
               return;
           } else {
               ml.camera = ml.scene3D.getChildByName("Camera");
               ml.cameraFollow = ml.camera.getComponent(CameraFollow);
               if (!ml.cameraFollow) {
                   ml.cameraFollow = ml.camera.addComponent(CameraFollow);
               }
               ml.cameraFollow.setTarget(ml.player.owner, false);
               console.log("加载摄像机");
           }
       }

       //加载机器人
       _loadRobat(){
       }

       showPlayer(skinId) {
           ml.player && ML.entity.hideEntity(ml.player);
           return ML.entity.showPlayer(skinId);
       }

       changePlayer(skinId) {
           this.reloadPlayer(skinId, this.levelData);
       }


       getRankList() {
           let players = ML.entity.getEntityGroup('Player').entityLogics;
           let isHave = players.indexOf(ml.player);
           if(isHave == -1){
               players.push(ml.player);
           }
           players.sort((a, b) => {
               return b.currenMoveProgress - a.currenMoveProgress;
           });
           return players;
       }

       checkRank() {
           let ranklist = this.getRankList();
           ML.event.emit('Player_rank',  ranklist.indexOf(ml.player));
           return ranklist.indexOf(ml.player)+1;
       }


       canStart(){
          return this._canStart;
       }

       onStageMouseDown(e) {
           ML.event.emit("Stage_MouseDown", e);
       }

       onStageMouseMove(e) {
           ML.event.emit("Stage_MouseMove", e);
       }

       onStageMouseUp(e) {
           ML.event.emit("Stage_MouseUp", e);
       }

       onMouseOut(e) {
           ML.event.emit("Mouse_Out", e);
       }


   }

   /**
    * 基础cars
    * author ZJ
    */
   class BasePlayerEntity extends Laya.Script3D {
       constructor() {
           super();
       }

       //角色启动入口 main
       gameStart() {
           //TODO
       }

       onShow(data) {
           this.data = data;
           //初始化刚体
           this._initRigidbody();
           //初始化配置
           this._initConfig();
           //初始化轮胎 射线检测点
           this._initChild();
           // Laya.timer.loop(1000, this, this.checkCarRotation);
           // Laya.timer.loop(1000, this, () => {
           //     this.rigidBody.applyForce(new Laya.Vector3(this.curSpeedx, 0, 0));
           // });
           //DEBUG
           // Laya.timer.loop(300,this,this.TOCast)

       }

       _initConfig() {
           //是否开始游戏
           this.isStart = false;
           this.canMove = false;
           //射线检测深度
           this.checkDeep = 5;
           //z方向的ros 
           this.rosZ = -0.01;
           //车子横向最大速度
           this.maxSpeedx = -8;
           //车子横向速度
           this.curSpeedx = -2;
           //是否清楚所有力
           this.isclearForces = false;
           //车子是否在空中
           this.isAir = false;
           this.tyreArr = []; //轮胎数组
           this.heightArr = []; //每次的高度数组
           this.maxScale = 1.5; //轮胎最大缩放
           this.minScale = 0.5; //轮胎最小缩放
           this.curScale = 1; //当前缩放比
           //当前轮胎直径
           this.curDiameter = 2.34;
           //轮胎的最大直径
           this.maxDiameter = this.curDiameter * (this.maxScale / this.curScale);
           this.rayCastPointArr = []; //射线检测点  dynamic
           //子节点的长宽高
           this.childExtent = new Laya.Vector3(0, this.maxDiameter / 2, 0); //轮胎尺寸
           // this.hitResults = new Laya.HitResult();

           //spring 
           //车子应该距离地面高度
           this.carshoudHeight = this.curCarHeight;
           //车子和轮胎之前的距离
           this.carAndtyreDis = 0.01;
           //车子当前高度
           this.carHeight = 0;
           //离地距离
           // this.roadDis = 1;
           this.roadDis = 1;
           //不受力影响高度
           this.onlyG = this.carAndtyreDis + this.curDiameter + this.roadDis;
           //平衡力大小
           this.balance = Math.abs(this.rigidBody.gravity.y * this.rigidBody.mass);

           //最大向上力
           this.maxforces = 20;
           this.maxDownForece = -3; //向下为 -  
           this.curForces = this.maxforces;
           this.downForces = this.maxDownForece;

           //当前应该的旋转
           this.curRosZ = 0;
       }


       //初始化自己子节点
       _initChild() {
           //DEBUG
           let arr = this.owner._children;
           let haveCamera = this.owner.getChildByName("Camera");
           let count = haveCamera ? this.owner._children.length - 1 : this.owner._children.length;
           let data = {
               "maxDiameter": this.maxDiameter,
               "curScale": this.curScale,
               "curDiameter": this.curDiameter,
               "carAndtyreDis": this.carAndtyreDis,
               "maxScale": this.maxScale

           };
           for (let i = 0; i < count; i++) {
               let name = this.owner._children[i].name;
               switch (true) {
                   case name == "tyre": //轮胎数组
                       let tyre;
                       console.log("tyre");
                       console.log(this.tyreArr);
                       for (let j = 0; j < arr[i]._children.length; j++) {
                           tyre = ML.entity.showTyre(j + 1);
                           this.tyreArr.push(tyre);
                           tyre.setTarget(arr[i]._children[j], data);
                       }
                       break;
                   case name == "point": //射线检测点
                       arr[i]._children.forEach((e) => {
                           this.rayCastPointArr.push(e);
                       });
                       break;
                       // case name == "MainPoint": //射线检测点
                       //     arr[i]._children.forEach((e) => {
                       //         this.rayCastPointArr.push(e);
                       //     })
                       //     break;
                   default:
                       break;
               }
           };
       }

       //初始化刚体
       _initRigidbody() {
           this.rigidBody = this.owner.getComponent(Laya.Rigidbody3D);
           if (!this.rigidBody) {
               this.rigidBody = this.owner.addComponent(Laya.Rigidbody3D);
               this.sphereShape = new Laya.BoxColliderShape(10, 3, 10);
               this.rigidBody.colliderShape = this.sphereShape;
           }
           this.rigidBody.overrideGravity = true; //重载重力
           this.rigidBody.gravity = new Laya.Vector3(0, -10, 0); //重力
           this.rigidBody.mass = 1; //质量
           this.rigidBody.friction = 0.5; //摩擦力
           this.rigidBody.restitution = 0.8; //弹力
           this.rigidBody.isTrigger = false; //是否是触发器
           this.rigidBody.isKinematic = false; //是否受重力质量影响
           this.rigidBody.linearVelocity = new Laya.Vector3(-4, 0, 0); //线速度
           this.rigidBody.angularFactor = new Laya.Vector3(0, 0, 1); //锁定旋转速度;
           this.rigidBody.linearFactor = new Laya.Vector3(1, 1, 0); //锁定Z移动的速度;
       }

       onMLUpdate(dt) {
           // this.rigidBody.applyForce(new Laya.Vector3(this.curSpeedx, this.balance, 0));
           this.TOCast();
           this.checkCarRotation();
           this.CastSelf();
       }

       TOCast() {
           this.onlyG = this.carAndtyreDis + this.curDiameter + this.roadDis;
           let count = 0;
           if (this.rayCastPointArr.length == 0) {
               return
           }
           // this.heightArr = [];
           //step2 checkPoint
           for (let i = 0; i < this.rayCastPointArr.length; i++) {
               let Results = [];
               let from = this.rayCastPointArr[i].transform.position.clone();
               let to = from.clone();
               let _y = to.y - this.checkDeep;
               to.y = _y;
               // i++;
               ml.scene3D.physicsSimulation.raycastAllFromTo(from, to, Results);
               if (Results.length != 0) {
                   // console.log(Results);
                   // //step3 调整车辆位置 弹簧
                   this.springDosomething(from, Results, i);
                   count++;
               }
           }

           // this.isclearForces = false;
           this.heightArr = [];
           //判断一条射线都没有结果
           if (count == 0) {
               for (let j = 0; j < this.tyreArr.length; j++) {
                   this.checkTyre(null, j, null);
               }
           }
       }

       //车身自己检测
       CastSelf() {
           let from = this.getPos();
           let to = from.clone();
           let _y = to.y - this.checkDeep;
           to.y = _y;
           let result = [];
           ml.scene3D.physicsSimulation.raycastAllFromTo(from, to, result);
           if (result.length != 0) {
               for (let i = 0; i < result.length; i++) {
                   let r = result[i].collider.owner.name;
                   if (this.checkISselfORchild(r)) {
                       console.log("不是地面！！！");
                       continue;
                   } else {
                       let maxY = -100;
                       let _index = i;
                       for (let j = i; j < result.length; j++) {
                           let pointY = result[j].point.y;
                           if (pointY > maxY) {
                               maxY = pointY;
                               _index = j;
                           }
                       }
                       let rpos = result[_index].point;
                       let height = from.y - rpos.y;
                       let dis;
                       //检测物体的法线
                       let normal = result[_index].normal;
                       dis = Math.abs(height * normal.y);
                       //相对高度
                       this.height = dis;
                       // console.log(result[_index]);
                       // this.curRosZ =result[_index].collider.owner.transform.rotationEuler.z;
                       this.curRosZ =result[_index].collider.owner.transform.localRotationEulerY;
                       // return
                       // if (height <= this.curDiameter) {
                           // let forace = this.rigidBody.totalForce;
                           // this.rigidBody.applyForce(new Laya.Vector3(0, Math.abs(forace.y), 0));
                           // let linearVelocity = this.rigidBody.linearVelocity;
                           // if (linearVelocity.y < 0) {
                           //     linearVelocity.y = 0;
                           //     this.rigidBody.linearVelocity = linearVelocity;
                           // }
                       // }
                       // else if(height <= this.curDiameter/2){
                       //     let linearVelocity = this.rigidBody.linearVelocity;
                       //     if (linearVelocity.y < 0) {
                       //         linearVelocity.y = 0;
                       //         this.rigidBody.linearVelocity = linearVelocity;
                       //     }
                       // }
                       // else {
                       //     let linearVelocity = this.rigidBody.linearVelocity;
                       //     if (linearVelocity.y > 0) {
                       //         linearVelocity.y = 0;
                       //         this.rigidBody.linearVelocity = linearVelocity;
                       //     }
                       // }
                   }
               }
           }

       }

       /**
        * @param {Vector3} startPoint
        * @param {Array} result 
        * @param {Number} index 
        * @param {Boolean} flag 
        */
       springDosomething(startPoint, result, index, flag) {
           // console.log(result);
           for (let i = 0; i < result.length; i++) {
               let r = result[i].collider.owner.name;
               if (this.checkISselfORchild(r)) {
                   console.log("不是地面！！！");
                   continue;
               } else {
                   let maxY = -100;
                   let _index = i;
                   for (let j = i; j < result.length; j++) {
                       let pointY = result[j].point.y;
                       if (pointY > maxY) {
                           maxY = pointY;
                           _index = j;
                       }
                   }
                   let rpos = result[_index].point;
                   let height = startPoint.y - rpos.y;
                   //车子上下检测
                   //当前车子实际应该高度
                   this.carHeight = height;
                   //轮胎检测
                   this.checkTyre(this.carHeight, index, result[_index]);
                   //DEBUG
                   return
                   //不是自己的物体的法线
                   if (flag) {
                       //法线不为1处理
                       console.log("法线不为1处理");
                       console.log(result);
                       let height = startPoint.y - rpos.y;
                       //车子上下检测
                       this.carHeight = height;
                       //轮胎检测
                       this.checkTyre(this.carHeight, index, rpos);
                       return
                   }
                   let normal = result[i].normal;
                   if (normal.y == 1) { //法线为1
                       let height = startPoint.y - rpos.y;
                       //车子上下检测
                       //当前车子实际应该高度
                       this.carHeight = height;
                       //轮胎检测
                       this.checkTyre(this.carHeight, index, rpos);
                       return;
                   } else {
                       let to = startPoint.clone();
                       let precentX = normal.x * this.checkDeep;
                       to.x = startPoint.x - precentX;
                       let precentY = normal.y * this.checkDeep;
                       to.y = startPoint.x - precentY;
                       let Results = [];
                       ml.scene3D.physicsSimulation.raycastAllFromTo(startPoint, to, Results);
                       if (Results.length != 0) {
                           // console.log(Results);
                           // //step3 调整车辆位置 弹簧
                           this.springDosomething(startPoint, Results, index, true);
                       }
                   }

               }
           }
       }

       /**
        * 检测是否或子节点
        * @param {String} name 
        */
       checkISselfORchild(name) {
           if (name.indexOf("Car") == -1 && name.indexOf("tyre") == -1) {
               return false;
           } else {
               return true;
           }
       }

       /**
        * 轮胎的位置
        * @param {Number} height   车轮高度
        * @param {Number} index   车轮下标
        * @param {Object} 1,2,3   模式
        */
       checkTyre(height, index, result) {
           //当前车的相对高度
           // console.log(index+"Height "+height)
           let dis;
           this.tyreArr[index].doSomething(height, result);
           if (!height) {
               // console.log(this.height);
               if (this.height < 0.2) { //在地面上
                   dis = 0.1;
                   this.carHead(dis);
                   this.carButt(dis);
               } else { //在空中
                   dis = 100;
                   this.carHead(dis);
                   this.carButt(dis);
               }
               // this.rigidBody.clearForces();
               return
           }
           //检测物体的法线
           let normal = result.normal;
           dis = height * normal.y;
           this.height = dis;

           this.heightArr.push(dis);
           // //当前车高度判断
           if (this.heightArr.length == 4) {
               let count = 0;
               for (let i = 0; i < this.heightArr.length; i++) {
                   if (this.heightArr[i] >= this.curDiameter && this.heightArr[i] <= this.onlyG) {
                       count++;
                   } else {
                       this.isclearForces = false;
                       break;
                   }
               }
               if (count == 4) {
                   console.log("平衡");
                   // if (!this.isclearForces) {
                   //     this.rigidBody.clearForces();
                   //     this.isclearForces = true;
                   // }
                   // this.rigidBody.applyForce(new Laya.Vector3(this.curSpeedx, this.balance, 0));
                   // return;

                   //DEBUG
                   let linearVelocity = this.rigidBody.linearVelocity;
                   if (linearVelocity.y < 0) {
                       linearVelocity.y = 0;
                       this.rigidBody.linearVelocity = linearVelocity;
                   }
               }
           }
           // if (this.isclearForces) {
           //     this.rigidBody.applyForce(new Laya.Vector3(this.curSpeedx, this.balance, 0));
           //     return;
           // }


           // console.log("相对高度" + dis);
           switch (true) { //前轮
               case index == 0 || index == 1:
                   this.carHead(dis);
                   break;
               default:
                   this.carButt(dis);
                   break;
           }
       }

       //车头
       carHead(dis) {
           if (dis > this.onlyG) { //大于了最大高度
               let forces = this.downForces * ((dis - this.onlyG) / dis);
               // console.error("前轮 下力 " + forces);
               this.rigidBody.applyForce(new Laya.Vector3(0, forces, 0), new Laya.Vector3(-5, 0, 0));
           }
           //小于轮胎 施加向上的力抬起来
           else if (dis < this.curDiameter) { //向上
               let forces = this.curForces * (1 - (dis / this.curDiameter));
               // console.log("前轮 上力 " + forces);
               this.rigidBody.applyForce(new Laya.Vector3(0, forces, 0), new Laya.Vector3(-5 * (1 - dis / this.curDiameter), 0, 0));
               // this.rigidBody.applyForce(new Laya.Vector3(0, forces, 0));
           }
           //小于间隙+大于轮胎 平衡---- 
           else if (dis >= this.curDiameter && dis <= this.onlyG) { //平衡
               //清除所有力
               // this.rigidBody.clearForces();
               // //施加一个平衡力
               // this.rigidBody.applyForce(new Laya.Vector3(this.curSpeedx, this.balance, 0));
           }
       }

       //车屁股
       carButt(dis) {
           if (dis > this.onlyG) { //大于了最大高度
               let forces = this.downForces * ((dis - this.onlyG) / dis);
               // console.error("后轮 下力 " + forces);
               this.rigidBody.applyForce(new Laya.Vector3(0, forces, 0), new Laya.Vector3(5, 0, 0));
           }
           //小于轮胎 施加向上的力抬起来
           else if (dis < this.curDiameter) { //向上
               let forces = this.curForces * (1 - (dis / this.curDiameter));
               // console.log("后轮 上力 " + forces);
               this.rigidBody.applyForce(new Laya.Vector3(0, forces, 0), new Laya.Vector3(5 * (1 - dis / this.curDiameter), 0, 0));
               // this.rigidBody.applyForce(new Laya.Vector3(0, forces, 0));
           }
           //小于间隙+大于轮胎 平衡---- 
           else if (dis >= this.curDiameter && dis <= this.onlyG) { //平衡
               // //清除所有力
               // this.rigidBody.clearForces();
               // //施加一个平衡力
               // this.rigidBody.applyForce(new Laya.Vector3(this.curSpeedx, this.balance, 0));
           }
       }


       onTriggerEnter(other) {
           // this.canMove = false;
           console.log(other);
       }


       checkCarRotation() {
           let ros = this.getRotation();
           this.ros = ros;
           // console.log(ros.z);
           //横向速度判断
           if (ros.z < 0) {
               //轮胎比例小于车身角度
               if (this.curDiameter / this.maxDiameter < ros.z / -35) {
                   this.rigidBody.applyForce(new Laya.Vector3(0, 0, 0));
               } else {
                   let speedx = this.curSpeedx * (1 - ros.z / -35);
                   this.rigidBody.applyForce(new Laya.Vector3(speedx, 0, 0), new Laya.Vector3(-5, 0, 0));
               }
           } else {
               let speedx = this.curSpeedx * (1 - ros.z / -35);
               this.rigidBody.applyForce(new Laya.Vector3(speedx, 0, 0), new Laya.Vector3(-5, 0, 0));
           }
           if (ros.z >=this.curRosZ-1&&ros.z<=this.curRosZ+1) {
               this.rigidBody.angularVelocity = new Laya.Vector3(0, 0, 0);
               return
           }
           if (ros.z > this.curRosZ+30) {
               //角度锁定
               this.rigidBody.angularVelocity = new Laya.Vector3(0, 0, 0.3);
               return
           }
           if (ros.z < this.curRosZ-30) {
               //角度锁定
               this.rigidBody.angularVelocity = new Laya.Vector3(0, 0, -0.3);
               return
           }

       }

       /**
        * 
        * @param {Boolean} flag 
        * return number
        */
       gettyreMaxpos(flag) {
           let maxpos = 0;
           if (flag) {
               for (let i = 0; i < 2; i++) {
                   if (this.tyreArr[i].getPos().y > maxpos) {
                       maxpos = this.tyreArr[i].getPos().y;
                   }
               }
               return maxpos
           } else {
               for (let i = 2; i < 4; i++) {
                   if (this.tyreArr[i].getPos().y > maxpos) {
                       maxpos = this.tyreArr[i].getPos().y;
                   }
               }
               return maxpos
           }
       }

       getPos() {
           return this.owner.transform.position.clone();
       }

       setPos(pos) {
           this.owner.transform.position = pos;
       }

       getRotation() {
           return this.owner.transform.rotationEuler.clone();
           // return this.owner.transform.localRotation.clone();
       }

       setRotation(ros) {
           this.owner.transform.rotationEuler = ros;
           // this.owner.transform.localRotation = ros;
       }

       //加大轮胎
       addTyre() {
           this.curScale += 0.08;
           if (this.curScale >= this.maxScale) {
               this.curScale = this.maxScale;
               return
           }
           let precent = this.curScale / this.maxScale;
           this.curDiameter = this.maxDiameter * precent;
           this.curSpeedx = this.maxSpeedx * (1.1 - precent);
           this.curForces = precent * this.maxforces;
           this.downForces = precent * this.maxDownForece;
           if (this.tyreArr) { //轮胎
               this.tyreArr.forEach((e) => {
                   e.scaleTyre(this.curScale);
               });
           }
       }

       //减小轮胎
       reduceTyre() {
           this.curScale -= 0.08;
           if (this.curScale <= this.minScale) {
               this.curScale = this.minScale;
               return
           }
           let precent = this.curScale / this.maxScale;
           this.curDiameter = this.maxDiameter * precent;
           this.curSpeedx = this.maxSpeedx * (1.1 - precent);
           this.curForces = precent * this.maxforces;
           this.downForces = precent * this.maxDownForece;
           if (this.tyreArr) { //轮胎
               this.tyreArr.forEach((e) => {
                   e.scaleTyre(this.curScale);
               });
           }

       }

       onCollisionEnter() {
           //清除所有力
           // this.rigidBody.clearForces();
       }

       onCollisionExit() {

       }

       onDisable(){
           this.tyreArr = [];
       }
   }

   /**
    * 真实玩家控制 card
    * author ZJ
    */
   class realPlayerEntity extends BasePlayerEntity {
       constructor() {
           super();
       }

       onShow(data) {
           super.onShow(data);
           //上次点击Y
           this.oldTargetY  = 0;
           // let parPos = this.owner.parent.transform.position.clone();
           // this.owner.transform.position = parPos;
       }

       onEnable(){
           ML.event.on('Stage_MouseDown', this, this.onStageMouseDown);
           ML.event.on('Stage_MouseMove', this, this.onStageMouseMove);
           ML.event.on('Stage_MouseUp', this, this.onStageMouseUp);
           ML.event.on("Game_Start", this,this.onGameStart);
       }

       onStageMouseDown(e){
           this.oldTargetY  = e.target.mouseY;
       }

       onStageMouseMove(e){
           // console.log(e.target.mouseX);
           let curY = e.target.mouseY;
           if(this.oldTargetY == 0){
               this.oldTargetY = curY;
               return;
           }
           if(curY - this.oldTargetY<0){
               this.addTyre();
           }else{
               this.reduceTyre();
           }
           this.oldTargetY = curY;
       }
      
       onStageMouseUp(){
           this.oldTargetY  = 0;
       }

       onGameStart(){
           this.gameStart();
       }
   }

   /**
    * 轮胎 item
    * author ZJ
    */
   class tyreItemEnity extends Laya.Script3D {
       constructor() {
           super();
           this.rotationScale = 0.1; //旋转角度大小
           this.maxRotationScale = 1; //最大旋转速度
           //最大离车间隔
           this.carAndtyreDis = 0;
           //最大轮胎直径
           this.maxDiameter = 0;
           //当前轮胎直径
           this.curDiameter = 0;
           this.curScale = 0;
           this.isSky = false;
       }

       onShow(data) {
           console.log(data);
       }

       /**
        * @param {Node} target 
        * @param {Object} data 
        */
       setTarget(target, data) {
           this.carAndtyreDis = data.carAndtyreDis;
           //最大轮胎直径
           this.maxDiameter = data.maxDiameter;
           //当前轮胎直径
           this.curDiameter = data.curDiameter;
           this.curScale = data.curScale;
           this.maxScale = data.maxScale;
           this.target = target; //NODE
           this.rotationScale = this.maxRotationScale * (1 - this.curScale + 0.01);
           this.target.addChild(this.owner);
           this.owner.transform.localPosition = new Laya.Vector3(0, 0, 0);
           let ros = this.owner.transform.localRotationEuler.clone();
           if(ros.x != -180 ){
               ros.x = -180;
           }
           this.owner.transform.localRotationEuler = ros;
       }

       //限制轮子位置  
       limitTryePos() {

       }

       /**
        * @param {number} curScale 
        */
       scaleTyre(curScale) {
           this.curScale = curScale;
           this._scaleTyre(curScale);
           this._setRotation(curScale);
       }

       _scaleTyre(curScale) {
           let _scale = new Laya.Vector3(0, 0, 0);
           _scale.x = curScale;
           _scale.y = curScale;
           _scale.z = 1;
           this.curDiameter = this.maxDiameter * curScale;
           this.owner.transform.localScale = _scale;
       }

       onEnable() {

       }

       //设置旋转速度
       setRotation(curScale) {
           this._setRotation(curScale);
       }

       _setRotation(curScale) {
           this.rotationScale = this.maxRotationScale * (this.maxScale - curScale + 0.01);
       }


       //旋转轮胎
       rotationTyre(dt) {
           // console.log(this.rotationScale);
           //方案一
           // let dt = Laya.timer.delta;
           // let rotation  = new Laya.Vector3(0,0,1);
           // rotation.z+=this.rotationScale*dt;
           // this.owner.transform.rotate(rotation,false,false);

           //方案2
           // let dt = Laya.timer.delta;
           let rotation = this.owner.transform.rotationEuler.clone();
           if (rotation.z < -180) {
               rotation.z = 180;
           }
           rotation.z -= this.rotationScale * dt;
           this.owner.transform.rotationEuler = rotation;
       }


       getPos() {
           return this.owner.transform.position.clone();
       }

       setPos(pos) {
           this.owner.transform.position = pos;

       }

       getLocalPos() {
           return this.owner.transform.localPosition.clone();
       }

       setLocalPos(pos) {
           this.owner.transform.localPosition = pos;

       }

       getParPos() {
           return this.target.transform.position.clone();
       }

       setParPos(pos) {
           // this.target.transform.position = pos;
       }

       getParLocalPos() {
           return this.target.transform.localPosition.clone();
       }

       setParLocalPos(pos) {
           this.target.transform.localPosition = pos;
       }

       onMLUpdate(dt) {
           this.rotationTyre(dt);
       }

       /**
        * 1,2,3
        * @param {number} height 
        * @param {object} result
        */
       doSomething(height, result) {
           if (!height) {
               if (this.height < 0.5) {
                   let ppos = this.getParPos();
                   ppos.y = this.curDiameter / 2 + ppos.y;
                   this.setPos(ppos);
               } else {
                   let ppos = this.getParLocalPos();
                   ppos.y = ppos.y - this.curDiameter / 2 - this.carAndtyreDis;
                   ppos.x = 0;
                   ppos.z = 0;
                   this.setLocalPos(ppos);
               }
               this.isSky = true;
               return

           }
           //检测碰撞的点
           let rpos = result.point;
           //检测碰撞的法线
           let normal = result.normal;
           this.height = height;
           this.isSky = false;
           //高度大于轮胎直径+最大间隙
           if (this.height > this.curDiameter + this.carAndtyreDis) {
               //此时车和轮子之间的间距
               let gap = this.curDiameter / 2 + this.carAndtyreDis;
               //父节点的坐标
               let ppos = this.getParLocalPos();
               //自己坐标
               let spos = this.getLocalPos();
               //x 当前x-gap*x方向的法线
               // spos.x = ppos.x - gap * normal.x;
               spos.y = ppos.y - gap * normal.y;
               this.setLocalPos(spos);
           }
           //高轮胎小于轮胎间隙
           else if (this.height >= this.curDiameter && this.height <= this.curDiameter + this.carAndtyreDis) {
               //此时车和轮子之间的间距
               let gap = this.curDiameter / 2;
               //父节点的坐标
               let ppos = this.getParLocalPos();
               //自己坐标
               let spos = this.getLocalPos();
               //x 当前x-gap*x方向的法线
               // spos.x = ppos.x - gap * normal.x;
               spos.y = ppos.y - gap * normal.y;
               this.setLocalPos(spos);
           }
           //小于轮胎的高度  轮子的高度 = 检测点+轮胎半径
           else {
               //此时车和轮子之间的间距
               let gap = this.curDiameter / 2;
               //父节点的坐标
               let ppos = this.getParLocalPos();
               //自己坐标
               let spos = this.getLocalPos();
               //x 当前x-gap*x方向的法线
               // spos.x = ppos.x - gap * normal.x;
               spos.y = ppos.y + this.curDiameter/2 - this.height;
               this.setLocalPos(spos);
               // //此时车和轮子之间的间距
               // let gap = this.curDiameter / 2 + 0.2;
               // //自己坐标
               // let spos = this.getPos();
               // //x 当前x-gap*x方向的法线
               // // spos.x = spos.x - gap * normal.x;
               // spos.y = rpos.y + this.curDiameter / 2;
               // this.setPos(spos);
           }
       }

       doSpring() {

       }




   }

   class EntityHelper {

       constructor() {
           ML.entity.showPlayer = this._$showPlayer.bind(this);
           ML.entity.showTyre = this._$showTyre.bind(this);
       }

       init() {
           if (!ml.game) {
               let node = new Laya.Node();
               //添加Maingame脚本
               ml.game = node.addComponent(Maingame);
               node.name = "myGame";
               Laya.stage.addChild(node);
           }
           if (!ml.Particel) { //存放粒子特效的节点
               ml.particel = new Laya.Scene3D();
               ml.particel.name = "particel";
               Laya.stage.addChild(ml.particel);
           }
           //预加载场景
           // TODO
           this.init3DUIScene();
           this.preloadEntity();
       }

       init3DUIScene() {
           if (!ml.scene3DUI) {
               ml.scene3DUI = new Laya.Scene3D();
               Laya.stage.addChild(ml.scene3DUI);
               ml.scene3DUI.zOder = 10000;
               let camera = new Laya.Camera(0, 0.1, 1000);
               ml.scene3DUI.addChild(camera);
               camera.transform.translate(new Laya.Vector3(5, -10, 1));
               camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
               camera.orthographic = true;
               camera.orthographicVerticalSize = 17;

               let directionLight = new Laya.DirectionLight();
               directionLight.color = new Laya.Vector3(233 / 255, 241 / 255, 253 / 255);
               directionLight.intensity = 0.3;
               ml.scene3DUI.addChild(directionLight);
               ml.camera3dUI = camera;
               ml.uiLight = directionLight;
           }
       }

       preloadEntity() {
           //TODO:预加载某些耗时实体
           //钥匙粒子
           // this._$perloadParticel("Particle_getkey01");
       }

       _$showPlayer(skinId) {
           //包装data
           let data = {
               curLevel : 1
           };
           //包装data
           let skinInfo = null;
           if (skinId) {
               skinInfo = ml.skin.getDataById(skinId);
           } else {
               skinInfo = ml.skin.getSelectedByType(2);
           }
           data.skin = skinInfo;
           // return this._$showPlayerById(2, realPlayerEntity, data, ml.scene3D, "Player");
           // return this._$showPlayerById(skinInfo.resUrl, realPlayerParEntity, data, ml.scene3D, "Player");
           return this._$showPlayerById(skinInfo.resUrl, realPlayerEntity, data, ml.scene3D, "Player");
       }

       _$showTyre(i){
           let data = {};
           return ML.entity.showEntity(this["tyre"+i], tyreItemEnity, ml.scene3D, data, "Player");
       }

       _$showAiPlayer(data) {
           let skinId = RandomUtil.randomIntegerN2M(1, 14);
           let skinInfo = ml.skin.getDataById(skinId);
           data.skin = skinInfo;
           return this._$showPlayerById(skinId, AiPlayerEntity, data, ml.scene3D, "Player");
       }

       _$showUIPlayer(id, data = {}) {
           id = id || 1;
           data.skinId = id;
           return this._$showPlayerById(id, UIPlayerEntity, data, ml.scene3DUI, "UIEntity");
       }

       _$showUIStick(id, data) {
           data = data || {};
           let skinName = "Stick_" + id;
           let prefab = this[skinName];
           data.id = id;
           return ML.entity.showEntity(prefab, UIStickEntity, ml.scene3DUI, data, "UIEntity");
       }

       _$showUIChestBox(data) {
           return ML.entity.showEntity(this.Box, UIChestBoxEntity, ml.scene3DUI, data);
       }

       _$showPlayerById(id, cls, data, parent, group) {
           let skinName = "Car" + id;
           // let skinName = "man_skin" + id;
           let prefab = this[skinName];
           return ML.entity.showEntity(prefab, cls, parent, data, group);
       }

       _$showStickById(id, data) {
           data = data || {};
           let skinName = "Stick_" + id;
           let prefab = this[skinName];
           data.id = id;
           return ML.entity.showEntity(prefab, StickEntity, ml.scene3D, data);
       }
       _$showItemDead(data) {
           return ML.entity.showEntity(this.died, ItemDeadEntity, ml.scene3D, data);
       }

       _$showParticle(data) {
           return ML.entity.showEntity(this[data.assetName], BaseParticleEntity, ml.scene3D, data, "Particle");
       }

       _$perloadParticel(name) {
           let parData = {
               assetName: name,
               position: new Laya.Vector3(1000, 1000, 1000),
               interval: 500,
           };
           this._$showParticle(parData);
       }
   }

   class ResourceLoaderModule extends ModuleBase {

       constructor() {
           super();
           //重新设置类名为 "resourceloader"
           this.moduleName = "resourceloader";
       }

       onAwake() {
           //资源名
           this.assetsNameList = ResourceLoaderConfig.GetAssetsListWithoutSuf();
           //完整的资源路径
           this.assetsPath = ResourceLoaderConfig.GetAssetsListWithSuf();
       }

       onEnable() {
       }

       onDisable() {
       }

       load(complete, progress) {
           let self = this;
           if(this.assetsPath.length == 0){
               console.log("资源为空，无需加载");
               self._$initEntityHelper();
           }
           Laya.loader.create(JQuery.clone(this.assetsPath),
               Laya.Handler.create(self, (flag) => {
                   console.log("是否加载成功",flag);
                   //资源加载完成
                   self._$initEntityHelper();
                   complete();
               }),
               Laya.Handler.create(self, (v) => {
                   progress(v);
               })
           );
       }

       loadLevel(index, complete, progress) {
           let self = this;
           let levelResPath = this._$getLevelResPath(index);
           Laya.loader.create(levelResPath,
               Laya.Handler.create(self, (res) => {
                   // let res = Laya.loader.getRes(levelResPath);
                   complete(res);
               }),
               Laya.Handler.create(self, (v) => {
                   progress(v);
               }));
       }

       unloadLevel(level) {
           let levelRes = this.getLevelRes(index);
           if (levelRes) {
               levelRes.destroy();
           }
           // Laya.Resource.destroyUnusedResources();
       }
       getLevelRes(index) {
           let levelResPath = this._$getLevelResPath(index);
           return Laya.loader.getRes(levelResPath);
       }

       _$getLevelResPath(index) {
           return ML.config.assetsPathRoot + "level" + index + ".ls";
       }

       _$initEntityHelper() {
           let entityHelper = new EntityHelper();
           ml.entityHelper = entityHelper;
           let paths = this.assetsPath;
           for (let i = 0; i < this.assetsNameList.length; i++) {
               let name = this.assetsNameList[i];
               entityHelper[name] = Laya.loader.getRes(paths[i]);
           }
           entityHelper.init();
           console.log( ml.entityHelper);
       }
   }

   class ApiModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "api";

           this.baseUrl = 'https://game.woool.live';
           this.shareCardsUrl = this.baseUrl + '/api/shareCard/getShareCardByAppKey';
           this.findByAppKeyUrl = this.baseUrl + '/api/app/findByAppKey';
           //IP屏蔽接口
           this.ipCheckUrl = 'https://api.game.hnquyou.com/api/Product/judgeRegion.html';

           // 诱导分享开关 0-关 1-开
           //早期审核时需要关掉诱导分享，所以0(关)代表正在审核 1(开)代表审核通过
           //可作为所有版本审核总开关
           this.shareOpen = 0;

           //0不屏蔽 1屏蔽   默认
           this.ipCheck = 0;

           //-------------在后台配置ExtraData字段------------
           // {"checkingVersions":['1.0.0'],"bannerMove":1,"quickClick":1}
           //---------配置后在_$initAppInfo中赋值------------
           //banner上移开关，审核时需关闭
           this.bannerMove = 0;
           //猛戳开关，审核时关闭
           this.quickClick = 0;
           //正在审核的版本号列表
           this.checkingVersions = null;
       }

       onEnable() {
           this._$initAppInfo();
           this._$getShareCard().then((res)=>{
               console.log('api shareData ',res);
               if(res.data.length>0){

                   let shareData = Tools.RandomOne(res.data);
                   //设置默认分享素材
                   ML.platform.setDefaultShareData(shareData.title,shareData.image_url);
                   //注册右上角分享
                   ML.platform.onShareAppMessage(shareData.title,shareData.image_url,null);
               }
           });
       }

       /**
        * 当前版本是否正在审核
        */
       isChecking() {
           if (!this.checkingVersions) {
               //为null,默认为true
               return true;
           }
           //当前版本是否在正在审核的版本列表内
           let currenVersion = ML.config.version;
           let inCheckings = this.checkingVersions.filter(e => e === currenVersion);
           return inCheckings.length != 0;
       }

       //是否能做banner上移误点
       canMoveBanner() {
           return !this.isChecking() && this.bannerMove === 1 && this.ipCheck === 0;
       }

       //是否能做猛戳误点
       canQuickClick() {
           return !this.isChecking() && this.quickClick === 1 && this.ipCheck === 0;
       }

       _$initAppInfo() {
           let self = this;
           self.getAppInfo().then((r) => {
               //分享开关(审核开关) 0-关 1-开
               self.shareOpen = r.data.openShare;
               if (!r.data.extraData) return;
               //对应后台extraData
               let extraData = JSON.parse(r.data.extraData);
               console.log("api share ", self.shareOpen);
               console.log("api extraData ", extraData);

               self.bannerMove = extraData.bannerMove;
               self.quickClick = extraData.quickClick;
               self.checkingVersions = extraData.checkingVersions;
           });
       }

       getAppInfo() {
           let self = this;
           if (self.appInfo) return new Promise((r, s) => { r(self.appInfo); });
           let par = {
               appKey: ML.config.appKey,
           };
           return ML.http.get(this.findByAppKeyUrl, par);
       }

       _$getJudgeRegion() {
           let self = this;
           let params = {
               appid: 'wx8531444efb65aea7',
               scene: ML.platform.getLaunchOption().scene,
           };
           ML.http.post(this.judgeRegionUrl, params).then((r) => {
               self.ipCheck = r.Result.Status;
               console.log('api ipCheck---:', r);
           });
       }

       _$getShareCard() {
           return ML.http.get(this.shareCardsUrl, { appKey: ML.config.appKey });
       }
   }

   class UserDataModuleConfig { }
   //当前关卡数量
   UserDataModuleConfig.LevelCountNow = 20;
   UserDataModuleConfig.data = {
       openId: "",
       nickname: "",
       gender: 0,
       imageUrl: "",
       city: "",
       country: "",
       province: "",
       isNewPlayer: true,
       gold: 0,
       key: 0,
       level: 1,
       realLevel: 1, //达到现有关卡总数中的第几关
       score: 0,
       // skins: {
       //     unlock: [1001, 1002, 2001, 2009, 1009],//已解锁
       //     selected: [1002, 2001],//已装备
       //     try: []//试玩
       // },

       skins: {
           unlock: [1001, 2001],//已解锁
           selected: [1001, 2001],//已装备
           try: [             //视频进度类型的解锁(视频次数)
               // {
               //     id:1001,
               //     progress:1,
               // }
           ]//试玩
       }
   };

   class RandomUtil$1 { };

   RandomUtil$1.randomIntegerN2M = function (n, m) {
       var random = Math.floor(Math.random() * (m - n + 1) + n);
       return random;
   };

   RandomUtil$1.randomFloat = function (min, max) {
       var range = max - min;
       var rand = Math.random();
       var num = min + (rand * range);
       return num;
   };

   RandomUtil$1.probabilityCanHappen = function (num) {
       let random = RandomUtil$1.randomIntegerN2M(0, 100);
       return random <= num;
   };
   //传入概率值数组，返回中标的概率下标
   RandomUtil$1.probabilitys = function (parr) {
       var arr = 0;
       var pres = JQuery.clone(parr);
       var probabilityCount = 0;
       for (let i = 0; i < pres.length; i++) {
           probabilityCount += pres[i];
       }
       if (probabilityCount != 100) {
           console.error('所有概率值总和不等于100%');
       }
       var nums = new Array();
       for (let i = 0; i < pres.length; i++) {
           const element = pres[i];
           for (let index = 0; index < element; index++) {
               nums.push(arr);
           }
           arr++;
       }
       var random = RandomUtil$1.randomIntegerN2M(0, 99);
       var targetIndex = nums[random];
       return targetIndex;
   };

   RandomUtil$1.weight = function (weigths) {
       let flag = 0;
       let total = 0;
       let tempWeigths = JQuery.clone(weigths);
       for (let i = 0; i < tempWeigths.length; i++) {
           let weight = tempWeigths[i];
           total += weight;
       }
       let nums = [];
       for (let i = 0; i < tempWeigths.length; i++) {
           let weigth = tempWeigths[i];
           for (let j = 0; j < weigth; j++) {
               nums.push(flag);
           }
           flag++;
       }
       let random = RandomUtil$1.randomIntegerN2M(0, total - 1);
       let targetIndex = nums[random];
       return targetIndex;
   };

   class UserDataModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = 'user';
           this._userData = null;
           this._dataTemplate = UserDataModuleConfig.data;
       }
       onAwake() {
           this.initUserData();
       }

       onEnable() {
       }

       onDisable() {
       }

       get UserData() {
           if (this._userData != null) {
               return this._userData;
           }
           this.initUserData();
       }

       initUserData() {
           this._userData = this._getDataFromLocalStorage();
           if (this._userData != null) {
               return this._userData;
           }
           this._userData = this._dataTemplate;
       }

       _getDataFromLocalStorage() {
           let localData = ML.storage.getObject("User_data", null);
           if (localData) {
               return JQuery.extend(true, this._dataTemplate, localData);
           }
           return this._dataTemplate;
       }

       saveUser() {
           ML.storage.setObject("User_data", this._userData);
       }

       //---------------------------------------

       addGold(v) {
           if (!Tools.IsNumber(v)) {
               console.error('user 金币数不为数字');
               return;
           }
           let afterAdd = this.UserData.gold + v;
           if (afterAdd < 0) {
               afterAdd = 0;
               console.warn('user 消耗的金币数大于金币余额，请检查是否有逻辑错误');
           }
           this.UserData.gold = afterAdd;
           ML.event.emit("User_dataChanged");
           this.saveUser();
       }

       // 加宝箱钥匙，最多3把
       addKey(v) {
           if (!Tools.IsNumber(v)) {
               console.error('user 钥匙数不为数字');
               return;
           }
           let afterAdd = this.UserData.key + v;
           if (afterAdd < 0) {
               afterAdd = 0;
           }
           //最多3把钥匙
           if (afterAdd > 3) {
               afterAdd = 3;
           }
           this.UserData.key = afterAdd;
           ML.event.emit("User_dataChanged");
           this.saveUser();
       }


       //清空宝箱钥匙
       clearKey() {
           this.UserData.key = 0;
           ML.event.emit("User_dataChanged");
           this.saveUser();
       }

       // 加关卡数
       addLevel(v = 1) {
           if (!Tools.IsNumber(v)) {
               return;
           }
           this.UserData.level += v;
           this.addRealLevel(v);
           ML.event.emit("User_dataChanged");
           this.saveUser();
       }
       
       addRealLevel(v = 1) {
           if (!Tools.IsNumber(v)) {
               return;
           }
           //现有40关
           if (this.UserData.realLevel > UserDataModuleConfig.LevelCountNow) {
               return;
           }
           this.UserData.realLevel += v;
       }

       getRealLevel() {
           let levelOfShow = this.UserData.level;
           let l = this.UserData.realLevel;
           if (l > UserDataModuleConfig.LevelCountNow) {//大于配置关卡
               //随机一个关卡给玩家，显示关卡数不变，真实关卡重复
               l = RandomUtil$1.randomIntegerN2M(1, UserDataModuleConfig.LevelCountNow);
           }
           return l;
       }
   }

   class EventModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "event";
           //内置事件
           this.OnAssetsDownloadComplete = "Event_OnAssetsDownloadComplete";   //资源下载完成
           this.OnAssetsDownloadFail = "Event_OnAssetsDownloadFail";           //资源下载失败
           this.OnAssetsDownloadProgress = "Event_OnAssetsDownloadProgress";   //资源下载进度

           this.OnAssetsUnzipComplete = "Event_OnAssetsUnzipComplete";           //资源解压完成
           this.OnAssetsUnzipFail = "Event_OnAssetsUnzipFail";                   //资源解压失败

           this.OnAssetsReady = "Event_OnAssetsReady";                             //资源解压失败

           this.OnAssetsLoadComplete = "Event_OnAssetsLoadComplete";             //资源加载完成
           this.OnAssetsLoadProgress = "Event_OnAssetsLoadProgress";             //资源加载进度
       }

       emit(name, data) {
           this.owner.event(name, data);
       }

       on(name, caller, callback) {
           this.owner.on(name, caller, callback);
       }

       once(name, caller, callback) {
           this.owner.once(name, caller, callback);
       }
       off(name, caller, callback) {
           this.owner.off(name, caller, callback);
       }

       offAllCaller(caller) {
           this.owner.offAllCaller(caller);
       }
   }

   class StorageModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "storage";
       }

       setObject(k, v) {
           if (v) {
               var v = JSON.stringify(v);
           }
           localStorage.setItem(k,v);
       }

       getValue(key, _def) {
           let v = localStorage.getItem(key);
           if (v) return v;
           if (_def) return _def;
           return null;
       }

       getObject(key, _def) {
           let v = this.getValue(key, _def);
           if (!v) return _def;
           return JSON.parse(v);
       }
   }

   class EntityPool {
       constructor() {
           this.entitys = [];
           this.poolName = arguments[0];
           this.size = arguments[1];
           this.releaseInterval = arguments[2];

           //轮询
           this._intervalOfLoopToRelease = 2;
           this._intervalAdditivesOfLoopToRelease = 0;
       }

       size() {
           return this.entitys.length;
       }

       clear() {
           let count = this.entitys.length;
           for (let i = 0; i < count; i++) {
               this.entitys[i].destroy();
           }
           this.entitys.length = 0;
       }

       put(entity) {
           if (this.entitys.length >= this.size) {
               entity.destroy();
               return;
           }
           if (entity && this.entitys.indexOf(entity) === -1) {
               entity.___mlAuto_Raleased = false;
               entity.___mlPool_PutDate = ML.totalTime;
               this.entitys.push(entity);
           }
       }

       get() {
           if (this.entitys.length == 0) {
               return null;
           }
           let last = this.entitys.length - 1;
           let entity = this.entitys[last];
           entity.___mlPool_PutDate = null;
           this.entitys.splice(last, 1);
           return entity;
       }

       onUpdate(dt) {
           return;
           this._intervalAdditivesOfLoopToRelease += dt;
           if (this._intervalAdditivesOfLoopToRelease >= this._intervalOfLoopToRelease) {
               this._intervalAdditivesOfLoopToRelease = 0;
               this._loopEntitysShouldRelease();
           }
       }

       _loopEntitysShouldRelease() {
           if (this.entitys.length == 0) return;
           //每次取出第0个判断是否过期，如果没过期则说明后面的都没过期
           let nowDate = ML.totalTime;

           for (let index = 0; index < this.entitys.length; index++) {
               let entity = this.entitys[index];
               if (!entity.___mlPool_PutDate) {
                   continue;
               }
               if (nowDate - entity.___mlPool_PutDate >= this.releaseInterval) {
                   entity.___mlAuto_Raleased = true;
                   let i = this.entitys.indexOf(entity);
                   this.entitys.splice(i, 1);
                   if (entity) {
                       entity.destroy();
                   }
                   index--;
               } else {
                   return;
               }
           }
       }
   }

   class MLDictionary {
       constructor() {
           this._size = 0;
           this.data = {};
       }

       size() {
           return this._size;
       }

       clear() {
           this.data = {};
           this._size = 0;
       }

       add(k, v) {
           if (!this.containKey(k)) {
               this._size++;
           }
           this.data[k] = v;
       }

       remove(k) {
           if (this.containKey(k) && (delete this.data[k])) {
               this._size--;
           }
       }

       valueForKey(k) {
           return this.containKey(k) ? this.data[k] : null;
       }

       keyForValue(v) {
           for (var prop in this.data) {
               if (this.data[prop] === v) {
                   return prop;
               }
           }
           return null;
       }

       getAllKeys() {
           var keys = [];
           for (var prop in this.data) {
               keys.push(prop);
           }
           return keys;
       }

       getAllValues() {
           var values = [];
           for (var prop in this.data) {
               values.push(this.data[prop]);
           }
           return values;
       }

       containKey(k) {
           return (k in this.data);
       }
   }

   class EntityPoolModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = 'entityPool';
           this.entityPools = new MLDictionary();
       }

       getOrCreatePool(name, size = 30, releaseInterval = 30) {
           let entityPool = this.getEntityPool(name);
           if (!entityPool) {
               entityPool = this.createEntityPool(name, size, releaseInterval);
           }
           return entityPool;
       }

       createEntityPool(name, size, releaseInterval) {
           let entityPool = new EntityPool(name, size, releaseInterval);
           this.entityPools.add(name, entityPool);
           return entityPool;
       }

       getEntityPool(name) {
           return this._findEntityPool(name);
       }

       _findEntityPool(name) {
           return this.entityPools.valueForKey(name);
       }

       onUpdate() {
           let dt = Laya.timer.delta / 1000;
           for (let key in this.entityPools.data) {
               let entityPool = this.entityPools.data[key];
               entityPool.onUpdate(dt);
           }
       }
   }

   class EntityGroup {

       constructor() {
           this.entityLogics = [];

           this.groupData = arguments[0];
           this._paused = false;
           this._timeScale = 1;
       }

       addEntityLogic(entityLogic) {
           entityLogic.entityGroup = this;
           this.entityLogics.push(entityLogic);
       }

       removeEntityLogic(entityLogic) {
           let index = this.entityLogics.indexOf(entityLogic);
           this.entityLogics.splice(index, 1);
       }

       pause() {
           debugger;
           this._paused = true;
       }

       resume() {
           this._paused = false;
       }

       setTimeScale(scale) {
           this._timeScale = scale;
       }

       onUpdate(dt) {
           if (this._paused) { return; }
           if (this.entityLogics.length == 0) { return; }
           for (let i = 0; i < this.entityLogics.length; i++) {
               let entityLogic = this.entityLogics[i];
               if (entityLogic.owner.active) {
               }
               entityLogic.onMLUpdate && entityLogic.onMLUpdate(dt * this._timeScale);
           }
       }

       showEntity(id, prefab, entityType, parentNode, data) {
           let entityLogic = this._showEntity(prefab, entityType);
           entityLogic.entityId = id;
           // entityLogic.owner.parent = parentNode;
           parentNode.addChild(entityLogic.owner);
           entityLogic.willShow && entityLogic.willShow(data);
           entityLogic.owner.active = true;
           //放入实体组
           this.addEntityLogic(entityLogic);
           entityLogic.onShow && entityLogic.onShow(data);
           return entityLogic;
       }

       hideEntity(entityLogic, data) {
           this._hideEntity(entityLogic, data);
       }

       hideAllEntity(data) {
           while (this.entityLogics.length > 0) {
               let entityLogic = this.entityLogics[0];
               ML.entity.hideEntity(entityLogic, data);
           }
       }

       _showEntity(prefab, entityType) {
           let name = prefab.name;
           let pool = this._getOrNewEntityPool(name);
           let entityNode = pool.get();
           if (entityNode == null) {
               entityNode = this._createEntity(prefab, entityType);
           }

           let entity = entityNode.addComponent(entityType);
           entity.parentEntityLogic = null;
           entity.childrenEntityLogic = [];
           entity.onShow = entity.onShow || null;
           entityNode.entity = entity;

           // entity.poolName = pool.poolName;
           entity.__active = true;
           return entity;
       }

       _hideEntity(entityLogic, data) {
           if (!entityLogic.__active) return;
           entityLogic.__active = false;
           let node = entityLogic.owner;
           let pool = this._getOrNewEntityPool(entityLogic.owner.name);
           entityLogic.willHide && entityLogic.willHide(data);
           node.active = false;
           this.removeEntityLogic(entityLogic);
           entityLogic.onHide && entityLogic.onHide(data);
           // node.parent.removeChild(node);
           node.removeSelf();
           entityLogic.destroy();
           entityLogic = null;
           node.entity = null;
           // console.log("hide entity", node.name);
           pool.put(node);
       }

       _createEntity(prefab, entityType) {
           let entityNode = prefab.clone();
           // let entity = entityNode.addComponent(entityType);
           // entity.parentEntityLogic = null;
           // entity.childrenEntityLogic = [];
           // entity.onShow = entity.onShow || null;
           // entityNode.entity = entity;
           return entityNode;
       }

       _getOrNewEntityPool(name) {
           return ML.entityPool.getOrCreatePool(name, this.groupData.poolSize, this.groupData.autoReleaseInterval);
       }
   }

   class MLEntityConfig {
   }
   //实体组
   MLEntityConfig.EntityGroups = [
       {
           groupName: "Default",
           poolSize: 60,
           autoReleaseInterval: 60,
       },
       {
           groupName: "Player",
           poolSize: 60,
           autoReleaseInterval: 60,
       },
       {
           groupName: "UIEntity",
           poolSize: 60,
           autoReleaseInterval: 60,
       },
       {
           groupName: "Particle",
           poolSize: 60,
           autoReleaseInterval: 60,
       }
   ];

   class EntityModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "entity";
           this.entityGroups = new MLDictionary();
           this._serializeId = 0;
           this.itmeScale = 1;

           //创建实体组
           this.initEntityGroups();
       }

       onUpdate() {
           if (this.paused) return;
           for (let key in this.entityGroups.data) {
               let entityGroup = this.entityGroups.data[key];
               entityGroup.onUpdate(Laya.timer.delta * this.itmeScale);
           }
       }

       setTimeScale(scale, group = null) {
           if (group) {
               let g = this.getEntityGroup(group);
               g.setTimeScale(scale);
               return;
           }
           this.itmeScale = scale;
       }

       pause() {
           this.paused = true;
       }

       resume() {
           this.paused = false;
       }

       initEntityGroups() {
           let entityGroupDatas = MLEntityConfig.EntityGroups;
           for (let i = 0; i < entityGroupDatas.length; i++) {
               let entityGroupData = entityGroupDatas[i];
               this.createEntityGroup(entityGroupData);
           }
       }

       createEntityGroup(entityGroupData) {
           let group = new EntityGroup(entityGroupData);
           this.entityGroups.add(entityGroupData.groupName, group);
       }

       getEntityGroup(name) {
           let group = this.entityGroups.valueForKey(name);
           if (!group) {
               console.error('不存在该实体组：', name);
           }
           return group;
       }

       showEntity(prefab, entityType, parentNode, data, groupName = 'Default') {
           let entityGroup = this.getEntityGroup(groupName);
           return entityGroup.showEntity(this._serializeId--, prefab, entityType, parentNode, data);
       }

       hideEntity(entityLogic, data) {
           if (!entityLogic.__active) {
               //console.log('已隐藏');
               return;
           };
           let childrenEntityLogic = entityLogic.childrenEntityLogic;
           while (childrenEntityLogic.length > 0) {
               let logic = childrenEntityLogic[0];
               this.hideEntity(logic, data);
           }
           this.detachedEntity(entityLogic);
           entityLogic.entityGroup.hideEntity(entityLogic, data);
       }

       hideAllEntity(data, groupName = null) {
           if (groupName) {
               let group = this.getEntityGroup(groupName);
               group.hideAllEntity(data);
               return;
           }
           for (let key in this.entityGroups.data) {
               let entityGroup = this.entityGroups.data[key];
               entityGroup.hideAllEntity(data);
           }
       }

       /**
        * 附加子物体
        * @param {*} entityLogic 子物体
        * @param {*} parentEntityLogic 父物体 
        * @param {*} targetNode 
        * @param {*} userData 
        */
       attachToEntity(entityLogic, parentEntityLogic, targetNode = null, userData = null) {
           if (targetNode == null) {
               targetNode = parentEntityLogic.owner;
           }
           this.detachedEntity(entityLogic);
           // entityLogic.owner.parent = targetNode;
           targetNode.addChild(entityLogic.owner);
           //父
           parentEntityLogic.childrenEntityLogic.push(entityLogic);
           parentEntityLogic.onAttached && parentEntityLogic.onAttached(entityLogic, targetNode, userData);
           //子
           entityLogic.parentEntityLogic = parentEntityLogic;
           entityLogic.onAttachTo && entityLogic.onAttachTo(parentEntityLogic, targetNode, userData);
       }

       /**
        * 从父物体上解除子物体
        * @param {*} entityLogic 子物体
        * @param {*} userData 
        */
       detachedEntity(entityLogic, userData = null) {
           let parentEntityLogic = entityLogic.parentEntityLogic;
           if (!parentEntityLogic) {
               return;
           }
           //父
           let index = parentEntityLogic.childrenEntityLogic.indexOf(entityLogic);
           parentEntityLogic.childrenEntityLogic.splice(index, 1);
           parentEntityLogic.onDetached && parentEntityLogic.onDetached(entityLogic, userData);
           //子
           entityLogic.parentEntityLogic = null;
           entityLogic.owner.removeSelf();
           entityLogic.onDetachFrom && entityLogic.onDetachFrom(parentEntityLogic, userData);
       }
   }

   class HttpModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "http";
       }

       post(url, data, header = { "content-type": "application/x-www-form-urlencoded" }) {
           return this._request(url, data, "POST", header);
       }

       get(url, data) {
           return this._request(url, data, "GET");
       }

       _request(url, data, method, header = null) {
           if (!ML.mini) {
               return new Promise((r, s) => {
                   s(" ML http current platform is not miniPlatform");
               });
           }

           return new Promise((r, s) => {
               ML.mini.request({
                   url: url,
                   data: data,
                   header: header,
                   method: method,
                   success: (res) => {
                       r(res.data);
                   },
                   fail: () => {
                       s();
                   }
               });
           });
       }
   }

   //资源加载流程
   //   下载分包----解压----加载到内存
   //   不下载分包---加载到内存
   class ResourceModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "resource";
           this.helper = null;
           this._$internalSetHelper();
       }
       
       onAwake(){
           //设置资源帮助类
       }

       onEnable() {
       }

       onDisable() {
       }

       setHelper(helper) {
           this.helper = helper;
       }

       downloadAssets(){
           let res = {};
           res.downloadProgress = function(v){
               ML.event.emit(ML.event.OnAssetsDownloadProgress,v);
           };
           res.downloadSuccess = function(res){
               ML.event.emit(ML.event.OnAssetsDownloadComplete,res);
           };
           res.downloadFail = function(res){
               ML.event.emit(ML.event.OnAssetsDownloadFail,res);
           };
           res.unZipComplete = function(){
               ML.event.emit(ML.event.OnAssetsUnzipComplete);
           };
           res.assetsReady = function(){
               console.log('assets ready !');
               //资源准备完毕，该回调完成才能加载到内存
               ML.event.emit(ML.event.OnAssetsReady);
           };
           this.helper.downloadAssets(res);
       }

       loadAssets(assetList){
           //获取资源路径列表
           let assetPathList = this.helper.getAssetPathList(assetList);
           //加载到内存
           this._$layaLoadAssets(assetPathList);
       }

       //加载资源（laya原生）
       _$layaLoadAssets(scenePath) {
           let self = this;
           Laya.loader.create(scenePath,
               Laya.Handler.create(self, self._$onAssetsLoadComplete),
               Laya.Handler.create(self, self._$onAssetsLoadProgress));
       }

       _$internalSetHelper() {
           let helper = new Platform.ResourceLoader[MLConfig.PlatformName];
           this.setHelper(helper);
       }

       //资源加载成功
       _$onAssetsLoadComplete(){
           console.log('resload----complete');
       }

       //资源加载进度
       _$onAssetsLoadProgress(v){
           console.log('resload----progress',v);
       }
   }

   class PlatformModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "platform";

       }
       onAwake() {
           this.defaultShareData = { title: "", imageUrl: "", query: null };
           this.helper = this._$getPlatformHelper(MLConfig.PlatformName);
           this.helper.onInit && this.helper.onInit();
       }

       onEnable() {
           ML.event.on('Mini_onShow', this, (res) => {
               ml.scene3D && ml.scene3D.timer.resume();
               // console.log('Platform- Mini_onShow');
           });

           ML.event.on('Mini_onHide', this, () => {
               ml.scene3D && ml.scene3D.timer.pause();
               // console.log('Platform- Mini_onHide');
           });
       }

       onDisable() {
       }

       onUpdate() {
           this.helper.onUpdate && this.helper.onUpdate();
       }

       _$getPlatformHelper(PlatformName) {
           return new Platform.Helper[PlatformName];
       }

       setDefaultShareData(title, imageUrl) {
           this.defaultShareData.title = title;
           this.defaultShareData.imageUrl = imageUrl;
       }

       //---小游戏平台api
       getLaunchOption() {
           return this.helper.getLaunchOption();
       }

       getSystemInfoSync() {
           return this.helper.getSystemInfoSync();
       }

       isIphoneX() {
           return this.helper.isIphoneX();
       }

       isIos() {
           return this.helper.isIos();
       }

       vibrateShort() {
           this.helper.vibrateShort();
       }

       vibrateLong() {
           this.helper.vibrateLong();
       }

       setClipboardData(data, success = null, fail = null) {
           this.helper.setClipboardData(data, success, fail);
       }

       navigatTomini(obj) {
           this.helper.navigateToMiniProgram(obj);
       }

       showModal(data) {
           this.helper.showModal(data);
       }

       showToast(title, toastType = 'none', mask = false) {
           this.helper.showToast(title, toastType, mask);
       }

       showLoading(title = "".mask = false) {
           this.helper.showLoading(title, mask);
       }

       hideLoading() {
           this.helper.hideLoading();
       }

       updateProgram() {
           this.helper.updateProgram();
       }

       onShareAppMessage(title, imageUrl, query) {
           this.helper.onShareAppMessage(title, imageUrl, query);
       }

       share(title, imageUrl, query, callback) {
           this.helper.share(title, imageUrl, query, callback);
       }

       shareDefault() {
           this.share(this.defaultShareData.title, this.defaultShareData.imageUrl, this.defaultShareData.query);
       }
   }

   class AdModule extends ModuleBase {

       constructor() { 
           super(); 
           this.moduleName = 'ad';
           this.helper = new Platform.Ad[MLConfig.PlatformName];
       }
       
       onEnable() {
       }

       onDisable() {
       }

       showBanner(){
           this.helper.showBanner();
       }

       hideBanner(){
           this.helper.hideBanner();
       }

       showVideo(complete,id = null){
           this.helper.showVideo(complete,id);
       }

       showInterstitial(onShow=null, onClose = null){
           this.helper.showInterstitial(onShow,onClose);
       }

       showNativeAd(drawCallback){
           this.helper.showNativeAd(drawCallback);
       }

       hideNativeAd(){
           this.helper.hideNativeAd();
       }
   }

   class AudioModuleConfig {
   }

   AudioModuleConfig.data = {
       // bgm: "game/bgm1.mp3",
       // boom:"game/Bomb_1.mp3",
       // blow:"game/Box_3.mp3",
       // jumpdown:"game/Builder_Game_Item_Pick_Up_Down_Small_3.mp3",
       // stickjump:"game/ESM_Perfect.mp3",
       // dead:"game/GameBloodHit5.mp3",
       // glove:"game/Glovehit_1.mp3",
       // jump:"game/Jump.mp3",
       // finish:"game/Lvlfinish_1.mp3",
       // finishfire:"game/Lvlfinish_3.mp3",
       // goshot:"game/Pistolshot_1.mp3",
       // countdown:"game/Plank_Positiv_reation_1.mp3",
       // jumpitem:"game/Playerjump_1.mp3",
       // speeditem:"game/Ringdefault_2.mp3",
       // stickbend:"game/Stickbending_1.mp3",
       // stickhitground:"game/stickhitground_1.mp3",
       // getBestChest:"ui/Coin_luckybox_1.mp3",
       // open9Chest:"ui/Box_Open_9.mp3",
       // getGold:"ui/ESM_Coin.mp3"
   };

   class AudioModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "audio";
           this.helper = new Platform.Audio[MLConfig.PlatformName];
           this._$init();
       }

       _$init() {
           let self = this;
           ML.event.on("Mini_onShow", self, self._$onProgramShow);
           ML.event.on("Mini_onHide", self, self._$onProgramHide);
       }

       playEffect(name) {
           name = AudioModuleConfig.data[name];
           let url = this._audioDirectory + name;
           this.helper.playEffect(url);
       }

       playMusic(name, v) {
           name = AudioModuleConfig.data[name];
           let url = this._audioDirectory + name;
           this.helper.playMusic(url, true, v);
       }

       stopMusic() {
           this.helper.stopMusic();
       }

       get _audioDirectory() {
           return ML.config.audioPathRoot;
       }

       // _$onProgramShow() {
       //     if (this.helper.isMusicStop()) {
       //         this.playMusic();
       //     }
       // }

       // _$onProgramHide() {
       //     if (!this.helper.isMusicStop())
       //         this.helper.stopMusic();
       // }
   }

   class ChestModuleConfig { }
   ChestModuleConfig.data = {
       bestskin: [
           1001,
           1002,
           1003,
           1004,
           1005,
           1006,
           1007,
           1008,
           1009,
           2001,
           2007,
           2008,
           2009,
           2010,
           2011,
           2012,
           2013,
           2014,
       ],
       normal: [
           50,
           20,
           50,
           20,
           50,
           20,
           50,
           100
       ],
       bestGold:500,//最佳金币
   };

   class ChestModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "chest";
           this._data = null;
       }

       onAwake() {
           this._data = JQuery.clone(ChestModuleConfig.data);
       }

       onEnable() {
       }

       onDisable() {
       }
       /**
        * 获取宝箱数据
        */
       getChestList() {
           //过滤已经解锁的皮肤
           this._$filterUnlocked();
           //随机最佳奖励类型
           let bestType = RandomUtil$1.probabilitys([50, 50]);  //金币、皮肤
           if (this._data.bestskin.length == 0) {
               bestType = 1;  //金币
           }
           let chestObj = {};
           chestObj.bestType = bestType;
           chestObj.list = [];
           //没有皮肤了，设置最佳奖励为金币
           if (bestType == 1) {
               //金币
               chestObj.bestValue = this._data.bestGold;
               chestObj.list.push({
                   type:1,
                   best:true,
                   value:this._data.bestGold,
               });
           } else {
               //皮肤
               let bestOneId = Tools.RandomOne(this._data.bestskin);
               let skinData = ml.skin.getDataById(parseInt(bestOneId));
               chestObj.bestValue = skinData;
               chestObj.list.push({
                   type:0,
                   best:true,
                   value:skinData,
               });
           }
           this._data.normal.forEach(item => {
               let cell = {
                   type: 1,
                   best:false,
                   value: item,
               };
               chestObj.list.push(cell);
           });

           //打乱顺序
           Tools.RandomSort(chestObj.list);
           return chestObj;
       }

       /**
        *  去重
        */
       _$filterUnlocked() {

           let tmp = [];
           this._data.bestskin.forEach(id => {
               let exist = ml.skin.checkUnlockedById(id);
               if (!exist) {
                   tmp.push(id);
               }
           });
           this._data.bestskin = tmp;
       }


   }

   class UIParticleSpriteEntity extends Laya.Script {

       constructor() {
           super();
       }

       onEnable() {
       }

       onDisable() {
       }

       setData(skin, start, end, complete) {
           this.owner.pos(start.x, start.y);
           this.endPos = end;
           this.loopTime = 0;
           Laya.Tween.to(this.owner,{x:end.x,y:end.y},800,Laya.Ease.sineOut,Laya.Handler.create(this,()=>{
               this.owner.destroy();
           }));
       }

       onUpdate() {
           this.loopTime += Laya.timer.delta;
           if (this.loopTime >= 20) {
               this.showParticle();
               this.showParticle();
               this.loopTime = 0;
           }
           // let t = 0.05;
           // this.owner.x = this.owner.x + t * (this.endPos.x - this.owner.x);
           // this.owner.y = this.owner.y + t * (this.endPos.y - this.owner.y);
           // this.owner.x = this.loopTime*Math.pow(100,);
           // this.owner.x = this.loopTime*100;
       }

       showParticle() {
           let x = this.owner.x + RandomUtil$1.randomIntegerN2M(-5, 5);
           let y = this.owner.y + RandomUtil$1.randomIntegerN2M(-5, 5);
           let radiu = RandomUtil$1.randomIntegerN2M(5, 20);
           let color = "#F8CE65";
           ml.particle.addCircleCmd(x, y, radiu, color);
       }
   }

   class FlyParticleEntity extends Laya.Script {

       constructor() {
           super();
       }

       onEnable() {
       }

       onDisable() {
       }

       setData(data) {
           this.data = data;
           this.owner.pos(data.x, data.y);
           this.loopTime = 0;
           Laya.Tween.to(this.owner,{x:data.endx,y:data.endy},800,Laya.Ease.sineOut,Laya.Handler.create(this,()=>{
               for (let i = 0; i < 10; i++) {
                   this.showParticle(40,40);
               }
               data.complete && data.complete();
               this.owner.destroy();
           }));
       }

       onUpdate() {
           this.loopTime += Laya.timer.delta;
           if (this.loopTime >= 20) {
               this.showParticle();
               // this.showParticle();
               this.loopTime = 0;
           }
       }

       showParticle(xf = 5,yf=5) {
           let x = this.owner.x + RandomUtil$1.randomIntegerN2M(-xf, xf);
           let y = this.owner.y + RandomUtil$1.randomIntegerN2M(-xf, xf);
           let radiu = RandomUtil$1.randomIntegerN2M(5, 20);
           let color = this.data.particleColor;
           ml.particle.addCircleCmd(x, y, radiu, color);
       }
   }

   class CustomParticleModule extends ModuleBase {

       constructor() {
           super();
           this.moduleName = "particle";
           this.sp = new Laya.Sprite();
           this.sp.name = "particleSprite";
           this.sp.zOrder = 1000;
           this.sp.pos(0, 0);
           Laya.stage.addChild(this.sp);

           this.CircleCmds = [];
       }

       addCircleCmd(x, y, radiu, color) {
           this.CircleCmds.push({
               x: x,
               y: y,
               radiu: radiu,
               color: color
           });
       }

       onEnable() {

       }

       dofly() {
           this.flySprite('common/gold.png', new Laya.Point(100, 100), new Laya.Point(300, 800));
       }

       flySprite(data) {
           let sp = new Laya.Image();
           sp.anchorX = 0.5;
           sp.anchorY = 0.5;
           let entity = sp.addComponent(FlyParticleEntity);
           this.sp.addChild(sp);
           // sp.loadImage(data.skin);
           sp.skin = data.skin;
           entity.setData(data);
       }

       onUpdate() {
           let dt = Laya.timer.delta / 1000;
           this.sp.graphics.clear();
           this.updateCircleCmd(dt);
       }

       updateCircleCmd(dt) {
           if (this.CircleCmds.length == 0) {
               return;
           }
           for (let i = 0; i < this.CircleCmds.length; i++) {
               const cmd = this.CircleCmds[i];
               this.sp.graphics.drawCircle(cmd.x, cmd.y, cmd.radiu, cmd.color);
               cmd.radiu -= dt * 35;
               if (cmd.radiu <= 0) {
                   this.CircleCmds.splice(this.CircleCmds.indexOf(cmd), 1);
                   i--;
               }
           }
       }

       onUpdateSprite() {

       }
   }

   class SingleAdButton extends Laya.Script {
       constructor() {
           super();
           this._singleAdButton = null;
           this.refreshInterval = 4000;
           this.refreshIntervalAdditive = 0;
       }

       onUpdate() {
           if(!this._singleAdButton) return;
           this.refreshIntervalAdditive +=Laya.timer.delta;
           if(this.refreshIntervalAdditive>=this.refreshInterval){
               this.refreshIntervalAdditive = 0;
               this.reload();
           }
       }

       _onSingleAdButtonClick() {
           if(this.currentItem){
               ml.qy.adClick(this.currentItem,this.data.onFail);
               this.reload();
           }
        }

       init(dataSource,data) {
           this.data =data;
           this.dataSource = dataSource;
           
           this._singleAdButton = new Laya.Image('ui/item_bg1.png');
           this._singleAdButton.size(data.width,data.height);
           this._singleAdButton.anchorX = 0.5;
           this._singleAdButton.anchorY = 0.5;
           this._singleAdButton.centerX = 0;
           this._singleAdButton.centerY = 0;
           this._singleAdButton.on("click", this, this._onSingleAdButtonClick);
           this.owner.addChild(this._singleAdButton);

           this.icon = new Laya.Image();
           this.icon.size(data.iconWidth, data.iconHeight);
           this.icon.top = 15;
           this.icon.centerX = 0;
           this._singleAdButton.addChild(this.icon);

           this.title = new Laya.Label();
           this.title.fontSize = 22;
           this.title.color = "#4C4C4C";
           this.title.bottom = 28;
           this.title.centerX = 0;
           this._singleAdButton.addChild(this.title);

           this.reload();
       }

       reload(){
           let item = Tools.RandomOne(this.dataSource.result);
           if(!item||!item.logo){
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           let self = this;
           Laya.loader.load(logo,Laya.Handler.create(this,(res)=>{
               if(!self||!self.owner||self.owner.destroyed){
                   return;
               }
               if(!self.icon){
                   return;
               }
               self.icon.skin = logo;
           }));
           this.title.text = item.title;
           this.currentItem = item;
       }
   }

   class AdCarousel extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 1000;
           this.startDelay = false;
       }

       onEnable() {
           this.owner.on(Laya.Event.MOUSE_OVER, this, this._onMouseOver);
           this.owner.on(Laya.Event.MOUSE_OUT, this, this._onMouseOut);
       }

       onDisable() {
       }

       _onMouseOver() {
           this.mouseOver = true;
       }

       _onMouseOut() {
           this.mouseOver = false;
       }

       onUpdate() {
           if (this.mouseOver) {
               return;
           }
           if (!this.list) {
               return;
           }
           if (this.startDelay) {
               this.currentDelay -= Laya.timer.delta;
               if (this.currentDelay <= 0) {
                   this.startDelay = false;
                   this.currentDelay = this.slideDelay;
               }
               return;
           }

           if (this.left) {
               this.list.scrollBar.value -= 1;
               if (this.list.scrollBar.value <= 0) {
                   this.left = false;
                   this.startDelay = true;
               }
           } else {
               this.list.scrollBar.value += 1;
               if (this.list.scrollBar.value >= this.list.scrollBar.max) {
                   this.left = true;
                   this.startDelay = true;
               }
           }
       }

       init(dataSource, data) {
           console.log(dataSource.result.length);
           this.dataSource = dataSource;
           this.data = data;
           let bg = new Laya.Image(data.bg);
           bg.centerX = 0;
           bg.centerY = 0;
           bg.width = data.width;
           bg.height = data.height;
           this.owner.addChild(bg);
           this.list = ml.qy.createList(AdCarouselItem, 1, 4, 0, 10, 1);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = data.width;
           this.list.height = data.height - 30;
           this.list.centerY = 0;
           this.list.centerX = 0;
           bg.addChild(this.list);
           this.reload();
       }

       reload() {
           this.list.array = this.dataSource.result;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
           //cell.setText(item.title);
       }

   }
   class AdCarouselItem extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(150, 150);
           this.bg = new Laya.Image('ui/item_bg1.png');
           this.bg.size(150, 150);
           this.bg.centerX = 0;
           this.bg.centerY = 0;
           this.addChild(this.bg);

           this.img = new Laya.Image();
           this.img.size(130, 130);
           this.img.centerX = 0;
           this.img.centerY = 0;
           //this.img.top = 5;
           this.bg.addChild(this.img);

           // this.gtitle = new Laya.Label("");
           // this.gtitle.color = "#4C4C4C";
           // this.gtitle.fontSize = 20;
           // this.gtitle.bottom = 8;
           // this.gtitle.centerX = 0;
           // this.bg.addChild(this.gtitle);
       }

       setImg(url) {
           let self = this;
           Laya.loader.load(url, Laya.Handler.create(this, (res) => {
               if (!self || !self.destroy) {
                   return;
               }
               self.img.skin = url;
           }));
       }

       setText(text) {
           this.gtitle.text = text;
       }
   }

   class AdCarousel$1 extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 1000;
           this.startDelay = false;
       }

       onEnable() {
           this.owner.on(Laya.Event.MOUSE_OVER, this, this._onMouseOver);
           this.owner.on(Laya.Event.MOUSE_OUT, this, this._onMouseOut);
       }

       onDisable() {
       }

       _onMouseOver() {
           this.mouseOver = true;
       }

       _onMouseOut() {
           this.mouseOver = false;
       }

       onUpdate() {
           if (this.mouseOver) {
               return;
           }
           if (!this.list) {
               return;
           }
           if (this.startDelay) {
               this.currentDelay -= Laya.timer.delta;
               if (this.currentDelay <= 0) {
                   this.startDelay = false;
                   this.currentDelay = this.slideDelay;
               }
               return;
           }

           if (this.left) {
               this.list.scrollBar.value -= 1;
               if (this.list.scrollBar.value <= 0) {
                   this.left = false;
                   this.startDelay = true;
               }
           } else {
               this.list.scrollBar.value += 1;
               if (this.list.scrollBar.value >= this.list.scrollBar.max) {
                   this.left = true;
                   this.startDelay = true;
               }
           }
       }

       init(dataSource, data) {
           this.dataSource = dataSource;
           this.data = data;
           let bg = new Laya.Image('ui/bg3.png');
           bg.centerX = 0;
           bg.centerY = 0;
           bg.width = data.width;
           bg.height = data.height;
           this.owner.addChild(bg);
           this.list = ml.qy.createList(AdCarouselItem$1, 6, 1, 20, 0, 2);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = data.width-40;
           this.list.centerY = 0;
           this.list.centerX = 0;
           // this.list.right = 10;
           bg.addChild(this.list);
           this.reload();
       }

       reload() {
           this.list.array = this.dataSource.result;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
       }

   }
   class AdCarouselItem$1 extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(116, 116);
           

           this.img = new Laya.Image();
           this.img.size(116, 116);
           this.img.centerX = 0;
           this.img.centerX = 0;
           this.addChild(this.img);

           
       }

       setImg(url) {
           let self = this;
           Laya.loader.load(url, Laya.Handler.create(this, (res) => {
               if (!self || !self.destroy) {
                   return;
               }
               self.img.skin = url;
           }));
       }

       
   }

   class AdMorePlay extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 1000;
           this.startDelay = false;
       }

       onEnable() {
           this.owner.on(Laya.Event.MOUSE_OVER, this, this._onMouseOver);
           this.owner.on(Laya.Event.MOUSE_OUT, this, this._onMouseOut);
       }

       onDisable() {
       }

       _onMouseOver(){
           this.mouseOver = true;
       }

       _onMouseOut(){
           this.mouseOver = false;
       }

       onUpdate() {
           if(this.mouseOver){
               return;
           }
           if (!this.list) {
               return;
           }
           if(this.startDelay){
               this.currentDelay-=Laya.timer.delta;
               if(this.currentDelay<=0){
                   this.startDelay = false;
                   this.currentDelay = this.slideDelay;
               }
               return;
           }

           if (this.left) {
               this.list.scrollBar.value -= 1;
               if (this.list.scrollBar.value <= 0) {
                   this.left = false;
                   this.startDelay = true;
               }
           } else {
               this.list.scrollBar.value += 1;
               if (this.list.scrollBar.value >= this.list.scrollBar.max) {
                   this.left = true;
                   this.startDelay = true;
               }
           }
       }

       _closeClick() {
           ml.qy.hideAdView(this);
       }

       init(dataSource, data) {
           this.dataSource = dataSource;

           this.data = data;
           // let greyBg = new Laya.Image(data.grey);
           // greyBg.centerX = 0;
           // greyBg.centerY = 0;
           // greyBg.width = Laya.stage.width;
           // greyBg.height = Laya.stage.height;
           // greyBg.on('click', this, this._closeClick);
           // // greyBg.mouseThrough = false;
           // this.owner.addChild(greyBg);

           let bg = new Laya.Image(data.bg);
           bg.centerX = 0;
           bg.centerY = 0;
           // bg.width = data.width;
           // bg.height = data.height;
           this.owner.addChild(bg);

           // let close = new Laya.Image(data.btnBg);
           // close.left = 30;
           // close.top = 40;
           // close.on('click', this, this._closeClick);
           // this.owner.addChild(close);

           // let title = new Laya.Label("爆款小游戏推荐");
           // title.color = "#ffffff";
           // title.fontSize = 40;
           // title.bold = true;
           // title.top = 44;
           // title.centerX = 0;
           // this.owner.addChild(title);

           this.list = ml.qy.createList(AdMoreItem, 3, 3, 20, 20, 1);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = 430;
           this.list.height = 520;
           this.list.centerX = 0;
           this.list.centerY = 0;
           //this.list.top = 110;
           this.owner.addChild(this.list);
           this.reload();
       }

       reload() {
           this.list.array = this.dataSource.result;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if(!item||!item.logo){
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
           cell.setText(item.title);
       }
   }

   class AdMoreItem extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(130, 160);
           // this.bg = new Laya.Image('ui/item_bg1.png');
           // this.bg.size(150, 180);
           // this.bg.centerX = 0;
           // this.bg.centerY = 0;
           // this.addChild(this.bg);

           this.img = new Laya.Image();
           this.img.size(130, 130);
           this.img.centerX = 0;
           this.img.top = 0;
           this.addChild(this.img);

           this.gtitle = new Laya.Label("ssss");
           this.gtitle.color = "#ffffff";
           this.gtitle.fontSize = 24;
           this.gtitle.bottom = 0;
           this.gtitle.centerX = 0;
           this.addChild(this.gtitle);
       }

       setImg(url) {
           let self = this;
           Laya.loader.load(url, Laya.Handler.create(this, (res) => {
               if (!self || !self.destroy) {
                   return;
               }
               self.img.skin = url;
           }));
       }

       setText(text) {
           this.gtitle.text = text;
       }
   }

   class AdGameover extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 2000;
           this.startDelay = false;
       }

       onEnable() {

       }

       onDisable() {
       }

       onUpdate() {
           // if(this.mouseOver){
           //     return;
           // }
           // if (!this.list) {
           //     return;
           // }
           // if(this.startDelay){
               this.currentDelay-=Laya.timer.delta;
               if(this.currentDelay<=0){
                   this.reload();
                   this.currentDelay = this.slideDelay;
               }
           //     return;
           // }

           // if (this.left) {
           //     this.list.scrollBar.value -= 1;
           //     if (this.list.scrollBar.value <= 0) {
           //         this.left = false;
           //         this.startDelay = true;
           //     }
           // } else {
           //     this.list.scrollBar.value += 1;
           //     if (this.list.scrollBar.value >= this.list.scrollBar.max) {
           //         this.left = true;
           //         this.startDelay = true;
           //     }
           // }
       }

       init(dataSource, data) {
           this.dataSource = dataSource;
           this.data = data;

           // let bg = new Laya.Image('ui/blackBg.png');
           // bg.centerX = 0;
           // bg.centerY = 0;
           // bg.width = 600;
           // bg.height = 480;
           // this.owner.addChild(bg);

           this.list = ml.qy.createList(AdGameoverItem, 3, 2, 10, 10, 1);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = 620;
           this.list.height = 420;
           this.list.centerX = 0;
           this.list.centerY = 0;
           // this.list.top = 10;
           this.owner.addChild(this.list);
           this.reload();
       }
       reload() {
           let arr = this.randomSort(this.dataSource.result);
           this.list.array = arr;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
       }

       randomSort(arr) {

           return arr.sort(() => { return Math.random() > .5 ? -1 : 1; });
       }
   }

   class AdGameoverItem extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(200, 200);

           

           this.img = new Laya.Image();
           this.img.size(190, 190);
           this.img.centerX = 0;
           this.img.centerY = 0;
           this.addChild(this.img);

           let bg = new Laya.Image('ui/item_bg2.png');
           bg.size(200, 200);
           bg.centerX = 0;
           bg.centerY = 0;
           this.addChild(bg);

       }

       setImg(url) {
           this.img.skin = url;
       }
   }

   class AdExport extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 1000;
           this.startDelay = false;
       }

       onEnable() {
           this.owner.on(Laya.Event.MOUSE_OVER, this, this._onMouseOver);
           this.owner.on(Laya.Event.MOUSE_OUT, this, this._onMouseOut);
           this.startWudian = ml.api.canMoveBanner();
           ML.ad.hideBanner();
       }

       onDisable() {
           
           if (this.data.close) {
               this.data.close();
           }
       }

       _onMouseOver() {
           this.mouseOver = true;
       }

       _onMouseOut() {
           this.mouseOver = false;
       }

       onUpdate() {
           if (this.mouseOver) {
               return;
           }
           if (!this.list) {
               return;
           }
           if (this.startDelay) {
               this.currentDelay -= Laya.timer.delta;
               if (this.currentDelay <= 0) {
                   this.startDelay = false;
                   this.currentDelay = this.slideDelay;
               }
               return;
           }

           if (this.left) {
               this.list.scrollBar.value -= 1;
               if (this.list.scrollBar.value <= 0) {
                   this.left = false;
                   this.startDelay = true;
               }
           } else {
               this.list.scrollBar.value += 1;
               if (this.list.scrollBar.value >= this.list.scrollBar.max) {
                   this.left = true;
                   this.startDelay = true;
               }
           }
       }

       _closeClick() {
           if (!this.startWudian) {
               ml.qy.hideAdView(this.fri);
               ml.qy.hideAdView(this);
           }else{
               ML.event.emit('StartExportWudian');
               Laya.timer.once(1000,this,()=>{
                   this.startWudian = false;
               });
           }
       }

       init(dataSource, data) {
           this.offsetY = ML.platform.isIphoneX() ? 50 : 0;
           this.dataSource = dataSource;
           this.data = data;

           this.fri = ml.qy.showAdFriend();
           this.fri.owner.top += this.offsetY;
           let greyBg = new Laya.Image('ui/bg2.png');
           greyBg.centerX = 0;
           greyBg.centerY = 0;
           greyBg.width = Laya.stage.width;
           greyBg.height = Laya.stage.height;
           this.owner.addChild(greyBg);

           let haoyouTitle = new Laya.Label("好友在玩");
           haoyouTitle.color = "#CEDB4A";
           haoyouTitle.fontSize = 28;
           haoyouTitle.top = 70 + this.offsetY;;
           haoyouTitle.left = 20;
           this.owner.addChild(haoyouTitle);

           let tuijianTitle = new Laya.Label("热门推荐");
           tuijianTitle.color = "#CEDB4A";
           tuijianTitle.fontSize = 28;
           tuijianTitle.top = 290 + this.offsetY;;
           tuijianTitle.left = 30;
           this.owner.addChild(tuijianTitle);

           // let close = new Laya.Image(data.btn);
           // close.top = 20 + this.offsetY;
           // close.left = 20;
           // close.on('click', this, this._closeClick);
           // greyBg.addChild(close);

           this.list = ml.qy.createList(AdExportItem, 3, 4, 15, 15, 1);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = Laya.stage.width - 60;
           // this.list.height = Laya.stage.height;
           this.list.top = 370;
           this.list.bottom = 80;
           this.list.centerX = 0;
           this.owner.addChild(this.list);
           this.reload();

           let btn = new Laya.Image('ui/btn.png');
           btn.centerX = 0;
           btn.bottom = 40;
           btn.on('click', this, this._closeClick);
           this.owner.addChild(btn);


       }

       reload() {
           this.list.array = this.dataSource.result;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail, this.data.onSuccess);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
           cell.setText(item.title, 0);
       }
   }

   class AdExportItem extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(220, 270);
           this.bg = new Laya.Image('ui/item_bg1.png');
           this.bg.size(220, 270);
           this.bg.centerX = 0;
           this.bg.centerY = 0;
           this.addChild(this.bg);

           this.img = new Laya.Image();
           this.img.size(184, 184);
           this.img.centerX = 0;
           this.img.top = 14;
           this.bg.addChild(this.img);

           let skins = ['ui/0.png', 'ui/1.png', 'ui/2.png', 'ui/3.png', 'ui/4.png', 'ui/5.png','ui/6.png','ui/7.png','ui/8.png'];
           let skin = Tools.RandomOne(skins);
           this.titlebg = new Laya.Image(skin);
           this.titlebg.size(185, 48);
           this.titlebg.bottom = 26;
           this.titlebg.centerX = 0;
           this.bg.addChild(this.titlebg);

           this.gtitle = new Laya.Label("ssss");
           this.gtitle.color = "#ffffff";
           this.gtitle.fontSize = 26;
           this.gtitle.centerY = 0;
           this.gtitle.centerX = 0;
           this.titlebg.addChild(this.gtitle);

           // this.playerNum = new Laya.Label();
           // this.playerNum.fontSize = 22;
           // this.playerNum.color = "#EA3F1B";
           // this.playerNum.bottom = 30;
           // this.playerNum.right = 40;
           // this.addChild(this.playerNum);
       }

       setBg(skin) {
           this.bg.skin = skin;
       }

       setImg(url) {
           let self = this;
           Laya.loader.load(url, Laya.Handler.create(this, (res) => {
               if (!self || !self.destroy) {
                   return;
               }
               self.img.skin = url;
           }));
       }

       setText(text, playerNum) {
           this.gtitle.text = text;
           // this.playerNum.text = playerNum;
       }
   }

   class AdGameover$1 extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 2000;
           this.startDelay = false;
       }

       onEnable() {
           
       }

       onDisable() {
       }

       onUpdate() {
           // if(this.mouseOver){
           //     return;
           // }
           // if (!this.list) {
           //     return;
           // }
           // if(this.startDelay){
               this.currentDelay-=Laya.timer.delta;
               if(this.currentDelay<=0){
                   this.reload();
                   this.currentDelay = this.slideDelay;
               }
           //     return;
           // }

           // if (this.left) {
           //     this.list.scrollBar.value -= 1;
           //     if (this.list.scrollBar.value <= 0) {
           //         this.left = false;
           //         this.startDelay = true;
           //     }
           // } else {
           //     this.list.scrollBar.value += 1;
           //     if (this.list.scrollBar.value >= this.list.scrollBar.max) {
           //         this.left = true;
           //         this.startDelay = true;
           //     }
           // }
       }

       init(dataSource, data) {
           this.dataSource = dataSource;
           this.data = data;

           // let bg = new Laya.Image('ui/blackBg.png');
           // bg.centerX = 0;
           // bg.centerY = 0;
           // bg.width = 600;
           // bg.height = 480;
           // this.owner.addChild(bg);

           this.list = ml.qy.createList(AdGameoverItem$1, 2, 2, 5, 5, 1);
           this.list.scrollBar.touchScrollEnable = false;
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = 550;
           this.list.height = 650;
           this.list.centerX = 0;
           this.list.centerY = 0;
           // this.list.top = 10;
           this.owner.addChild(this.list);
           this.reload();
       }
       reload() {
           let arr = this.randomSort(this.dataSource.result);
           this.list.array = arr;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
           cell.setText(item.title);
       }

       randomSort(arr) {

           return arr.sort(() => { return Math.random() > .5 ? -1 : 1; });
       }
   }

   class AdGameoverItem$1 extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(270, 330);
           this.bg = new Laya.Image('ui/item_bg1.png');
           this.bg.size(270, 330);
           this.bg.centerX = 0;
           this.bg.centerY = 0;
           this.addChild(this.bg);

           this.img = new Laya.Image();
           this.img.size(234, 234);
           this.img.centerX = 0;
           this.img.top = 14;
           this.bg.addChild(this.img);

           let skins = ['ui/0.png', 'ui/1.png', 'ui/2.png', 'ui/3.png', 'ui/4.png', 'ui/5.png','ui/6.png','ui/7.png','ui/8.png'];
           let skin = Tools.RandomOne(skins);
           this.titlebg = new Laya.Image(skin);
           this.titlebg.size(234, 48);
           this.titlebg.bottom = 26;
           this.titlebg.centerX = 0;
           this.bg.addChild(this.titlebg);

           this.gtitle = new Laya.Label("ssss");
           this.gtitle.color = "#ffffff";
           this.gtitle.fontSize = 26;
           this.gtitle.centerY = 0;
           this.gtitle.centerX = 0;
           this.titlebg.addChild(this.gtitle);

           // this.playerNum = new Laya.Label();
           // this.playerNum.fontSize = 22;
           // this.playerNum.color = "#EA3F1B";
           // this.playerNum.bottom = 30;
           // this.playerNum.right = 40;
           // this.addChild(this.playerNum);
       }

       setBg(skin) {
           this.bg.skin = skin;
       }

       setImg(url) {
           let self = this;
           Laya.loader.load(url, Laya.Handler.create(this, (res) => {
               if (!self || !self.destroy) {
                   return;
               }
               self.img.skin = url;
           }));
       }

       setText(text) {
           this.gtitle.text = text;
       }
   }

   class AdFail extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 1000;
           this.startDelay = false;
       }

       onEnable() {
           this.owner.on(Laya.Event.MOUSE_OVER, this, this._onMouseOver);
           this.owner.on(Laya.Event.MOUSE_OUT, this, this._onMouseOut);
       }

       onDisable() {
       }

       _onMouseOver() {
           this.mouseOver = true;
       }

       _onMouseOut() {
           this.mouseOver = false;
       }

       onUpdate() {
           if (this.mouseOver) {
               return;
           }
           if (!this.list) {
               return;
           }
           if (this.startDelay) {
               this.currentDelay -= Laya.timer.delta;
               if (this.currentDelay <= 0) {
                   this.startDelay = false;
                   this.currentDelay = this.slideDelay;
               }
               return;
           }

           if (this.left) {
               this.list.scrollBar.value -= 1;
               if (this.list.scrollBar.value <= 0) {
                   this.left = false;
                   this.startDelay = true;
               }
           } else {
               this.list.scrollBar.value += 1;
               if (this.list.scrollBar.value >= this.list.scrollBar.max) {
                   this.left = true;
                   this.startDelay = true;
               }
           }
       }

       init(dataSource, data) {
           this.dataSource = dataSource;
           this.data = data;

           let bg = new Laya.Image('ui/blackBg.png');
           bg.centerX = 0;
           bg.centerY = 0;
           bg.width = 600;
           bg.height = 520;
           this.owner.addChild(bg);

           this.list = ml.qy.createList(AdGameoverItem$2, 3, 3, 10, 10, 1);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = 600;
           this.list.height = 500;
           this.list.centerX = 10;
           this.list.centerY = 0;
           // this.list.top = 10;
           this.owner.addChild(this.list);
           this.reload();
       }
       reload() {
           this.list.array = this.dataSource.result;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
           cell.setText(item.title);
       }
   }

   class AdGameoverItem$2 extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(185, 230);
           let bg = new Laya.Image('ui/itemBg.png');
           bg.size(185, 220);
           bg.centerX = 0;
           bg.centerY = 0;
           this.addChild(bg);

           this.img = new Laya.Image();
           this.img.size(175, 175);
           this.img.centerX = 0;
           this.img.top = 5;
           this.addChild(this.img);

           let skins = ['ui/0.png', 'ui/1.png', 'ui/2.png', 'ui/3.png', 'ui/4.png', 'ui/5.png'];
           let skin = Tools.RandomOne(skins);
           this.titlebg = new Laya.Image(skin);
           this.titlebg.size(180, 40);
           this.titlebg.bottom = 5;
           this.titlebg.centerX = 0;
           this.addChild(this.titlebg);

           this.gtitle = new Laya.Label("ssss");
           this.gtitle.color = "#ffffff";
           this.gtitle.fontSize = 24;
           this.gtitle.bottom = 5;
           this.gtitle.centerX = 0;
           this.addChild(this.gtitle);
       }

       setImg(url) {
           this.img.skin = url;
       }

       setText(text) {
           this.gtitle.text = text;
       }
   }

   class SingleAdButton$1 extends Laya.Script{
       constructor() {
           super();
           
       }

       onEnable() {
           
       }

       onDisable() {
       }

       init(){
           this.btn = new Laya.Image('ui/exit_btn.png');
           this.btn.size(168,64);
           this.btn.centerX = 0;
           this.btn.centerY = 0;
           this.btn.on("click", this, this._onBtnClick);
           this.owner.addChild(this.btn);
       }

       _onBtnClick(){
           ml.qy.showAdExit();
       }
   }

   class AdExit extends Laya.Script {
       constructor() {
           super();
           this.left = true;
           this.mouseOver = false;
           this.slideDelay = 2000;
           this.currentDelay = 2000;
           this.startDelay = false;
       }

       onEnable() {
           // ML.ad.hideBanner();
       }

       onDisable() {
       }

       onUpdate() {
           // if(this.mouseOver){
           //     return;
           // }
           // if (!this.list) {
           //     return;
           // }
           // if(this.startDelay){
           // this.currentDelay-=Laya.timer.delta;
           // if(this.currentDelay<=0){
           //     this.reload();
           //     this.currentDelay = this.slideDelay;
           // }
           //     return;
           // }

           // if (this.left) {
           //     this.list.scrollBar.value -= 1;
           //     if (this.list.scrollBar.value <= 0) {
           //         this.left = false;
           //         this.startDelay = true;
           //     }
           // } else {
           //     this.list.scrollBar.value += 1;
           //     if (this.list.scrollBar.value >= this.list.scrollBar.max) {
           //         this.left = true;
           //         this.startDelay = true;
           //     }
           // }
       }

       init(dataSource, data) {
           this.dataSource = dataSource;
           this.data = data;
           let offsetY = ML.platform.isIphoneX() ? 40 : 0;

           let bg = new Laya.Image('ui/bg_white.png');
           bg.centerX = 0;
           bg.centerY = 0;
           bg.width = data.width;
           bg.height = data.height;
           this.owner.addChild(bg);

           let titleBg = new Laya.Image('ui/bg_gray0.png');
           titleBg.centerX = 0;
           titleBg.top = 0;
           titleBg.width = data.width;
           titleBg.height = 120 + offsetY;
           this.owner.addChild(titleBg);

           let back = new Laya.Image('ui/arrow-left.png');
           back.top = 60 + offsetY;
           back.left = 20;
           back.on("click", this, this._onBtnClick);
           this.owner.addChild(back);

           this.title = new Laya.Label();
           this.title.text = '小程序';
           this.title.fontSize = 32;
           this.title.bold = true;
           this.title.color = "#181818";
           this.title.top = 60 + offsetY;
           this.title.centerX = 0;
           this.owner.addChild(this.title);

           this.label1 = new Laya.Label();
           this.label1.text = '最近使用';
           this.label1.fontSize = 20;
           this.label1.color = "#8F8F8F";
           this.label1.top = 138 + offsetY;
           this.label1.left = 20;
           this.owner.addChild(this.label1);

           let line = new Laya.Image('ui/line.png');
           line.top = 178 + offsetY;
           line.width = Laya.stage.width - 20;
           line.height = 2;
           line.left = 20;
           this.owner.addChild(line);


           this.list = ml.qy.createList(AdExitItem, 1, dataSource.result.length, 0, 0, 1);
           this.list.selectHandler = new Laya.Handler(this, this.onSelected);
           this.list.renderHandler = new Laya.Handler(this, this.updateItem);
           this.list.width = Laya.stage.width;
           this.list.centerX = 0;
           this.list.top = 180 + offsetY;
           this.list.bottom = 0;
           this.owner.addChild(this.list);
           this.reload();
       }

       _onBtnClick() {
           ml.qy.hideAdView(this);
       }

       reload() {
           let arr = this.randomSort(this.dataSource.result);
           this.list.array = arr;
       }

       onSelected(index) {
           ml.qy.adClick(this.list.array[index], this.data.onFail);
           this.list["_selectedIndex"] = -1;
           console.log('qy ad click', this.list.array[index]);
           this.reload();

       }

       updateItem(cell, index) {
           let item = cell.dataSource;
           if (!item || !item.logo) {
               return;
           }
           let logo = ml.qy.randomLogoUrl(item.logo);
           cell.setImg(logo);
           cell.setText(item.title);
       }

       randomSort(arr) {

           return arr.sort(() => { return Math.random() > .5 ? -1 : 1; });
       }
   }

   class AdExitItem extends Laya.Box {
       constructor() {
           super();
           this.init();
       }

       init() {
           this.size(Laya.stage.width, 132);

           this.img = new Laya.Image();
           this.img.size(92, 92);
           this.img.left = 30;
           this.img.centerY = 0;
           this.addChild(this.img);

           this.label = new Laya.Label();
           this.label.fontSize = 30;
           this.label.color = "#181818";
           this.label.centerY = 0;
           this.label.left = 152;
           this.addChild(this.label);

           let line = new Laya.Image('ui/line.png');
           line.width = Laya.stage.width - 20;
           line.height = 2;
           line.left = 152;
           line.bottom = 0;
           this.addChild(line);

       }

       setImg(url) {
           this.img.skin = url;
       }

       setText(text){
           this.label.text = text;
       }
   }

   // oppo
   var tjconf = {
       app_key: "30249566",
       company: "quyou"
   };

   // vivo
   if (typeof Laya !== "undefined" && typeof Laya.VVMiniAdapter !== "undefined") {
       tjconf.app_key = "";
   }

   var qy_ov = {};

   if (window.qg) {
       var g_sendingCount = 0;

       qy_ov.init = function () {
           console.log("start to load qy_ov sdk...");

           // 顶层通用函数
           /**
            * 检查类型
            * 
            * @returns {String}
            */
           var _typeof = function ( obj ) {
               return Object.prototype.toString(obj).slice(8, -1).toLowerCase()
           };

           /**
            * 检查字符
            * 要求字符数据且非空
            * 
            * @returns {Boolean}
            */
           var _checkString = function ( str ) {
               // body...
               if (typeof str === "string" && str !== "") {
                   return true
               }
               else {
                   return false
               }
           };

           /**
            * 创建用户uuid
            * 
            * @returns {String}
            */
           var _createUUID = function () {
               function e() {
                   return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
               }
               
               return e() + e() + e() + e() + e() + e() + e() + e()
           };

           /**
            * 存储本地数据
            * @param {String} key 键名(全局唯一)，不能为空
            * @param {String} data 字符数据
            */
           var setStorage = function (key, data) {
               if (!_checkString(key)) {
                   console.error("setStorage Fail, Check Input Key...");
                   return
               }
               if (!_checkString(data)) {
                   console.error("setStorage Fail, only support string data...");
                   return
               }

               if (typeof Laya !== "undefined") {
                   Laya.LocalStorage.setItem(key, data);
               }
               else if (typeof cc !== "undefined") {
                   cc.sys.localStorage.setItem(key, data);
               }
           };

           /**
            * 获取本地数据
            * @param {String} key 键名(全局唯一)，不能为空
            * 
            * @returns {String}
            */
           var getStorage = function (key, def) {
               if (!_checkString(key)) {
                   console.error("getStorage Fail, Check Input Key...");
                   
                   if (typeof def !== "undefined") {
                       return def
                   }
                   else {
                       return null
                   }
               }

               let ret = null;

               if (typeof Laya !== "undefined") {
                   ret = Laya.LocalStorage.getItem(key);
               }
               else if (typeof cc !== "undefined") {
                   ret = cc.sys.localStorage.getItem(key);
               }

               if ((ret === null || ret === "") && typeof def !== "undefined") {
                   return def
               }
               else {
                   return ret
               }
           };

           /**
            * 清除本地数据
            * @param {String} key 键名(全局唯一)，不能为空
            */
           var clearStorage = function ( key ) {
               if (!_checkString(key)) {
                   console.error("clearStorage Fail, Check Input Key...");
                   return
               }

               if (typeof Laya !== "undefined") {
                   Laya.LocalStorage.removeItem(key);
               }
               else if (typeof cc !== "undefined") {
                   cc.sys.localStorage.removeItem(key);
               }
           };

           /**
            * 数据上报请求
            * @param {Object} obj 请求数据
            * @param {String} obj.url 请求地址
            * @param {Object} obj.data 请求的参数
            * @param {Object} obj.header 请求的 header
            * @param {Number} obj.success 接口调用成功的回调函数
            * @param {Number} obj.fail 接口调用失败的回调函数
            * @param {Number} obj.complete 接口调用结束的回调函数（调用成功、失败都会执行）
            */
           var request = function ( content_type, obj ) {
               if (typeof obj === "object") {
                   let _requestHttp = null;

                   if (typeof Laya !== "undefined") {
                       _requestHttp = (new Laya.HttpRequest())._http;
                   }
                   else if (typeof cc !== "undefined") {
                       _requestHttp = cc.loader.getXMLHttpRequest();
                   }

                   if (_requestHttp) {
                       _requestHttp.open("POST", obj.url, true);

                       // print
                       console.log("req adv url: " + obj.url);

                       if (typeof obj.complete === "function") {
                           _requestHttp.onreadystatechange = function () {
                               if (_requestHttp.readyState === 2 && typeof obj.complete === "function") {
                                   obj.complete();
                               }
                           };
                       }

                       _requestHttp.onload = function () {
                           // body...
                           if (_requestHttp.readyState === 4) {
                               let _cb = null;

                               if (_requestHttp.status >= 200 && _requestHttp.status < 300) {
                                   _cb = obj.success;
                               }
                               else {
                                   _cb = obj.fail;
                               }

                               if (typeof _cb === "function") {
                                   try {
                                       var responseObj = JSON.parse(_requestHttp.responseText);
                                       _cb({data: responseObj, statusCode: _requestHttp.status});
                                   }
                                   catch (e) {
                                       _cb({data: _requestHttp.responseText, statusCode: _requestHttp.status});
                                   }
                               }
                           }
                       };

                       _requestHttp.timeout = 10000;
                       _requestHttp.ontimeout = function (e) {
                           // body...
                           console.error(e);

                           if (typeof obj.fail === "function") {
                               obj.fail({data: null, statusCode: _requestHttp.status});
                           }
                       };

                       _requestHttp.onerror = function(e) {
                           console.error(e);

                           if (typeof obj.fail === "function") {
                               obj.fail({data: null, statusCode: _requestHttp.status});
                           }
                       };

                       // header -- company
                       _requestHttp.setRequestHeader('au', tjconf.company);
                       
                       if (typeof obj.header === "object") {
                           for (let key in obj.header) {
                               _requestHttp.setRequestHeader(key, obj.header[key]);
                           }
                       }

                       // header -- type
                       if (content_type === "form") {
                           _requestHttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
                       }
                       else {
                           _requestHttp.setRequestHeader('content-type', 'application/json');
                       }

                       // send
                       if (obj.data) {
                           if (content_type === "form") {
                               _requestHttp.send(obj.data);
                           }
                           else {
                               _requestHttp.send(JSON.stringify(obj.data));
                           }
                       }
   					else {
                           _requestHttp.send(null);
                       }
                   }
               }
           };

           var _saveToUnsendDict = function (event_name, event_obj) {
               let unsendDictStr = getStorage("qy_unsend_dict");
               let unsendDict = {};

               if (typeof unsendDictStr === "string" && unsendDictStr !== "") {
                   unsendDict = JSON.parse(unsendDictStr);
               }

               let key = _createUUID();
               unsendDict[key] = {
                   event: event_name,
                   data: event_obj
               };

               // save
               setStorage("qy_unsend_dict", JSON.stringify(unsendDict));
           };

           var _clearUnsendDict = function () {
               if (g_sendingCount > 0) {
                   return
               }

               let unsendDictStr = getStorage("qy_unsend_dict");

               if (typeof unsendDictStr === "string" && unsendDictStr !== "") {
                   let unsendDict = JSON.parse(unsendDictStr);
                   
                   for (let key in unsendDict) {
                       let event_name = unsendDict[key].event;
                       let event_obj = unsendDict[key].data;

                       // retain
                       ++g_sendingCount;

                       // report
                       report(event_name, event_obj, function () {
                           // release
                           --g_sendingCount;

                           _doClearTargetUnsendInDict(key);
                       }, function () {
                           // release
                           --g_sendingCount;
                       });
                   }
               }
           };

           var _doClearTargetUnsendInDict = function ( targetkKey ) {
               let unsendDictStr = getStorage("qy_unsend_dict");

               if (typeof unsendDictStr === "string" && unsendDictStr !== "") {
                   let unsendDict = JSON.parse(unsendDictStr);
                   let bFound = false;

                   for (let key in unsendDict) {
                       if (key === targetkKey) {
                           bFound = true;
                           delete unsendDict[key];
                           break
                       }
                   }

                   if (bFound) {
                       // save
                       setStorage("qy_unsend_dict", JSON.stringify(unsendDict));
                   }
               }
           };

           var _addSysInfoInto = function ( p ) {
               if (p && qg.getSystemInfoSync) {
                   let T = qg.getSystemInfoSync();
                   if (T) {
                       p.br = T.brand;
                       p.md = T.model;
                       p.pr = T.pixelRatio;
                       p.sw = T.screenWidth;
                       p.sh = T.screenHeight;
                       p.ww = T.windowWidth;
                       p.wh = T.windowHeight;
                       p.lang = T.language;
                       p.wv = T.COREVersion;
                       p.sv = T.system || "";
                       p.wvv = T.platform || "";
                       p.wsdk = T.platformVersion || "";
                       p.fs = T.fontSizeSetting || "";
                       p.bh = T.benchmarkLevel || "";
                       p.bt = T.battery || "";
                       p.wf = T.wifiSignal || "";
                       p.lng = "";
                       p.lat = "";
                       p.nt = "";
                       p.spd = "";
                       p.ufo = "";
                   }
               }
           };

           /**
            * 数据上报
            * 
            */
           var report = function (event_name, event_obj, succCb, failCb) {
               if (!_checkString(event_name) || event_name.length > 255) {
                   console.error("事件名称必须为String类型且不能超过255个字符");
                   return
               }

               let event_obj_str = "";
               if (typeof event_obj === "string") {
                   event_obj_str = event_obj;
               }
               else if (typeof event_obj === "object") {
                   event_obj_str = JSON.stringify(event_obj);
               }

               if (event_obj_str.length > 255) {
                   console.error("事件参数必须为String或Object类型，且参数长度不能超过255个字符");
                   return
               }

               let reportData = {
                   ak: tjconf.app_key,
                   uu: g_uuid,
                   oid: "",
                   ev: "event",
                   tp: event_name,
                   ct: event_obj_str,
                   v: g_ver,
                   st: Date.now(),
                   wsr: g_launchOpts,
               };

               // add sys info
               _addSysInfoInto(reportData);

               // request
               request("json", {
                   url: g_domain + "/NewReport/report.html",
                   data: reportData,
                   success: function ( res ) {
                       if (res.data.Status === 200) {
                           console.log("report to server succ...");

                           if (typeof succCb === "function") {
                               succCb();
                           }
                       }
                       else {
                           console.log("report to server fail...");

                           if (typeof failCb === "function") {
                               failCb();
                           }
                       }
                   },
                   fail: function ( res ) {
                       console.log("report to server fail...");

                       if (typeof failCb === "function") {
                           failCb();
                       }
                   },
               });
           };

           /**
            * 获取用户uuid
            * 
            * @returns {String}
            */
           var getUUID = function () {
               let uuid = getStorage("qy_ov_uuid");

               if (uuid === null || uuid === "") {
                   uuid = _createUUID();

                   // save
                   setStorage("qy_ov_uuid", uuid);
               }
               
               return uuid
           };

           // 环境检查
           if (!_checkString(tjconf.app_key)) {
               console.error("请在配置文件(qy-ov-config.js)中填写您的app_key");
           }

           // 顶层变量
           var g_ver = "1.0.0";
           var g_uuid = getUUID();
           var g_domain = "https://appapi.game.hnquyou.com/api";
           var g_launchOpts = {};
           if (qg.getLaunchOptionsSync) {
               g_launchOpts = qg.getLaunchOptionsSync();
           }

           console.error("g_uuid: ", g_uuid);
           
           // 添加的方法名
           var g_funcNames = ["h_GetAdvListPlat", "h_ToMinProgram", "h_SendEvent"];
           var g_funcs = {
               h_GetAdvListPlat: function ( _obj ) {
                   var timelog = Date.now();
                   var obj = _typeof(_obj) === 'object' ? _obj : {};
                   var adv_key = obj.adv_key ? obj.adv_key : "";
                   // 0两个平台 1-安卓 2-IOS
                   // oppo和vivo必定是Android平台
                   var platform = 1;

                   // request
                   request("form", {
                       url: g_domain + "/api/Sw/getAllAdvByIndexPlat.html",
                       data: "key=" + adv_key + "&timelog=" + timelog + "&platform=" + platform + "&sign=" + hex_md5('key:' + adv_key + 'platform:' + platform + 'timelog:' + timelog),
                       success: function ( res ) {
                           typeof obj.success === 'function' && obj.success(res.data);
                       },
                       fail: function ( res ) {
                           typeof obj.fail === 'function' && obj.fail(res);
                       },
                       complete: function () {
                           typeof obj.complete === 'function' && obj.complete();
                       },
                   });
               },

               h_ToMinProgram: function ( _obj ) {
                   var obj = _obj;
                   var succCb = _obj.success;
                   var failCb = _obj.fail;
                   var timelog = Date.now();

                   // check pkgName
                   if (!_checkString(obj.pkgName) && _checkString(obj.appid)) {
                       obj.pkgName = obj.appid;
                   }

                   // check path
                   if (!_checkString(obj.path)) {
                       obj.path = undefined;
                   }

                   var doNavigationReport = function ( type ) {
                       report("clickad", {
                           adv_id: obj.adv_id,
                           timelog: timelog,
                           type: type
                       }, null, function () {
                           _saveToUnsendDict("clickad", {
                               adv_id: obj.adv_id,
                               timelog: timelog,
                               type: type
                           });
                       });
                   };

                   obj.success = function ( res ) {
                       // succ
                       doNavigationReport(1);

                       if (typeof succCb === "function") {
                           succCb(res);
                       }
                   };

                   obj.fail = function ( res ) {
                       // fail
                       doNavigationReport(2);

                       if (typeof failCb === "function") {
                           failCb(res);
                       }
                   };

                   if (qg && qg.navigateToMiniGame) {
                       // open
                       doNavigationReport(0);

                       // navigate
                       qg.navigateToMiniGame(obj);
                   }
               },

               h_SendEvent: function (event_name, event_obj) {
                   // clear if exist
                   _clearUnsendDict();

                   report(event_name, event_obj, null, function () {
                       _saveToUnsendDict(event_name, event_obj);
                   });
               }
           };

           // add all func into qg
           for (let funcIndex = 0; funcIndex < g_funcNames.length; funcIndex++) {
               let funcName = g_funcNames[funcIndex];
               let func = g_funcs[funcName];
               
               Object.defineProperty(window.qg, funcName, {
                   value: func,
                   writable: false,
                   enumerable: true,
                   configurable: true
               });
           }

           // report
           if (window.qg.h_SendEvent) {
               window.qg.h_SendEvent("qy_sdk_inited");
           }
       };
   }
   else {
       qy_ov.init = function () {
           console.log("qy_ov sdk not support on windows platform....");
       };
   }

   /*
    * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
    * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    * Distributed under the BSD License
    * See http://pajhome.org.uk/crypt/md5 for more info.
    */

   /*
    * Configurable variables. You may need to tweak these to be compatible with
    * the server-side, but the defaults work in most cases.
    */
   var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
   var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
   var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

   /*
    * These are the functions you'll usually want to call
    * They take string arguments and return either hex or base-64 encoded strings
    */
   function hex_md5$1(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
   function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
   function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
   function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
   function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
   function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

   /*
    * Perform a simple self-test to see if the VM is working
    */
   function md5_vm_test()
   {
     return hex_md5$1("abc") == "900150983cd24fb0d6963f7d28e17f72";
   }

   /*
    * Calculate the MD5 of an array of little-endian words, and a bit length
    */
   function core_md5(x, len)
   {
     /* append padding */
     x[len >> 5] |= 0x80 << ((len) % 32);
     x[(((len + 64) >>> 9) << 4) + 14] = len;

     var a =  1732584193;
     var b = -271733879;
     var c = -1732584194;
     var d =  271733878;

     for(var i = 0; i < x.length; i += 16)
     {
       var olda = a;
       var oldb = b;
       var oldc = c;
       var oldd = d;

       a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
       d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
       c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
       b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
       a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
       d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
       c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
       b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
       a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
       d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
       c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
       b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
       a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
       d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
       c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
       b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

       a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
       d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
       c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
       b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
       a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
       d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
       c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
       b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
       a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
       d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
       c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
       b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
       a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
       d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
       c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
       b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

       a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
       d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
       c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
       b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
       a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
       d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
       c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
       b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
       a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
       d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
       c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
       b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
       a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
       d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
       c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
       b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

       a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
       d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
       c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
       b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
       a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
       d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
       c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
       b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
       a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
       d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
       c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
       b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
       a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
       d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
       c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
       b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

       a = safe_add(a, olda);
       b = safe_add(b, oldb);
       c = safe_add(c, oldc);
       d = safe_add(d, oldd);
     }
     return Array(a, b, c, d);

   }

   /*
    * These functions implement the four basic operations the algorithm uses.
    */
   function md5_cmn(q, a, b, x, s, t)
   {
     return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
   }
   function md5_ff(a, b, c, d, x, s, t)
   {
     return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
   }
   function md5_gg(a, b, c, d, x, s, t)
   {
     return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
   }
   function md5_hh(a, b, c, d, x, s, t)
   {
     return md5_cmn(b ^ c ^ d, a, b, x, s, t);
   }
   function md5_ii(a, b, c, d, x, s, t)
   {
     return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
   }

   /*
    * Calculate the HMAC-MD5, of a key and some data
    */
   function core_hmac_md5(key, data)
   {
     var bkey = str2binl(key);
     if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

     var ipad = Array(16), opad = Array(16);
     for(var i = 0; i < 16; i++)
     {
       ipad[i] = bkey[i] ^ 0x36363636;
       opad[i] = bkey[i] ^ 0x5C5C5C5C;
     }

     var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
     return core_md5(opad.concat(hash), 512 + 128);
   }

   /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
   function safe_add(x, y)
   {
     var lsw = (x & 0xFFFF) + (y & 0xFFFF);
     var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
     return (msw << 16) | (lsw & 0xFFFF);
   }

   /*
    * Bitwise rotate a 32-bit number to the left.
    */
   function bit_rol(num, cnt)
   {
     return (num << cnt) | (num >>> (32 - cnt));
   }

   /*
    * Convert a string to an array of little-endian words
    * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
    */
   function str2binl(str)
   {
     var bin = Array();
     var mask = (1 << chrsz) - 1;
     for(var i = 0; i < str.length * chrsz; i += chrsz)
       bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
     return bin;
   }

   /*
    * Convert an array of little-endian words to a string
    */
   function binl2str(bin)
   {
     var str = "";
     var mask = (1 << chrsz) - 1;
     for(var i = 0; i < bin.length * 32; i += chrsz)
       str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
     return str;
   }

   /*
    * Convert an array of little-endian words to a hex string.
    */
   function binl2hex(binarray)
   {
     var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
     var str = "";
     for(var i = 0; i < binarray.length * 4; i++)
     {
       str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
              hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
     }
     return str;
   }

   /*
    * Convert an array of little-endian words to a base-64 string
    */
   function binl2b64(binarray)
   {
     var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
     var str = "";
     for(var i = 0; i < binarray.length * 4; i += 3)
     {
       var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                   | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                   |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
       for(var j = 0; j < 4; j++)
       {
         if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
         else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
       }
     }
     return str;
   }

   // global
   window.hex_md5 = hex_md5$1;

   /**
    * oppo趣游广告模块
    */
   class OppoQyModule extends ModuleBase {
       constructor() {
           super();
           this.moduleName = "qy";
           this.showAd = true;
           this.adViewId = 0;
           this.adViews = [];

           this.AD_bgGreySkin = 'ui/grey30.png';  //半透明底
           this.AD_SingleBgSkin = 'ui/tryplay.png';  //单按钮背景
           this.AD_CarouselSkin = 'ui/bg1.png'; //轮播背景（猜你喜欢）
           this.AD_MorePlaySkin = 'ui/gameOverBg.png'; //更多好玩背景
           this.AD_MorePlayBtn = 'ui/close.png'; //更多好玩关闭按钮
           this.AD_GameoverSkin = 'ui/haoyouwan.png'; //游戏结算背景
           this.AD_ExportSkin = 'ui/daochubg.jpg'; //全屏导出背景
           this.AD_ExportTitle = 'ui/daochu_tuijian.png'; //全屏导出标题
           this.AD_ExportItemSkin = 'ui/daochu_itembg.png'; //全屏导出Item背景
           this.AD_ExportBtnSkin = 'ui/daochu_fanhui.png'; //全屏导出返回按钮
           this.AD_ExportHaoyouSkin = 'ui/daochu_haoyoubg.png'; //全屏导出好友在玩背景
           this.AD_ExportHaoyouTitle = 'ui/daochu_haoyouzaiwan.png'; //全屏导出好友在玩标题

           this._config = [];
           this._qyswDomain = "https://shangwu.2960.net";
           this._qytjDomain = "https://tj.2960.net";
           this.resultData = {
               result: [],
           };

           this.adv_key = ML.config.advKey;
           this.init();
       }

       init() {
           qy_ov.init();
           if ("WEB" == MLConfig.PlatformName) {
               
               for (let i = 0; i < 9; i++) {
                   
                   let data = { appid: "", logo: "https://img.2960.net/2019-08-06/129f821be99f996d30c8cc57dbf7eea0.png", title: "几何风暴", adv_id: "", path: "" };
                   this.resultData.result.push(data);
               }
           } else if ("OPPO" == MLConfig.PlatformName) {
               //请求广告数据
               qg.h_GetAdvListPlat({
                   adv_key: this.adv_key,
                   success: res => {
                       if (res.Status === 200) {
                           console.warn('广告数据请求成功', res);
                           if (this.resultData.result.length > 0) {
                               return;
                           }
                           let data = { appid: "", logo: "", title: "", adv_id: "", path: "" };
                           for (let i = 0; i < res.Result.Info[this.adv_key].length; i++) {
                               let resultItem = res.Result.Info[this.adv_key][i];
                               let data = { appid: resultItem.appid, logo: resultItem.logo_url, title: resultItem.title, adv_id: resultItem.adv_id, path: resultItem.path };
                               this.resultData.result.push(data);
                           }
                       } else {
                           console.warn('广告数据请求失败', res);
                       }
                   },
                   fail: res => {
                       console.warn('广告数据请求失败', res);
                   }
               });
           }
       }

       //单按钮
       showSingleAdView(data = null) {
           if (!this.showAd) return null;
           let self = this;
           data = data || {
               bg: this.AD_SingleBgSkin,
               onFail: (res) => {
                   console.log('跳转失败', res);
                   //self.showAdExport();
               },
               onSuccess: () => {
               },
               right: 0,
               top: 600,
               width: 150,
               height: 200,
               iconWidth: 120,
               iconHeight: 120,
           };
           let comp = this.createAdView(SingleAdButton, data.width, data.height);
           comp.owner.right = data.right;
           comp.owner.top = data.top;
           comp.init(this.resultData, data);
           return comp;
       }

       //底部轮播
       showAdCarousel(data = null, centerY = -1) {
           if (!this.showAd) return null;
           data = data || {
               bg: this.AD_CarouselSkin,
               onFail: (res) => {
                   console.log('跳转失败', res);
                   //this.showAdExport();
               },
               onSuccess: () => {
               },
               center: false,
               width: 150,
               height: 650,
               iconWidth: 174,
               iconHeight: 174,
           };
           let comp = this.createAdView(AdCarousel, data.width, data.height);
           comp.owner.left = 0;
           // if (-1 == centerY) {
           //     comp.owner.bottom = 0;
           // } else {
           //     comp.owner.centerY = centerY;
           // }
           comp.owner.centerY = 0;

           comp.init(this.resultData, data);
           return comp;
       }
       //更多好玩
       showAdMorePlay(data = null) {
           if (!this.showAd) return null;
           data = data || {
               onFail: (res) => {
                   console.log('跳转失败', res);
                   //this.showAdExport();
               },

               onSuccess: () => {

               },
               bg: this.AD_MorePlaySkin,
               btnBg: this.AD_MorePlayBtn,
               grey: this.AD_bgGreySkin,
               width: 430,
               height: 520,
           };
           let comp = this.createAdView(AdMorePlay, data.width, data.height);
           comp.owner.centerX = 0;
           comp.owner.centerY = 0;
           comp.init(this.resultData, data);
           return comp;
       }
       //结束页
       showAdGameover(data = null) {
           if (!this.showAd) return null;
           data = data || {
               onFail: () => {
                   console.log('跳转失败');
                   //this.showAdExport();
               },
               onSuccess: () => {
               },
               bg: this.AD_GameoverSkin,
               width: 550,
               height: 650,
           };
           let comp = this.createAdView(AdGameover, data.width, data.height);
           comp.owner.centerX = 0;
           comp.owner.centerY = -30;
           comp.init(this.resultData, data);
           return comp;
       }

       showAdFail(data = null) {
           if (!this.showAd) return null;
           data = data || {
               onFail: () => {
                   console.log('跳转失败');
                   //this.showAdExport();
               },
               onSuccess: () => {

               },
               bg: this.AD_GameoverSkin,
               width: 639,
               height: 481,
           };
           let comp = this.createAdView(AdFail, data.width, data.height);
           comp.owner.centerX = 0;
           comp.owner.centerY = 130;
           comp.init(this.resultData, data);
           return comp;
       }

       //全屏导出页
       showAdExport(data = null, close = null) {
           if (!this.showAd) return null;
           data = data || {
               onFail: () => {
                   console.log('跳转失败');
               },
               onSuccess: () => {

               },
               close: close,
               width: Laya.stage.width,
               height: Laya.stage.height,
           };
           let comp = this.createAdView(AdExport, data.width, data.height);
           comp.owner.centerX = 0;
           comp.owner.centerY = 0;
           comp.width = Laya.stage.width;
           comp.height = Laya.stage.height;
           comp.init(this.resultData, data);
           return comp;
       }
       //好友在玩
       showAdFriend(data = null) {
           if (!this.showAd) return null;
           data = data || {
               bg: this.AD_ExportHaoyouSkin,
               onFail: () => {
                   console.log('跳转失败');
               },
               onSuccess: () => {
               },
               center: true,
               width: Laya.stage.width - 30,
               height: 148,
           };
           let comp = this.createAdView(AdCarousel$1, data.width, data.height);
           comp.owner.centerX = 0;
           comp.owner.top = 120;
           comp.init(this.resultData, data);
           return comp;
       }


       showAdExit(data) {
           if (!this.showAd) return null;
           data = data || {
               bg: this.AD_ExportHaoyouSkin,
               onFail: () => {
                   console.log('跳转失败');
               },
               onSuccess: () => {
               },
               width: Laya.stage.width,
               height: Laya.stage.height,
           };
           let comp = this.createAdView(AdExit, data.width, data.height);
           comp.owner.centerX = 0;
           comp.owner.centerX = 0;
           comp.init(this.resultData, data);
           return comp;
       }

       showExitBtn() {
           if (!this.showAd) return null;
           let comp = this.createAdView(SingleAdButton$1, 168, 64);
           let offsetY = ML.platform.isIphoneX() ? 40 : 0;
           comp.owner.right = 15;
           comp.owner.top = 120 + offsetY;
           comp.init();
           return comp;
       }
       createAdView(compoent, width = 0, height = 0) {
           if (!this.showAd) return null;
           this.adViewId++;
           let box = new Laya.Box();
           box.size(width, height);
           // box.right = right;
           // box.top = top;
           let comp = box.addComponent(compoent);
           comp.__adViewId = this.adViewId;
           Laya.stage.addChild(comp.owner);
           comp.owner.zOrder = 100 + this.adViewId;
           this.adViews.push(comp);
           return comp;
       }

       hideAdView(ad) {
           if (!this.showAd) return null;
           if (!ad) {
               return;
           }
           let index = this.adViews.indexOf(ad);
           if (index == -1) {
               return;
           }
           this.adViews.splice(index, 1);
           if (!ad.owner) {
               return;
           }
           ad.owner.destroy();
           Laya.loader.clearTextureRes();
       }

       adClick(args, failFunction, successFunction) {
           if ("OPPO" != MLConfig.PlatformName) return;

           let toMinInfo = {
               adv_id: args.adv_id,
               pkgName: args.appid,
               path: args.path,
           };

           toMinInfo.success = function () {
               // succ
           };

           toMinInfo.fail = function (err) {
               // fail
           };

           qg.h_ToMinProgram(toMinInfo);
       }

       randomLogoUrl(urls) {
           let isarr = Object.prototype.toString.call(urls) === '[object Array]';
           if (isarr) {
               return Tools.RandomOne(urls);
           }
           return urls;
       }

       createList(itemRender, repeatX, repeatY, spaceX, spaceY, scrollDir) {
           let list = new Laya.List();
           list.itemRender = itemRender;
           list.repeatX = repeatX;
           list.repeatY = repeatY;
           list.spaceX = spaceX;
           list.spaceY = spaceY;
           if (scrollDir == 1) {
               list.vScrollBarSkin = "";
           } else {
               list.hScrollBarSkin = "";
           }
           list.selectEnable = true;
           return list;
       }
   }

   //框架配置类
   class MLConfig { }

   //当前平台
   MLConfig.PlatformName = Platform.WX;     // "web" "wx" "qq" "oppo" "vivo" "tt"
   //内置模块
   MLConfig.BuiltInModules = [
       EventModule,
       StorageModule,
       EntityPoolModule,
       EntityModule,
       HttpModule,
       ResourceModule,
       PlatformModule,
       AdModule
   ];
   //自定义模块配置
   MLConfig.CustomModules = [
       SkinModule,
       ResourceLoaderModule,
       AudioModule,
       ApiModule,
       UserDataModule,
       ChestModule,
       //QyModule,
       OppoQyModule,
       CustomParticleModule
   ];

   class LayaExtension {
   }

   LayaExtension.Init = function () {
       console.log('LayaExtension init');
       Laya.Node.prototype.getComponentsInChildren = function (clsName) {
           let list = [];
           for (let i = 0, m = this._children.length; i < m; i++) {
               const child = this._children[i];
               if (child._children.length != 0) {
                   let comps = child.getComponentsInChildren(clsName);
                   list = list.concat(comps);
               } else {
                   let comps = child.getComponents(clsName);
                   list = list.concat(comps);
               }
           }
           return list;
       };

       Math.Rad2Deg = 57.29578;
       Math.Deg2Rad = 0.01745;

       /**
        * 从父节点中查询所有组件，包含自己
        */
       Laya.Node.prototype.getComponentsInParent = function (clsName) {
           let list = [];
           let comps = this.getComponents(clsName);
           if (comps) {
               list = list.concat(comps);
           }
           let parent = this.parent;
           if (parent) {
               let compsInParent = parent.getComponentsInParent(clsName);
               list = list.concat(compsInParent);
           }
           return list;
       };

       Laya.Node.prototype.getChildByNameInChildren = function (name) {
           for (let i = 0, m = this._children.length; i < m; i++) {
               const child = this._children[i];
               if (child.name == name) return child;
               if (child._children.length != 0) {
                   let d = child.getChildByNameInChildren(name);
                   if (d) return d;
               }
           }
       };

       ML.Laya = {};
       ML.Laya.CloseScene = function (scene, data) {
           scene.mlClose(data);
       };
       ML.Laya.OpenScene = function (url, closeOther = true, data = null, complete = null, close = null, progress = null) {
           Laya.Scene.MLOpen(url, closeOther, data, complete, close, progress);
       };
       
       Laya.Scene.prototype.mlClose = function (data) {
           this.close(data);
           this.__onMLClosed && this.__onMLClosed(data);
           this.__onMLClosed = null;
           ML.event.emit("Sceen_closed", this);
       };

       Laya.Scene.MLOpen = function (url, closeOther = true, data = null, complete = null, close = null, progress = null) {
           Laya.Scene.open(url, closeOther, data, Laya.Handler.create(this, (scene) => {
               scene.__onMLClosed = close;
               complete && complete(scene);
           }), progress);
       };

       Laya.Vector3.prototype.MLAdd = function (b) {
           let c = new Laya.Vector3(0, 0, 0);
           c.x = this.x + b.x;
           c.y = this.y + b.y;
           c.z = this.z + b.z;
           return c;
       };

       Laya.Vector3.prototype.MLScale = function (v) {
           let c = new Laya.Vector3(0, 0, 0);
           c.x = this.x * v;
           c.y = this.y * v;
           c.z = this.z * v;
           return c;
       };
   };

   class MLLayaEntry extends Laya.Script {

       constructor() {
           super();
           window.ML = this; //大写ML为框架命名空间
           window.ml = {}; //小写为自定义命名空间
           LayaExtension.Init();
       }

       init() {

       }

       onAwake() {
           console.log('ML awake');
           ML.mini = window[this._$getNameSpaceByName(MLConfig.PlatformName)];
           //当前平台配置
           if (!ML.mini) MLConfig.PlatformName = Platform.WEB;
           ML.config = this._$getPlatformConfig(MLConfig.PlatformName);
           this.addBuiltInModule();
           //当前小程序平台api调用前缀
           console.log("ML 当前平台:", MLConfig.PlatformName);
           console.log("ML 当前游戏版本:", ML.config.version);
           console.log("ML 当前平台资源根目录:", ML.config.assetsPathRoot);
           this.addCustomModule();

       }

       onEnable() {
       }

       onDisable() {
       }

       addBuiltInModule() {
           this.addModules(MLConfig.BuiltInModules,true);
       }

       addCustomModule() {
           this.addModules(MLConfig.CustomModules,false);
       }

       addModules(moduleClss,builtIn){
           for (let i = 0; i < moduleClss.length; i++) {
               let md = moduleClss[i];
               this.addModule(md, builtIn);
           }
       }

       addModule(moduleCls, builtIn = true) {
           let node = new Laya.Node();
           let md = node.addComponent(moduleCls);
           node.name = md.moduleName;
           this.owner.addChild(node);
           if (builtIn) {
               ML[md.moduleName] = md;
           } else {
               ml[md.moduleName] = md;
           }
           console.log('ML module init: ', md.moduleName, builtIn);
       }

       _$getNameSpaceByName(platformName) {
           return Platform.NameSpace[platformName];
       }

       _$getPlatformConfig(platformName){
           return new Platform.Config[platformName];
       }
   }

   class MLFramework {
       constructor() {
       }
       static init () {
           //初始化框架
           let node = new Laya.Node();
           node.name = "MLFramework";
           Laya.stage.addChild(node);
           let mlf = node.addComponent(MLLayaEntry);
       }
   }

   class SplashView extends Laya.View {

       constructor() {
           super();
       }

       onAwake() {
           //初始化框架
           MLFramework.init();
       }

       onEnable() {
           //注册资源相关事件
           ML.event.on(ML.event.OnAssetsReady, this, this._$OnAssetsReady);
           ML.event.on(ML.event.OnAssetsDownloadProgress, this, this._$OnAssetsDownloadProgress);

           //下载资源
           ML.resource.downloadAssets();
       }

       onDisable() {
           ML.event.offAllCaller(this);
       }

       _$OnAssetsDownloadProgress(v) {
           console.log('download ', v);
           this.progress_label.text = "资源下载中 " + v + "%";
           this.progress.width = 410 * v;
       }

       _$OnAssetsReady() {
           //资源下载完成，在这里预加载到内存
           console.log('资源准备完成');
           // this.progress_label.text = "资源准备完成";
           ml.resourceloader.load(() => {
               console.log('resload----complete');
               this.close();
           }, (v) => {
               this.progress_label.text = "资源加载中 " + parseInt(v * 100) + "%";
               this.progress.width = 410 * v;
               console.log('resload----progress', v);
           });

       }
   }

   /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

   class GameConfig {
       static init() {
           //注册Script或者Runtime引用
           let reg = Laya.ClassUtils.regClass;
   		reg("game/view/HomeView.js",HomeView);
   		reg("game/view/SplashView.js",SplashView);
       }
   }
   GameConfig.width = 750;
   GameConfig.height = 1337;
   GameConfig.scaleMode ="fixedwidth";
   GameConfig.screenMode = "none";
   GameConfig.alignV = "top";
   GameConfig.alignH = "left";
   GameConfig.startScene = "view/splash.scene";
   GameConfig.sceneRoot = "";
   GameConfig.debug = false;
   GameConfig.stat = true;
   GameConfig.physicsDebug = true;
   GameConfig.exportSceneToJson = true;

   GameConfig.init();

   class Main {
   	constructor() {
   		//根据IDE设置初始化引擎		
   		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
   		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
   		Laya["Physics"] && Laya["Physics"].enable();
   		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
   		Laya.stage.scaleMode = GameConfig.scaleMode;
   		Laya.stage.screenMode = GameConfig.screenMode;
   		Laya.stage.alignV = GameConfig.alignV;
   		Laya.stage.alignH = GameConfig.alignH;
   		//兼容微信不支持加载scene后缀场景
   		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

   		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
   		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
   		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
   		if (GameConfig.stat) Laya.Stat.show();
   		Laya.alertGlobalError(true);

   		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
   		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
   	}

   	onVersionLoaded() {
   		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
   		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
   	}

   	onConfigLoaded() {
   		//加载IDE指定的场景
   		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
   	}
   }
   //激活启动类
   new Main();

}());
//# sourceMappingURL=bundle.js.map
