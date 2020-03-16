window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  AudioMgr: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7aa3bceFNFJWZiFHBVAcg61", "AudioMgr");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        bgmVolume: 1,
        effectVolume: 1,
        audioID: -1
      },
      onLoad: function onLoad() {},
      initData: function initData() {
        var b1 = cc.ms.DataManager.getData("musicOpen");
        var b2 = cc.ms.DataManager.getData("effectOpen");
        this.m_musicOpen = "true" == b1 || null == b1;
        this.m_effectOpen = "true" == b2 || null == b2;
        console.log("this.m_musicOpen = ", this.m_musicOpen);
        console.log("this.m_effectOpen = ", this.m_effectOpen);
        var bgmVolume = cc.ms.DataManager.getData("bgmVolume");
        this.bgmVolume = null != bgmVolume ? bgmVolume : .5;
        var effectVolume = cc.ms.DataManager.getData("effectVolume");
        this.effectVolume = null != effectVolume ? effectVolume : .5;
        this.setMusicVolume(this.bgmVolume);
        console.log("bgmVolume", bgmVolume, "effectVolume", effectVolume);
        if (this.bgmVolume > 0) {
          this.m_musicOpen = true;
          cc.ms.DataManager.saveData("musicOpen", true);
        }
        this.setEffectVolume(this.effectVolume);
        if (this.effectVolume > 0) {
          this.m_musicOpen = true;
          cc.ms.DataManager.saveData("effectOpen", true);
        }
      },
      getUrl: function getUrl(file) {
        return cc.url.raw("resources/" + file);
      },
      playMusic: function playMusic(file, restore) {
        if (this.m_file == file && true != restore) return;
        this.m_file = file;
        if (false == this.m_musicOpen) return;
        cc.audioEngine.stopMusic();
        var self = this;
        cc.loader.loadRes(file, cc.AudioClip, function(err, clip) {
          self.audioID = cc.audioEngine.playMusic(clip, true);
          cc.audioEngine.setMusicVolume(self.bgmVolume);
        });
      },
      setMusicVolume: function setMusicVolume(bgmVolume) {
        if (0 == bgmVolume) this.onMusicSwitch(false); else {
          0 == this.bgmVolume && this.onMusicSwitch(true);
          cc.audioEngine.setMusicVolume(bgmVolume);
        }
        this.bgmVolume = bgmVolume;
        cc.ms.DataManager.saveData("bgmVolume", bgmVolume);
      },
      getMusicVolume: function getMusicVolume() {
        return this.bgmVolume;
      },
      playEffect: function playEffect(file) {
        if (false == this.m_effectOpen) return;
        this.effectVolume > 0 && cc.loader.loadRes(file, cc.AudioClip, function(err, clip) {
          var audioID = cc.audioEngine.playEffect(clip, false);
        });
      },
      setEffectVolume: function setEffectVolume(effectVolume) {
        this.effectVolume = effectVolume;
        cc.ms.DataManager.saveData("effectVolume", effectVolume);
        if (0 == effectVolume) this.onEffectSwitch(false); else {
          this.onEffectSwitch(true);
          cc.audioEngine.setEffectsVolume(effectVolume);
        }
      },
      getEffectVolume: function getEffectVolume() {
        return this.effectVolume;
      },
      playClickEffect: function playClickEffect() {
        this.playEffect("hall/audio/click_button");
      },
      onMusicSwitch: function onMusicSwitch(check) {
        this.m_musicOpen = check;
        check ? this.playMusic(this.m_file, true) : cc.audioEngine.stopMusic();
        cc.ms.DataManager.saveData("musicOpen", check);
      },
      onEffectSwitch: function onEffectSwitch(check) {
        this.m_effectOpen = check;
        cc.ms.DataManager.saveData("effectOpen", check);
      }
    });
    cc._RF.pop();
  }, {} ],
  DataManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "433507le5xMJIyEGpUtA09I", "DataManager");
    "use strict";
    var _cc$Class;
    function _defineProperty(obj, key, value) {
      key in obj ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      }) : obj[key] = value;
      return obj;
    }
    cc.Class((_cc$Class = {
      extends: cc.Component,
      properties: {},
      initData: function initData() {
        this.loginData = {};
      },
      onRegisterEvent: function onRegisterEvent() {
        var self = this;
        var tool = cc.ms.Tool;
        cc.ms.rootNode.on(this.CmdCode.ZCMD_BROADCAST_MSG, function(event) {
          var data = event.getUserData();
          var tableUniqueInfo = self.getTableUniqueInfo();
          tableUniqueInfo.gameId == cc.ms.Const.SERVER_IDS.PJ || tableUniqueInfo.gameId == cc.ms.Const.SERVER_IDS.EBG || tableUniqueInfo.gameId == cc.ms.Const.SERVER_IDS.SSS ? self.onBroadMsg1(data) : self.onBroadMsg(data);
        }, this);
      },
      onBroadMsg: function onBroadMsg(data) {
        var noticeLayer = cc.ms.NoticeLayer;
        if (2 == data.immedialtely) {
          this.setBroadMsg(data);
          false == noticeLayer.isRunningMsg && noticeLayer.showNotice(this.getNoticePos(), data.msg, this.getNoticeLayer(), this.custom_width);
        } else if (3 == data.immedialtely) {
          this.setBroadMsg(data);
          false == noticeLayer.isRunningMsg && noticeLayer.showNotice(this.getNoticePos(), data.msg, this.getNoticeLayer(), this.custom_width);
        } else if (4 == data.immedialtely) ; else {
          this.setBroadMsg(data);
          false == noticeLayer.isRunningMsg && noticeLayer.showNotice(this.getNoticePos(), data.msg, this.getNoticeLayer(), this.custom_width);
        }
      },
      onBroadMsg1: function onBroadMsg1(data) {
        var noticeLayer = cc.ms.NoticeLayer;
        if (2 == data.immedialtely) {
          this.setBroadMsg(data);
          false == noticeLayer.isRunningMsg && noticeLayer.showNotice1(this.getNoticePos(), data.msg, this.getNoticeLayer());
        } else if (3 == data.immedialtely) {
          this.setBroadMsg(data);
          false == noticeLayer.isRunningMsg && noticeLayer.showNotice1(this.getNoticePos(), data.msg, this.getNoticeLayer());
        } else if (4 == data.immedialtely) ; else {
          this.setBroadMsg(data);
          false == noticeLayer.isRunningMsg && noticeLayer.showNotice1(this.getNoticePos(), data.msg, this.getNoticeLayer());
        }
      },
      setNoticeLayer: function setNoticeLayer(layer, custom_width) {
        this.noticeLayer = layer;
        this.custom_width = custom_width;
      },
      getNoticeLayer: function getNoticeLayer() {
        return this.noticeLayer;
      },
      setNoticePos: function setNoticePos(pos) {
        this.noticePos = pos;
      },
      getNoticePos: function getNoticePos() {
        return this.noticePos;
      },
      setBroadMsg: function setBroadMsg(data) {
        this.broadMsg = data;
      },
      getBroadMsg: function getBroadMsg() {
        return this.broadMsg;
      },
      saveUserData: function saveUserData(data) {
        this.playerData = data;
      },
      getUserData: function getUserData() {
        return this.playerData;
      },
      saveData: function saveData(key, val) {
        return cc.sys.localStorage.setItem(key, val);
      },
      getData: function getData(key) {
        return cc.sys.localStorage.getItem(key);
      },
      removeData: function removeData(key) {
        cc.sys.localStorage.removeItem(key);
      },
      setServerInfo: function setServerInfo(data) {
        console.log(data);
        this.serverInfo = data;
      },
      getServersInfo: function getServersInfo() {
        return this.serverInfo;
      },
      getServerInfo: function getServerInfo(serverId) {
        for (var i in this.serverInfo) if (this.serverInfo[i].serverId == serverId) return this.serverInfo[i];
        return null;
      },
      getServerInfo_gameId: function getServerInfo_gameId(gameId) {
        for (var i in this.serverInfo) if (this.serverInfo[i].gameId == gameId) return this.serverInfo[i];
        return null;
      },
      getTableUniqueInfo: function getTableUniqueInfo() {
        var t = {};
        t.tableCode = this.tableCode;
        t.tableId = this.tableId;
        return t;
      },
      setQQ: function setQQ(str) {
        this.qq = str;
      },
      getQQ: function getQQ() {
        return this.qq;
      },
      setWX: function setWX(str) {
        this.wx = str;
      },
      getWX: function getWX() {
        return this.wx;
      },
      setWXQ: function setWXQ(str) {
        this.wxq = str;
      },
      getWXQ: function getWXQ() {
        return this.wxq;
      },
      setPersonImage: function setPersonImage(str) {
        this.personInfo.image = str;
      },
      getPersonImage: function getPersonImage() {
        return this.personInfo.image;
      },
      setPersonSex: function setPersonSex(str) {
        this.personInfo.sex = str;
      },
      getPersonSex: function getPersonSex() {
        return this.personInfo.sex;
      },
      setPersonNm: function setPersonNm(str) {
        this.personInfo.nickname = str;
      },
      getPersonNm: function getPersonNm() {
        return this.personInfo.nickname;
      },
      setPersonInfo: function setPersonInfo(info) {
        this.personInfo = info;
      },
      getPersonInfo: function getPersonInfo() {
        return this.personInfo;
      },
      setLoginData: function setLoginData(key, val) {
        this.loginData[key] = val;
      },
      getLoginData: function getLoginData(key, def) {
        return this.loginData[key] || def;
      },
      dealLoginData: function dealLoginData(jsonData) {
        if (null == jsonData || "" == jsonData) return;
        for (var i in jsonData) null != jsonData[i] && this.setLoginData(i, jsonData[i]);
      },
      setBoxLock: function setBoxLock(val) {
        this.setLoginData("lock", val);
      },
      getBoxLock: function getBoxLock() {
        return null != this.loginData["lock"];
      },
      setBoxCoins: function setBoxCoins(val) {
        this.setLoginData("boxcoins", val);
      },
      getBoxCoins: function getBoxCoins() {
        return this.getLoginData("boxcoins", 0);
      },
      setPhone: function setPhone(phone) {
        this.setLoginData("phone", phone);
      },
      getPhone: function getPhone() {
        return this.getLoginData("phone", "");
      },
      setAlipay: function setAlipay(alipay) {
        this.setLoginData("alipay", alipay);
      },
      getAlipay: function getAlipay() {
        return this.getLoginData("alipay", "");
      },
      setBankCard: function setBankCard(bankcard) {
        this.setLoginData("bankcard", bankcard);
      },
      getBankCard: function getBankCard() {
        return this.getLoginData("bankcard", "");
      },
      setMinEnterCoins: function setMinEnterCoins(coins) {
        this.minEnterCoins = coins;
      },
      getMinEnterCoins: function getMinEnterCoins() {
        return this.minEnterCoins;
      },
      setGameTableInfo: function setGameTableInfo(data) {
        this._gameTableInfo = data;
      },
      getGameTableInfo: function getGameTableInfo() {
        return this._gameTableInfo;
      }
    }, _defineProperty(_cc$Class, "getTableUniqueInfo", function getTableUniqueInfo() {
      var t = {};
      t.tableCode = this.tableCode;
      t.tableId = this.tableId;
      t.gameId = this.gameId;
      t.serverId = this.serverId;
      return t;
    }), _defineProperty(_cc$Class, "setTableUniqueInfo", function setTableUniqueInfo(TableUniqueInfo) {
      console.log("setTableUniqueInfo", TableUniqueInfo);
      this.tableCode = TableUniqueInfo.tableCode;
      this.tableId = TableUniqueInfo.tableId;
      this.gameId = TableUniqueInfo.gameId;
      this.serverId = TableUniqueInfo.serverId;
    }), _defineProperty(_cc$Class, "setGetPhpServicesFlag", function setGetPhpServicesFlag(flag) {
      this.get_php_flag = flag;
    }), _defineProperty(_cc$Class, "getGetPhpServicesFlag", function getGetPhpServicesFlag() {
      return this.get_php_flag;
    }), _defineProperty(_cc$Class, "getTipsShowFlagByKey", function getTipsShowFlagByKey(key) {
      var tipsFlag = this.getData(key);
      var timetmp = Date.now();
      console.log("getTipsShowFlagByKey", tipsFlag);
      this.saveData(key, timetmp);
      if (null == tipsFlag || "" == tipsFlag) return true;
      console.log("timetmp", timetmp, "tipsFlag", tipsFlag);
      return timetmp - tipsFlag > 864e5;
    }), _defineProperty(_cc$Class, "getPlayerId", function getPlayerId() {
      return this.personInfo.playerId;
    }), _cc$Class));
    cc._RF.pop();
  }, {} ],
  Toast: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ad45ePB5lNDiriVQmRPXmlQ", "Toast");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        ISSHOW: true
      },
      show: function show(content, position, fontSize) {
        var self = this;
        cc.ms.Window.show("toolUI/ToastLayer", function(item) {
          var txtInfo = cc.find("txtInfo", item).getComponent(cc.Label);
          txtInfo.string = content;
          null != fontSize && (txtInfo.fontSize = fontSize);
          var action = cc.sequence(cc.fadeIn(1), cc.delayTime(1), cc.fadeOut(1), cc.callFunc(function() {
            self.ISSHOW = true;
            item.destroy();
          }));
          item.runAction(action);
        });
      },
      showByParam: function showByParam(param, position, fontSize) {
        var self = this;
        cc.ms.Window.show("toolUI/ToastLayer", function(item) {
          var txtInfo = cc.find("txtInfo", item).getComponent(cc.Label);
          console.log(txtInfo);
          var ErrorCode = cc.ms.ErrorCode;
          var content = ErrorCode.ErrorMessage[param];
          txtInfo.string = content;
          null != fontSize && (txtInfo.fontSize = fontSize);
          var action = cc.sequence(cc.fadeIn(1), cc.delayTime(1), cc.fadeOut(1), cc.callFunc(function() {
            self.ISSHOW = true;
            item.destroy();
          }));
          item.runAction(action);
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  Tool: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c4e89nLz3VH0aAV6QDJa12O", "Tool");
    "use strict";
    var _statics;
    function _defineProperty(obj, key, value) {
      key in obj ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      }) : obj[key] = value;
      return obj;
    }
    cc.Class({
      extends: cc.Component,
      statics: (_statics = {
        stringFormat: function stringFormat() {
          if (0 == arguments.length) return null;
          var str = arguments[0];
          for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            str = str.replace(re, arguments[i]);
          }
          return str;
        },
        loadTexture: function loadTexture(sprite, path) {
          cc.loader.loadRes(path, cc.SpriteFrame, function(err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
          });
        },
        loadButton: function loadButton(sprite, path1, path2) {
          cc.loader.loadRes(path1, cc.SpriteFrame, function(err, spriteFrame) {
            sprite.normalSprite = spriteFrame;
          });
          cc.loader.loadRes(path2, cc.SpriteFrame, function(err, spriteFrame) {
            sprite.pressedSprite = spriteFrame;
          });
        },
        showPrefabs: function showPrefabs(path) {
          var self = this;
          cc.ms.Window.show(path, function(item) {
            var action = cc.sequence(cc.fadeIn(1), cc.delayTime(1), cc.fadeOut(1), cc.callFunc(function() {
              self.ISSHOW = true;
              item.destroy();
            }));
            item.runAction(action);
          });
        }
      }, _defineProperty(_statics, "showPrefabs", function showPrefabs(path) {
        var self = this;
        cc.ms.Window.show(path, function(item) {
          var action = cc.sequence(cc.fadeIn(.1), cc.delayTime(1), cc.callFunc(function() {
            self.ISSHOW = true;
            item.destroy();
          }));
          item.runAction(action);
        });
      }), _defineProperty(_statics, "loadPrefab", function loadPrefab(path, callBack) {
        cc.loader.loadRes(path, cc.Prefab, function(err, prefab) {
          callBack(prefab);
        });
      }), _defineProperty(_statics, "loadAtlas", function loadAtlas(sprite, str, path) {
        cc.loader.loadRes(path, cc.SpriteAtlas, function(err, spriteAtlas) {
          sprite.spriteFrame = spriteAtlas._spriteFrames[str];
        });
      }), _defineProperty(_statics, "playAnimation", function playAnimation(node, durTime, callback) {
        var anim = node.getComponent(cc.Animation);
        null != callback && anim.on("finished", callback, this);
        node.active = true;
        anim.play();
        if (durTime > 0 && durTime < 100) {
          console.log(node);
          node.runAction(cc.sequence(cc.delayTime(durTime), cc.callFunc(function() {
            anim.stop();
            node.active = false;
          })));
        } else if (100 == durTime) anim.repeatCount = Infinity; else {
          console.log(durTime);
          console.log(node);
        }
      }), _defineProperty(_statics, "cutString", function cutString(str, len) {
        console.log(str.length, str.substring(0, len));
        if (str.length <= len) return str;
        return str.substring(0, len);
      }), _defineProperty(_statics, "coinsToWan", function coinsToWan(coins) {
        var coinsNew;
        var totalScore = coins;
        var coins = Number(coins);
        if (coins >= 1e6) {
          coinsNew = (coins / 1e4).toFixed(3);
          var s = coinsNew.substring(0, coinsNew.lastIndexOf(".") + 3);
          console.log(s);
          return s + "\u4e07";
        }
        coinsNew = totalScore;
        return coinsNew;
      }), _defineProperty(_statics, "setHeadImgById", function setHeadImgById(node, id) {
        console.log("headId = " + id);
        var nId;
        nId = null == id || "" == id ? 1 : id;
        cc.ms.Tool.loadTexture(node, "common/tx/tx_" + nId);
      }), _defineProperty(_statics, "sendHTTP", function sendHTTP(url, callback, content, time) {
        console.log("url:", url);
        null == time && (time = 5e3);
        var request = new XMLHttpRequest();
        var timeout = false;
        var timer = setTimeout(function() {
          timeout = true;
          request.abort();
        }, time);
        var type = "GET";
        content && (type = "POST");
        request.open(type, url);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
        request.onreadystatechange = function() {
          console.log("HTTP request:", request);
          if (4 !== request.readyState) return;
          if (timeout) return;
          clearTimeout(timer);
          200 === request.status && callback(request.responseText);
        };
        request.send(content);
      }), _defineProperty(_statics, "getGUID", function getGUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          var r = 16 * Math.random() | 0, v = "x" == c ? r : 3 & r | 8;
          return v.toString(16);
        });
      }), _defineProperty(_statics, "GetShortString", function GetShortString(sName, nMaxCount, nShowCount) {
        if (null == sName || null == nMaxCount) return;
        var sStr = sName;
        var tCode = [];
        var tName = [];
        var nLenInByte = sStr.length;
        var nWidth = 0;
        null == nShowCount && (nShowCount = nMaxCount - 3);
        for (var i = 0; i <= nLenInByte - 1; i++) {
          var stringItem = sStr.slice(i, i + 1);
          var bytes = this.stringToByte(stringItem);
          for (var j = 0; j < bytes.length; j++) {
            var curByte = bytes[j];
            if (null != bytes[j]) {
              var byteCount = 0;
              curByte > 0 && curByte <= 127 ? byteCount = 1 : curByte >= 192 && curByte < 223 ? byteCount = 2 : curByte >= 224 && curByte < 239 ? byteCount = 3 : curByte >= 240 && curByte <= 247 && (byteCount = 4);
              var char = null;
              if (byteCount > 0) {
                char = sStr.substring(i, i + byteCount);
                j += byteCount;
              }
              if (1 == byteCount) {
                nWidth += 1;
                tName.push(char);
                tCode.push(1);
              } else if (byteCount > 1) {
                nWidth += byteCount;
                tName.push(char);
                tCode.push(byteCount);
              }
            }
          }
        }
        if (nWidth > nMaxCount) {
          var _sN = "";
          var _len = 0;
          for (var i = 0; i < tName.length - 1; i++) {
            _sN += tName[i];
            _len += tCode[i];
            if (_len >= nShowCount) break;
          }
          sName = _sN + "...";
        }
        return sName;
      }), _defineProperty(_statics, "formatStringByWidth", function formatStringByWidth(TextNode, name, maxlen, maxWidth) {
        var totalLen = 0;
        for (var i = 0; i <= name.length - 1; i++) {
          var char = name.slice(i, i + 1);
          var bytes = this.stringToByte(char);
          totalLen += bytes.length;
        }
        var len = totalLen;
        var index = len;
        var str;
        while (index > 0) {
          str = this.GetShortString(name, index, maxlen);
          TextNode.string = str;
          var curWidth = TextNode.node.getContentSize().width;
          if (curWidth <= maxWidth) return;
          index -= 1;
        }
        while (maxlen > 0) {
          str = this.GetShortString(name, 1, maxlen);
          TextNode.string = str;
          var curWidth = TextNode.node.getContentSize().width;
          if (curWidth <= maxWidth) return;
          maxlen -= 1;
        }
      }), _defineProperty(_statics, "clone", function clone(obj) {
        var ret = [];
        for (var i in obj) null != obj[i] && ret.push(obj[i]);
        return ret;
      }), _defineProperty(_statics, "formatter", function formatter(value) {
        if (value.length <= 4) {
          var str = "****" + value;
          return str;
        }
        var len = value.length;
        var xx = value.substring(0, len - 4);
        var values = value.replace(xx, "****");
        return values;
      }), _defineProperty(_statics, "getByteLen", function getByteLen(val) {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
          var a = val.charAt(i);
          null != a.match(/[^\x00-\xff]/gi) ? len += 2 : len += 1;
        }
        return len;
      }), _defineProperty(_statics, "interceptTheLastFourPlaces", function interceptTheLastFourPlaces(name) {
        if (this.getByteLen(name) <= 4) return "****" + name;
        var len = 0;
        for (var i = name.length - 1; i > 0; i--) {
          var a = name.charAt(i);
          null != a.match(/[^\x00-\xff]/gi) ? len += 2 : len += 1;
          if (4 == len) return "****" + name.slice(i);
          if (len > 4) return "****" + name.slice(i + 1);
        }
      }), _statics)
    });
    cc._RF.pop();
  }, {} ],
  Window: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b7542YQ3X9DO5BIHW53iaI/", "Window");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      show: function show(path, callBack) {
        cc.ms.Tool.loadPrefab("prefab/" + path, function(prefab) {
          var newNode = null;
          if (cc.supportJit) {
            cc.supportJit = false;
            newNode = cc.instantiate(prefab);
            cc.supportJit = true;
          } else newNode = cc.instantiate(prefab);
          var canvas = cc.director.getScene().getChildByName("Canvas");
          newNode.parent = canvas;
          newNode.zIndex = 4e3;
          callBack && callBack(newNode);
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  fight: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3a8b7uxqjJIppNJjawiXIUI", "fight");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        distance: cc.Label,
        countDown: cc.Label,
        animName: cc.Label,
        animHandCardNum: cc.Label,
        animspecialSkillNum: cc.Label,
        animHp: cc.ProgressBar,
        animinternalforce: cc.ProgressBar,
        myName: cc.Label,
        myHandCardNum: cc.Label,
        myspecialskillNum: cc.Label,
        myHp: cc.ProgressBar,
        myinternalforce: cc.ProgressBar,
        handCardShow: cc.Node,
        animBUf: cc.Node,
        myBUf: cc.Node,
        bufPrefab: cc.Prefab,
        cardType1: cc.Prefab,
        overNode: cc.Node,
        overNode1: cc.Node,
        myAction: cc.Node,
        animAction: cc.Node,
        actionNode: cc.Prefab
      },
      onLoad: function onLoad() {
        this.overNode.active = false;
        this.overNode1.active = false;
        this.distancArr = [ "\u58f9", "\u8d30", "\u53c1", "\u8086", "\u4f0d", "\u9646", "\u67d2", "\u634c", "\u7396", "\u62fe" ];
        this.dataBegin(true);
        this.round = null;
        this.schedule(this.getData, 1);
      },
      dataBegin: function dataBegin(flag) {
        var self = this;
        var data = {
          userId: cc.ms.DataManager.getUserData().userId,
          fightId: cc.ms.DataManager.getUserData().fightId,
          action: 1,
          cardId: null
        };
        HttpHelper.httpPostStatue(cc.ms.NetConst.fightState, data, function(data) {
          console.log("\u6218\u6597\u72b6\u6001");
          cc.log(data);
          if (data.data) {
            self.refreshShow(data, flag);
            cc.log(data);
          } else data.errStr && cc.ms.Toast.show(data.errStr);
        });
      },
      getData: function getData(flag) {
        var self = this;
        var data = {
          userId: cc.ms.DataManager.getUserData().userId,
          fightId: cc.ms.DataManager.getUserData().fightId,
          action: 1,
          cardId: null
        };
        HttpHelper.httpPostStatue(cc.ms.NetConst.fightState, data, function(data) {
          console.log("\u6218\u6597\u72b6\u6001");
          if (data.data) {
            self.refreshShow(data);
            cc.log(data);
          } else data.errStr && cc.ms.Toast.show(data.errStr);
        });
      },
      start: function start() {},
      refreshShow: function refreshShow(_msg, flag, flag1) {
        if (!_msg.data) return;
        if (_msg.data.end) {
          this.unschedule(this.getData);
          if (cc.ms.DataManager.getUserData().userId == _msg.data.winner) {
            cc.ms.am.playEffect("action/win");
            this.overNode.active = true;
          } else {
            cc.ms.am.playEffect("action/default");
            this.overNode1.active = true;
          }
          return;
        }
        cc.log("\u5237\u65b0");
        cc.log(_msg.data);
        var msg = _msg.data;
        this.showrRoundchange(msg, flag);
        this.distance.string = this.distancArr[msg.distance - 1];
        this.countDown.string = msg.countDown;
        if (msg.enemyStatus) {
          var animData = msg.enemyStatus;
          this.animName.string = animData.username;
          this.animHandCardNum.string = animData.deckCardNum;
          this.animspecialSkillNum.string = animData.specialSkillNum;
          this.animHp.progress = animData.hp / animData.maxHp;
          this.animHp.node.children[0].getComponent(cc.Label).string = animData.maxHp + "/" + animData.hp;
          this.animinternalforce.progress = animData.interForce / animData.initInterForce;
          this.animinternalforce.node.children[0].getComponent(cc.Label).string = animData.initInterForce + "/" + animData.interForce;
          if (animData.buffStatus) {
            this.animBUf.removeAllChildren();
            for (var i = 0; i < animData.buffStatus.length; i++) if (animData.buffStatus[i].id <= 103) {
              var buf = cc.instantiate(this.bufPrefab);
              this.animBUf.addChild(buf);
              var spr = buf.getComponent(cc.Sprite);
              var path = "pic/state/(" + animData.buffStatus[i].id + ")";
              cc.ms.Tool.loadTexture(spr, path);
            }
          }
          animData.lastCardIds.length && animData.lastCardIds.length != this.animAction.childrenCount && this.showAction(this.animAction, animData.lastCardIds, flag);
        }
        if (msg.selfStatus) {
          var _animData = msg.selfStatus;
          this.myHandCardNum.string = _animData.deckCardNum;
          this.myspecialskillNum.string = _animData.specialSkillNum;
          this.myHp.progress = _animData.hp / _animData.maxHp;
          this.myHp.node.children[0].getComponent(cc.Label).string = _animData.maxHp + "/" + _animData.hp;
          this.myinternalforce.progress = _animData.interForce / _animData.initInterForce;
          this.myinternalforce.node.children[0].getComponent(cc.Label).string = _animData.initInterForce + "/" + _animData.interForce;
          if (_animData.buffStatus) {
            this.myBUf.removeAllChildren();
            for (var _i = 0; _i < _animData.buffStatus.length; _i++) if (_animData.buffStatus[_i].id <= 103) {
              var _buf = cc.instantiate(this.bufPrefab);
              this.myBUf.addChild(_buf);
              var _spr = _buf.getComponent(cc.Sprite);
              var _path = "pic/state/(" + _animData.buffStatus[_i].id + ")";
              cc.ms.Tool.loadTexture(_spr, _path);
            }
          }
          if (_animData.handCards && (flag || flag1) || _animData.handCards.length != this.handCardShow.children.length) {
            var node = cc.find("Canvas/\u57fa\u7840\u724c\u5e95");
            node && node.destroy();
            this.handCardShow.removeAllChildren();
            _animData.handCards.length <= 6 ? this.handCardShow.getComponent(cc.Layout).spacingX = -20 : _animData.handCards.length > 6 && _animData.handCards.length <= 15 ? this.handCardShow.getComponent(cc.Layout).spacingX = -80 : _animData.handCards.length > 15 && (this.handCardShow.getComponent(cc.Layout).spacingX = -100);
            for (var _i2 = 0; _i2 < _animData.handCards.length; _i2++) {
              var card = void 0;
              card = cc.instantiate(this.cardType1);
              card.children[1].getComponent("handCard").init(_animData.handCards[_i2], this, _i2);
              cc.ms.Tool.loadTexture(card.children[1].getComponent(cc.Sprite), "pic/card/" + _animData.handCards[_i2].type);
              this.handCardShow.addChild(card);
            }
          }
          if (_animData.lastCardIds.length && _animData.lastCardIds.length != this.myAction.childrenCount) {
            console.log(_animData.lastCardIds);
            this.showAction(this.myAction, _animData.lastCardIds, flag);
          }
        }
      },
      showrRoundchange: function showrRoundchange(msg, flag) {
        if (flag) {
          var node = this.countDown.node.parent.children[1];
          node.getComponent(cc.Animation).play();
          this.round = msg.myRound;
          cc.ms.am.playEffect("music/round");
          this.round ? cc.ms.Tool.showPrefabs("toolUI/1") : cc.ms.Tool.showPrefabs("toolUI/2");
        } else if (this.round == msg.myRound) ; else {
          var _node2 = this.countDown.node.parent.children[1];
          _node2.getComponent(cc.Animation).play();
          this.round = msg.myRound;
          cc.ms.am.playEffect("music/round");
          this.round ? cc.ms.Tool.showPrefabs("toolUI/1") : cc.ms.Tool.showPrefabs("toolUI/2");
        }
      },
      showAction: function showAction(_node, arr, flag) {
        var count = arr.length - _node.childrenCount;
        for (var i = _node.childrenCount; i < arr.length; i++) {
          var node = cc.instantiate(this.actionNode);
          cc.ms.Tool.loadTexture(node.getComponent(cc.Sprite), "action/" + arr[i]);
          flag || cc.ms.am.playEffect("action/" + arr[i]);
          _node.addChild(node);
        }
      },
      reBackAllcard: function reBackAllcard(ID, par) {
        this.handCardShow.children.forEach(function(e) {
          if (e.children[1]) e.children[1].getComponent("handCard").goback(ID); else {
            var card = cc.find("Canvas/\u57fa\u7840\u724c\u5e95");
            card.getComponent("handCard").goback(ID);
          }
        });
      },
      roundOver: function roundOver() {
        var self = this;
        var data = {
          userId: cc.ms.DataManager.getUserData().userId,
          fightId: cc.ms.DataManager.getUserData().fightId,
          action: 3
        };
        cc.log(data);
        HttpHelper.httpPostStatue(cc.ms.NetConst.fightState, data, function(data) {
          console.log("\u56de\u5408\u7ed3\u675f\u8bf7\u6c42");
          data.data ? self.refreshShow(data) : data.errStr && cc.ms.Toast.show(data.errStr);
        });
      },
      gameOver: function gameOver() {
        var self = this;
        var data = {
          userId: cc.ms.DataManager.getUserData().userId,
          fightId: cc.ms.DataManager.getUserData().fightId,
          action: 4
        };
        HttpHelper.httpPostStatue(cc.ms.NetConst.fightState, data, function(data) {
          console.log("\u6e38\u620f\u7ed3\u675f\u8bf7\u6c42");
          data.data ? self.refreshShow(data) : data.errStr && cc.ms.Toast.show(data.errStr);
        });
      },
      over: function over() {
        cc.director.loadScene("load");
      }
    });
    cc._RF.pop();
  }, {} ],
  handCard: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "43935dfqaJN86jLuXP1+ZNr", "handCard");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        cTime: cc.Label,
        cardname: cc.Label,
        cInterForce: cc.Label,
        distance: cc.Label,
        desc: cc.Label,
        animNode: cc.Node
      },
      onLoad: function onLoad() {
        this.oldPar = this.node.parent;
        this.oldPos = this.node.getPosition();
        this.count = 0;
      },
      goback: function goback(id) {
        if (id != this.countId && 1 == this.count) {
          console.log("\u590d\u4f4d");
          this.node.parent = this.oldPar;
          this.node.y = this.oldPos.y;
          this.node.x = this.oldPos.x;
          this.count = 0;
        }
      },
      start: function start() {
        var self = this;
        this.node.on("touchend", function(event) {
          if (self.node.y >= 300) {
            if (1 == this.count) ; else {
              var canvas = cc.director.getScene().getChildByName("Canvas");
              var pos = self.oldPar.convertToWorldSpaceAR(self.node.getPosition());
              var pos1 = self.oldPar.parent.convertToNodeSpaceAR(pos);
              this.node.parent = canvas;
              var pos2 = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
              console.log(pos1, pos2);
              this.node.y = pos1.y - 244.5;
              this.node.x = pos1.x;
            }
            this.sendCard();
            self.fight.reBackAllcard(self.countId);
            this.count = 0;
            console.log("111111");
            return;
          }
          if (self.node.y < 300) {
            console.log("22222");
            this.node.y = this.oldPos.y;
            this.node.x = this.oldPos.x;
          }
          this.count += 1;
          if (1 == this.count) {
            console.log("33333333333");
            self.fight.reBackAllcard(self.countId, self.oldPar);
            var canvas = cc.director.getScene().getChildByName("Canvas");
            this.node.parent = canvas;
            this.node.x = this.oldPar.getPosition().x;
            this.node.y = this.oldPar.getPosition().y - 200;
          }
          if (2 == this.count) {
            console.log("4444444444444");
            this.node.parent = this.oldPar;
            self.fight.reBackAllcard(self.countId);
            this.count = 0;
            this.node.y = 0;
          }
        }, this);
        this.node.on("touchmove", function(event) {
          this.node.y += event.getDeltaY();
          this.node.x += event.getDeltaX();
        }, this);
      },
      init: function init(data, figth, countId) {
        this.fight = figth;
        this.cardId = data.id;
        this.countId = countId;
        this.cTime.string = data.ctime;
        this.cardname.string = data.name;
        this.cInterForce.string = data.cinterForce;
        this.desc.string = data.desc;
        this.distance.string = data.minDistance + "-" + data.maxDistance;
      },
      sendCard: function sendCard() {
        var self = this;
        var data = {
          userId: cc.ms.DataManager.getUserData().userId,
          fightId: cc.ms.DataManager.getUserData().fightId,
          action: 2,
          cardId: this.cardId
        };
        HttpHelper.httpPostStatue(cc.ms.NetConst.fightState, data, function(data) {
          cc.log(data);
          if (data.data) {
            console.log("\u51fa\u724c\u6210\u529f");
            self.oldPar.destroy();
            self.animNode.getComponent(cc.Animation).play();
            self.scheduleOnce(function() {
              self.node.destroy();
            }, .6);
          } else if (data.errStr) {
            self.node.parent = self.oldPar;
            cc.ms.Toast.show(data.errStr);
            self.fight.reBackAllcard(self.countId);
            self.node.y = self.oldPos.y;
            self.node.x = self.oldPos.x;
            self.count = 0;
          }
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  http: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0baf0CTT65MMJ8qbrMbEHG/", "http");
    "use strict";
    var HttpHelper = cc.Class({
      extends: cc.Component,
      statics: {},
      properties: {},
      httpGet: function httpGet(url, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (4 === xhr.readyState && 200 == xhr.status) {
            var respone = xhr.responseText;
            var rsp = JSON.parse(respone);
            callback(rsp);
          } else 4 === xhr.readyState && 401 == xhr.status && callback({
            status: 401
          });
        };
        xhr.withCredentials = true;
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader("Access-Control-Allow-Methods", "GET, POST");
        xhr.setRequestHeader("Access-Control-Allow-Headers", "x-requested-with,content-type,authorization");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 8e3;
        xhr.send();
      },
      httpPost: function httpPost(url, params, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (4 === xhr.readyState && 200 == xhr.status) {
            var respone = xhr.responseText;
            var rsp = JSON.parse(respone);
            callback(rsp);
          } else callback(-1);
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 8e3;
        xhr.send(JSON.stringify(params));
      },
      httpPostLogin: function httpPostLogin(url, params, callback, account, password) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (4 === xhr.readyState && 200 == xhr.status) {
            var respone = xhr.responseText;
            var rsp = JSON.parse(respone);
            callback(rsp);
          } else callback(-1);
        };
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 8e3;
        xhr.send(JSON.stringify(params));
      },
      httpPostStatue: function httpPostStatue(url, params, callback, account, password) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (4 === xhr.readyState && 200 == xhr.status) {
            var respone = xhr.responseText;
            var rsp = JSON.parse(respone);
            callback(rsp);
          } else callback(-1);
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 8e3;
        xhr.send(JSON.stringify(params));
      }
    });
    window.HttpHelper = new HttpHelper();
    cc._RF.pop();
  }, {} ],
  load: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8e49e06qLVOWoWiWOkFGdQM", "load");
    "use strict";
    function initMgr() {
      cc.ms = {};
      var rootNode = new cc.Node();
      cc.game.addPersistRootNode(rootNode);
      cc.ms.rootNode = rootNode;
      var DataManager = require("./DataManager");
      cc.ms.DataManager = new DataManager();
      cc.ms.DataManager.initData();
      var AudioMgr = require("./AudioMgr");
      cc.ms.am = new AudioMgr();
      cc.ms.am.initData();
      var NetConst = require("./netConst");
      cc.ms.NetConst = new NetConst();
      cc.ms.Tool = require("./Tool");
      var win = require("./Window");
      cc.ms.Window = new win();
      var toast = require("./Toast");
      cc.ms.Toast = new toast();
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        begin: cc.Node,
        cancel: cc.Node,
        countDownLabel: cc.Label,
        IDlabel: cc.EditBox
      },
      onLoad: function onLoad() {
        this.lineCount = 0;
        initMgr();
        this.cancel.active = false;
        this.begin.active = false;
        this.countDownLabel.string = "\u52a0\u8f7d\u4e2d";
        cc.ms._userId = "a";
        cc.ms.am.playMusic("action/bg", true);
        cc.ms.am.setMusicVolume(0);
        cc.ms.am.setEffectVolume(0);
      },
      login: function login() {
        var self = this;
        if (this.IDlabel) {
          cc.ms._userId = this.IDlabel.string;
          var data = HttpHelper.httpPostLogin(cc.ms.NetConst.getID + cc.ms._userId, cc.ms._userId, function(data) {
            console.log("get\u7528\u6237\u6570\u636e");
            cc.log("--\x3e");
            cc.log(data);
            if (0 == data.code) {
              cc.ms.DataManager.saveUserData(data.data);
              var statue = data.data.status;
              if (0 == statue) {
                self.begin.active = true;
                self.countDownLabel.string = "\u70b9\u51fb\u5f00\u59cb\u5339\u914d";
              } else if (1 == statue) {
                self.cancel.active = true;
                self.countDownLabel.string = "\u5339\u914d\u4e2d";
                self.begin.active = false;
              } else 2 == statue && cc.director.loadScene("fight");
            } else cc.log("code \u6570\u636e\u4e0d\u4e3a0");
          });
        } else var _data = HttpHelper.httpPostLogin(cc.ms.NetConst.getID + cc.ms._userId, "a", function(data) {
          console.log("get\u7528\u6237\u6570\u636e");
          cc.log("--\x3e");
          cc.log(data);
          if (0 == data.code) {
            cc.ms.DataManager.saveUserData(data.data);
            var statue = data.data.status;
            if (0 == statue) {
              self.begin.active = true;
              self.countDownLabel.string = "\u70b9\u51fb\u5f00\u59cb\u5339\u914d";
            } else if (1 == statue) {
              self.cancel.active = true;
              self.countDownLabel.string = "\u5339\u914d\u4e2d";
              self.begin.active = false;
            } else 2 == statue && cc.director.loadScene("fight");
          } else cc.log("code \u6570\u636e\u4e0d\u4e3a0");
        });
      },
      start: function start() {
        var self = this;
      },
      onButtonClick: function onButtonClick(event, curStomData) {
        this[curStomData]();
      },
      beginLine: function beginLine() {
        var self = this;
        var userId = cc.ms.DataManager.getUserData().userId;
        var data = {
          userId: userId
        };
        HttpHelper.httpPost(cc.ms.NetConst.inLine + cc.ms._userId, data, function(data) {
          console.log("\u8bf7\u6c42\u5339\u914d\u6570\u636e");
          console.log(data);
          -1 != data && self.swithChange();
        });
      },
      cancelLine: function cancelLine() {
        var self = this;
        var userId = cc.ms.DataManager.getUserData().userId;
        var data = {
          userId: userId
        };
        HttpHelper.httpPost(cc.ms.NetConst.outLine + cc.ms._userId, data, function(data) {
          console.log("\u53d6\u6d88\u5339\u914d\u6570\u636e");
          console.log(data);
          -1 != data && self.swithChange();
        });
      },
      swithChange: function swithChange() {
        this.begin.active = !this.begin.active;
        this.cancel.active = !this.cancel.active;
        this.checkCountDown();
      },
      checkCountDown: function checkCountDown() {
        if (this.begin.active) {
          this.unschedule(this.countDown);
          this.lineCount = 0;
          this.countDownLabel.string = "\u70b9\u51fb\u5f00\u59cb\u5339\u914d";
        } else this.schedule(this.countDown, 1);
      },
      countDown: function countDown() {
        this.lineCount += 1;
        this.countDownLabel.string = this.lineCount;
        var self = this;
        var data = HttpHelper.httpPostLogin(cc.ms.NetConst.getID + cc.ms._userId, "a", function(data) {
          console.log("get\u7528\u6237\u6570\u636e");
          cc.log("--\x3e");
          cc.log(data);
          if (0 == data.code) {
            cc.ms.DataManager.saveUserData(data.data);
            var statue = data.data.status;
            if (2 == statue) {
              self.unschedule(self.countDown);
              cc.director.loadScene("fight");
            }
          } else cc.log("code \u6570\u636e\u4e0d\u4e3a0");
        });
      }
    });
    cc._RF.pop();
  }, {
    "./AudioMgr": "AudioMgr",
    "./DataManager": "DataManager",
    "./Toast": "Toast",
    "./Tool": "Tool",
    "./Window": "Window",
    "./netConst": "netConst"
  } ],
  netConst: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a22128XCFFDW5emdPzUxFrU", "netConst");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        getID: "http://49.232.154.241:8081/user/status?userId=",
        inLine: "http://49.232.154.241:8081/match/queue?userId=",
        outLine: "http://49.232.154.241:8081/match/cancel?userId=",
        lineStatue: "http://49.232.154.241:8081/match/status?userId=",
        fightState: "http://49.232.154.241:8081/fight/common"
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "AudioMgr", "DataManager", "Toast", "Tool", "Window", "fight", "handCard", "http", "load", "netConst" ]);