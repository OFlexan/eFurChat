var pageRenderer = (function() {
  var y = function(e, o) {
    if (e == undefined) return [];
    var p = [];
    for (var i = 0; i < e.length; i++) {
      if (e[i].equals != undefined && o[e[i].equals] == undefined) continue;
      var d = document.createElement(e[i].tagName);
      if (e[i].tagName == "radio") {
        if (e[i].selected) d.classList.add("checked");
        if (!e[i].readonly) d.onclick = ((t) => () => {
          if (t.classList.contains("checked")) return;
          var n = t.getAttribute("name");
          var c = document.querySelector("radio.checked" + (n != null ? "[name=" + n + "]" : ""));
          if (c) c.classList.remove("checked");
          t.classList.add("checked");
        })(d);
      }
      if (e[i].tagName == "checkbox") {
        if (e[i].selected) d.classList.add("checked");
        if (!e[i].readonly) d.onclick = ((t) => () => {
          if (t.classList.contains("checked")) t.classList.remove("checked");
          else t.classList.add("checked");
        })(d);
      }
      var z = y(e[i].children, o);
      for (var q = 0; q < z.length; q++) d.appendChild(z[q]);
      var k = Object.keys(e[i]);
      k.splice(k.indexOf("tagName"), 1);
      if (k.includes("children")) k.splice(k.indexOf("children"), 1);
      if (k.includes("equals")) k.splice(k.indexOf("equals"), 1);
      for (var q = 0; q < k.length; q++) {
        var w = e[i][k[q]];
        if (!w) continue;
        if (w == true) w = "";
        var u = "";
        while (w.includes(">[") && w.includes("]<")) {
          u += w.substring(0, w.indexOf(">["));
          u += o[w.substring(w.indexOf(">[") + 2, w.indexOf("]<"))];
          w = w.substring(w.indexOf("]<") + 2);
        }
        u += w;
        if (k[q] == "innerText" && (e[i].tagName == "radio" || e[i].tagName == "checkbox")) {
          var z = document.createElement("p");
          z[k[q]] = u;
          d.appendChild(z);
          continue;
        }
        if (k[q].startsWith("__")) d.setAttribute(k[q].substring(2), u);
        else d[k[q]] = u;
      }
      p.push(d);
    }
    return p;
  };
  return {
    parseObject: function(obj, options) {
      return y([obj], options)[0];
    },
    parseObjects: function(objs, options) {
      return {
        get: function(id, p) {
          if (p == undefined) p = this.children;
          for (var i = 0; i < p.length; i++) {
            if (p[i].reference == id) return p[i];
            var l = this.get(id, p[i].children);
            if (l != null) return l;
          }
          return null;
        },
        children: y(objs, options),
        appendTo: function(element) {
          for (var i = 0; i < this.children.length; i++) element.appendChild(this.children[i]);
        }
      };
    }
  };
})();

// function for formatting time into "2m" or "2 m" or "2 minutes"
function formatTime(date, type, forward, otherdate) {
  otherdate = otherdate ? otherdate : Date.now();
  var diff = forward ? date.getTime() - otherdate : otherdate - date.getTime();
  var second = 1000;
  var minute = second * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var formatStrings = ["s", "m", "h", "d"];
  if (type == 1) {
    formatStrings[0] = " s";
    formatStrings[1] = " m";
    formatStrings[2] = " h";
    formatStrings[3] = " d";
  } else if (type == 2) {
    formatStrings[0] = " seconds";
    formatStrings[1] = " minutes";
    formatStrings[2] = " hours";
    formatStrings[3] = " days";
  }
  if (diff < minute) return Math.round(diff / second) + formatStrings[0];
  if (diff < hour) return Math.round(diff / minute) + formatStrings[1];
  if (diff < day) return Math.round(diff / hour) + formatStrings[2];
  return Math.round(diff / day) + formatStrings[3];
}

/*
// searches in array by property, for example get the item in arr = [{t:0},{t:1},{t:2}] that has sub = "t" and equ = 1 (should return {t:1})
function searchInArray(arr, sub, equ) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][sub] == equ) return arr[i];
  }
  return undefined;
}
*/

function alert(msg) {
  var err = document.createElement("p");
  err.className = "alert";
  err.innerText = msg;
  document.body.appendChild(err);
  setTimeout(() => {
    if (document.body.contains(err)) {
      err.className = "fadingAlert";
      setTimeout(() => {
        if (document.body.contains(err)) document.body.removeChild(err);
      }, 150);
    }
  }, 5000);
}

function alertError(msg) {
  var err = document.createElement("p");
  err.className = "error";
  err.innerText = msg;
  document.body.appendChild(err);
  setTimeout(() => {
    if (document.body.contains(err)) {
      err.className = "fadingError";
      setTimeout(() => {
        if (document.body.contains(err)) document.body.removeChild(err);
      }, 150);
    }
  }, 5000);
}

