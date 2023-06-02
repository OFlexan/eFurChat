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
  cache: {},
  interval: -1
};

async function initPage(page) {
  console.log("[eFur] Switched to page '" + page + "'");
  if (config.interval >= 0) clearTimeout(config.interval);
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
    }, {
      tagName: "input",
      type: "text",
      placeholder: "Type a message and press enter to send",
      className: "bottom",
      reference: "input"
    }], {});
    d.get("profile").onclick = () => location.href = "https://efur.flexan.cf/#profile@" + u.id;
    d.get("html_back").onclick = () => location.hash = "conversations";
    body.classList.add("htmlHasHeader");
    d.appendTo(document.body);
    var id = await Parse.Cloud.run("createConversation", {r: aff, z: config.version}).catch((e) => alertError(e.message));
    d.get("input").onkeyup = async (e) => {
      if (e.key != "Enter") return;
      d.get("input").disabled = true;
      var c = await Parse.Cloud.run("sendConversationMessage", {c: id, m: d.get("input").value, z: config.version}).catch((e) => alertError(e.message));
      d.get("input").value = "";
      y({a:[c]}, true);
      lastTime = +c.updatedAt;
      document.querySelector(".previewContainer").scroll(0, document.querySelector(".previewContainer").scrollHeight);
      d.get("input").disabled = false;
    };
    var messages = await Parse.Cloud.run("getNewMessagesForConversation", {c: id, z: config.version}).catch((e) => alertError(e.message));
    var y = (messages, append) => {
      if (messages.d) d.get("seen").innerText = "last seen " + formatTime(new Date(messages.d), 1) + " ago";
      var container = pageRenderer.parseObject({
        tagName: "div",
        className: "messageContainer"
      });
      var o = [];
      for (var i = messages.a.length - 1; i >= 0; i--) {
        if (document.querySelector("#message-" + messages.a[i].id)) continue;
        if (messages.a[i].get("t")) {
          o.push(messages.a[i]);
          continue;
        }
        var z = pageRenderer.parseObject({
          tagName: "div",
          className: "message" + (messages.a[i].get("u").id == Parse.User.current().id ? " me" : ""),
          id: "message-" + messages.a[i].id,
          children: [
            {
              tagName: "p",
              className: "content",
              innerText: messages.a[i].get("b")
            },
            {
              tagName: "p",
              className: "time",
              time: +messages.a[i].createdAt + "",
              edited: messages.a[i].get("e") ? +messages.a[i].updatedAt + "" : undefined,
              children: [{
                tagName: "span",
                className: "innerTime",
                innerText: formatTime(messages.a[i].createdAt, 1) + (messages.a[i].get("e") ? " (edited " + formatTime(messages.a[i].updatedAt, 1) + " ago)" : "")
              }, {
                tagName: "p",
                className: ">[hidden]<hasRead androidIcon",
                innerText: "check",
                equals: "read"
              }]
            }
          ]
        }, {
          read: messages.a[i].get("u").id == Parse.User.current().id ? "" : undefined,
          hidden: +messages.a[i].createdAt <= messages.d ? "" : "hidden "
        });
        if (messages.a[i].get("u").id == Parse.User.current().id) z.onclick = ((msg) => () => {
          var r = pageRenderer.parseObjects([
            {
              tagName: "input",
              type: "text",
              placeholder: "Edit message",
              value: msg.get("b"),
              reference: "message"
            }, {
              tagName: "br"
            }, {
              tagName: "button",
              innerText: "Edit",
              reference: "edit"
            }, {
              tagName: "br"
            }, {
              tagName: "button",
              innerText: "Delete",
              className: "delete",
              reference: "delete"
            }
          ], {});
          var menu = createMenu(r.children);
          r.get("edit").onclick = async () => {
            menu.break();
            var v = await Parse.Cloud.run("editMessage", {m: msg.id, t: r.get("message").value, z: config.version}).catch((e) => alertError(e.message));
            var m = document.querySelector("#message-" + msg.id);
            m.querySelector(".content").innerText = v.get("b");
            m.querySelector(".innerTime").innerText = formatTime(new Date(+m.querySelector(".time").time), 1) + " (edited " + formatTime(v.updatedAt, 1) + " ago)";
            m.querySelector(".time").edited = +v.updatedAt;
          };
          r.get("delete").onclick = async () => {
            menu.break();
            var m = document.querySelector("#message-" + msg.id);
            if (await Parse.Cloud.run("deleteMessage", {m: msg.id, z: config.version}).catch((e) => alertError(e.message))) m.parentNode.removeChild(m);
          };
          appendMenu(menu, document.body);
        })(messages.a[i]);
        container.appendChild(z);
      }
      for (var i = o.length - 1; i >= 0; i--) {
        var m = document.querySelector("#message-" + o[i].get("i"));
        if (o[i].get("t") == 1) {
          m.querySelector(".content").innerText = o[i].get("b");
          m.querySelector(".innerTime").innerText = formatTime(new Date(+m.querySelector(".time").time), 1) + " (edited " + formatTime(o[i].updatedAt, 1) + " ago)";
          m.querySelector(".time").edited = +o[i].updatedAt;
        } else if (o[i].get("t") == 2) {
          m.parentNode.removeChild(m);
        }
      }
      if (!append) body.prepend(container);
      else body.appendChild(container);
    };
    y(messages);
    document.querySelector(".previewContainer").scroll(0, document.querySelector(".previewContainer").scrollHeight);

    var lastTime = messages.a.length > 0 ? +messages.a[0].updatedAt : undefined;
    config.interval = setInterval(async () => {
      // get messages
      var messages = await Parse.Cloud.run("getNewMessagesForConversation", {c: id, d: lastTime, z: config.version}).catch((e) => alertError(e.message));
      // update time, read and last seen
      document.querySelectorAll(".time").forEach((t) => t.querySelector(".innerTime").innerText = formatTime(new Date(+t.time), 1) + (t.edited ? " (edited " + formatTime(new Date(+t.edited), 1) + " ago)" : ""));
      document.querySelectorAll(".hasRead.hidden").forEach((r) => {
        if (+r.parentNode.time <= messages.d) r.classList.remove("hidden");
      });
      if (messages.d) d.get("seen").innerText = "last seen " + formatTime(new Date(messages.d), 1) + " ago";
      // add messages
      if (messages.a.length > 0) {
        var s = document.querySelector(".previewContainer").scrollTop + document.querySelector(".previewContainer").clientHeight == document.querySelector(".previewContainer").scrollHeight;
        y(messages, true);
        lastTime = +messages.a[0].updatedAt;
        if (s) document.querySelector(".previewContainer").scroll(0, document.querySelector(".previewContainer").scrollHeight);
      }
    }, 5000);

    // for old messages
    var scrollTime = messages.a.length > 0 ? +messages.a[messages.a.length - 1].createdAt : undefined;
    var wait = false;
    document.querySelector(".previewContainer").onscroll = async () => {
      if (wait) return;
      if (document.querySelector(".previewContainer").scrollTop <= window.innerHeight * 2) {
        wait = true;
        var messages = await Parse.Cloud.run("getOldMessagesForConversation", {c: id, d: scrollTime, z: config.version}).catch((e) => alertError(e.message));
        y({a: messages});
        scrollTime = +messages[messages.length - 1].createdAt;
        wait = false;
      }
    };
    return;
  }
  location.hash = "conversations";
}

// run first time
var pages;
(async function() {
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
    location.href = "https://efur.flexan.cf/login?redirect=chat" + (location.hash != "" ? "@" + encodeURIComponent(encodeURIComponent(location.hash)) : "");
    return;
  }
  
  // check if user is guest
  if (config.isGuest()) {
    alertError("You must have a registered account to send and receive messages. Redirecting...");
    await new Promise(r => setTimeout(r, 5000));
    location.href = "https://efur.flexan.cf/login?redirect=chat" + (location.hash != "" ? "@" + encodeURIComponent(encodeURIComponent(location.hash)) : "");
    return;
  }
  
  // make the hash control the page
  window.onhashchange = (e) => initPage(location.hash != "" ? location.hash.substring(1) : "conversations", true, new URL(e.oldURL).hash != "" && !config.forgetPrevious ? new URL(e.oldURL).hash : "conversations");
  initPage(location.hash != "" ? location.hash.substring(1) : "conversations");
})();