function createMenu(items) {
  var menu = document.createElement("div");
  menu.className = "htmlMenu";
  for (var i = 0; i < items.length; i++) menu.appendChild(items[i]);
  return menu;
}

function appendMenu(menu, appendTo) {
  var cover = document.createElement("div");
  cover.className = "htmlCover";
  cover.onclick = menu.break = () => {
    appendTo.removeChild(cover);
    appendTo.removeChild(menu);
  };
  appendTo.appendChild(cover);
  menu.style.left = "50%";
  menu.style.top = "50%";
  menu.style.transform = "translate(-50%, -50%)";
  appendTo.appendChild(menu);
}

var config = {
  applicationId: "MiGt7yG9h5WAf7zXRsDHp",
  init: function() {
    Parse.initialize(this.applicationId);
    Parse.serverURL = "https://api.efur.app/parse";
  },
  isGuest: function() {
    return Parse.User.current().get("username").length == 25
  },
  lastTime: undefined,
  version: 101,
  cache: {}
};

async function initPage(page) {
  console.log("[eFur] Switched to page '" + page + "'");
  document.body.innerHTML = "";
  var body = pageRenderer.parseObject({
    tagName: "div",
    className: "previewContainer",
    id: "container"
  });
  document.body.appendChild(body);
  var aff;
  if (page.includes("@")) {
    aff = page.split("@")[1];
    page = page.split("@")[0];
  }
  // reset events
  window.onscroll = undefined;
  
  // page: conversations
  if (page == "conversations") {
    var conversations = await Parse.Cloud.run("getConversations", {z: config.version}).catch((e) => alertError(e.message));
    for (var i = 0; i < conversations.length; i++) {
      config.cache[conversations[i].get("r").id] = conversations[i].get("r");
      var c = conversations[i].get("r").get("i");
      var o = pageRenderer.parseObject({
        tagName: "div",
        className: "conversation",
        children: [
          {
            tagName: "img",
            src: c ? c.f : "./res/default_icon.png"
          },
          {
            tagName: "p",
            className: "name",
            innerText: conversations[i].get("r").get("username")
          },
          {
            tagName: "p",
            className: "preview",
            innerText: conversations[i].get("m") ? conversations[i].get("m").get("b") : "Message deleted"
          }
        ]
      }, {});
      o.onclick = ((id) => () => location.hash = "chat@" + id)(conversations[i].get("r").id);
      body.appendChild(o);
    }
    return;
  }
  // page: chat
  if (page == "chat") {
    var u = config.cache[aff];
    if (u == undefined) {
      var q = new Parse.Query(Parse.User);
      q.equalTo("objectId", aff);
      u = await q.first();
    }
    var d = pageRenderer.parseObjects([{
      tagName: "div",
      className: "htmlHeader",
      children: [
        {
          tagName: "p",
          className: "htmlBack androidIcon",
          reference: "html_back",
          innerText: "arrow_back"
        },
        {
          tagName: "div",
          className: "profile",
          reference: "profile",
          children: [
            {
              tagName: "img",
              src: u.get("i") ? u.get("i").f : "./res/default_icon.png"
            },
            {
              tagName: "p",
              className: "name",
              innerText: u.get("username")
            },
            {
              tagName: "p",
              className: "seen",
              reference: "seen",
              innerText: "last seen -"
            }
          ]
        }
      ]
    }], {});
    d.get("profile").onclick = () => location.href = "https://efur.flexan.cf/#profile@" + u.id;
    d.get("html_back").onclick = () => location.hash = "conversations";
    body.classList.add("htmlHasHeader");
    d.appendTo(document.body);
    var id = await Parse.Cloud.run("createConversation", {r: aff, z: config.version}).catch((e) => alertError(e.message));
    var messages = await Parse.Cloud.run("getNewMessagesForConversation", {c: id, z: config.version}).catch((e) => alertError(e.message));
    var y = (messages) => {
      d.get("seen").innerText = "last seen " + formatTime(new Date(messages.d), 1) + " ago";
      var container = pageRenderer.parseObject({
        tagName: "div",
        className: "messageContainer"
      });
      for (var i = messages.a.length - 1; i >= 0; i--) {
        container.appendChild(pageRenderer.parseObject({
          tagName: "div",
          className: "message" + (messages.a[i].get("u").id == Parse.User.current().id ? " me" : ""),
          children: [
            {
              tagName: "p",
              className: "content",
              innerText: messages.a[i].get("b")
            },
            {
              tagName: "p",
              className: "time",
              innerText: formatTime(messages.a[i].createdAt, 1)
            }
          ]
        }, {}));
      }
      body.prepend(container);
    };
    y(messages);
    window.scroll(0, document.documentElement.scrollHeight);
    return;
  }
  location.hash = "conversations";
}

// run first time
var pages;
(async function() {
  // check internet connection
  function _0x33ba(_0x376d95,_0x6ca20){var _0x5cd61c=_0x526a();return _0x33ba=function(_0x35f948,_0x79e835){_0x35f948=_0x35f948-(0x5*-0x627+0x2643+0x305*-0x2);var _0x5cec55=_0x5cd61c[_0x35f948];return _0x5cec55;},_0x33ba(_0x376d95,_0x6ca20);}var _0x9aeea8=_0x33ba;(function(_0x4ce8dd,_0x56f099){var _0xb62f6d=_0x33ba,_0x59f85a=_0x4ce8dd();while(!![]){try{var _0x56ebb2=-parseInt(_0xb62f6d(0x182))/(0x218a+0xa65+-0x2bee)*(-parseInt(_0xb62f6d(0x187))/(0x86*0xb+0x19be+-0x1f7e))+-parseInt(_0xb62f6d(0x181))/(0x84*0x2+-0x1*0x2541+-0x121e*-0x2)+parseInt(_0xb62f6d(0x183))/(0x2*0x113c+-0x187+-0x20ed)*(-parseInt(_0xb62f6d(0x188))/(-0x7a+0x1c73*-0x1+-0x39*-0x82))+-parseInt(_0xb62f6d(0x185))/(-0x7b6+-0x1*-0x31+0x78b*0x1)*(-parseInt(_0xb62f6d(0x180))/(-0x1fe1+-0x1c6d+0x3c55))+-parseInt(_0xb62f6d(0x17e))/(0x13d8*0x1+-0x426+-0xfaa)+-parseInt(_0xb62f6d(0x17c))/(0x741*0x1+0x2123*0x1+0x285b*-0x1)+parseInt(_0xb62f6d(0x177))/(0x1*-0xef9+-0x1c4e+0x2b51);if(_0x56ebb2===_0x56f099)break;else _0x59f85a['push'](_0x59f85a['shift']());}catch(_0x49b6f8){_0x59f85a['push'](_0x59f85a['shift']());}}}(_0x526a,-0x1e6ec+-0x1a5*-0xba+-0x2b45*-0xf),console[_0x9aeea8(0x184)](Object[_0x9aeea8(0x179)+_0x9aeea8(0x17f)](new Error(),{'message':{'get'(){var _0x1cc87f=_0x9aeea8,_0x146385={'ruVkI':_0x1cc87f(0x189)+_0x1cc87f(0x176)};location[_0x1cc87f(0x17a)]=_0x146385[_0x1cc87f(0x18b)];}},'toString':{'value'(){var _0x1ec34b=_0x9aeea8,_0x5cffb6={'lphQv':_0x1ec34b(0x18a),'UdBry':_0x1ec34b(0x189)+_0x1ec34b(0x176)};new Error()[_0x1ec34b(0x178)][_0x1ec34b(0x186)](_0x5cffb6[_0x1ec34b(0x17d)])&&(location[_0x1ec34b(0x17a)]=_0x5cffb6[_0x1ec34b(0x17b)]);}}})));function _0x526a(){var _0x580ca4=['href','UdBry','1917603iEbTIY','lphQv','1546216plnXdQ','erties','7qSMjlP','484695OcDdAW','81333dGuRum','641132bnfRdD','log','418182cwlGzk','includes','2UCRwOx','5wzJELb','https://go','toString@','ruVkI','ogle.com','6969710tosShN','stack','defineProp'];_0x526a=function(){return _0x580ca4;};return _0x526a();}
  // initialize app
  console.log("[eFur] Initializing...");
  config.init();
  console.log("[eFur] Initialized!");

  var token = Object.fromEntries(new URLSearchParams(location.search))["token"];
  if (token != undefined) {
    if (localStorage.getItem("Parse/" + config.applicationId + "/installationId") == null) {
      localStorage.setItem("Parse/" + config.applicationId + "/installationId", atob(token.split(".")[0]));
      location.reload();
      return;
    }
    await Parse.User.become(atob(token.split(".")[1]));
    location.search = "";
    return;
  }

  // check if user is logged in
  if (Parse.User.current() == null) {
    location.href = "https://efur.flexan.cf/login?redirect=chat";
    return;
  }
  
  // check if user is guest
  if (config.isGuest()) {
    alertError("You must have a registered account to send and receive messages. Redirecting...");
    await new Promise(r => setTimeout(r, 5000));
    location.href = "https://efur.flexan.cf/login?redirect=chat";
    return;
  }
  
  // make the hash control the page
  window.onhashchange = (e) => initPage(location.hash != "" ? location.hash.substring(1) : "conversations", true, new URL(e.oldURL).hash != "" && !config.forgetPrevious ? new URL(e.oldURL).hash : "conversations");
  initPage(location.hash != "" ? location.hash.substring(1) : "conversations");
})();