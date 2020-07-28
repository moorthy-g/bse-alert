const storedKeywords = window.localStorage.getItem("keywords");
//outcome,press,result,report,monthly,sales,acquisition,order

const config = {
  frequency: 60000,
  lastNewsTime: 0,
  date: new Date().toISOString().substr(0, 10).replace(/-/g, ""),
  keywords: storedKeywords ? storedKeywords.split(",") : [],
  disabled: true,
};

const getNewsTime = (news) => {
  return news.DT_TM.substr(11, 8).replace(/:/g, "");
};

const fetchAlerts = async () => {
  try {
    const res = await fetch(
      `https://api.bseindia.com/BseIndiaAPI/api/AnnGetData/w?strCat=-1&strPrevDate=${config.date}&strScrip=&strSearch=P&strToDate=${config.date}&strType=C`
    );
    const json = await res.json();
    const data = json.Table;
    if (config.lastNewsTime === 0) {
      config.lastNewsTime = getNewsTime(data[0]);
    }

    const newData = [];
    for (let i = 0; i < data.length; i++) {
      const newsTime = getNewsTime(data[i]);
      if (config.lastNewsTime >= newsTime) break;
      else newData.push(data[i]);
    }
    config.lastNewsTime = getNewsTime(data[0]);
    announce(newData);
  } catch (err) {}

  !config.disabled && setTimeout(fetchAlerts, config.frequency);
};

const announce = (data) => {
  data.forEach((item) => {
    if (
      config.keywords.length === 0 ||
      config.keywords.find((keyword) =>
        item.NEWSSUB.toLowerCase().includes(keyword)
      )
    ) {
      console.log(
        `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${item.ATTACHMENTNAME}`
      );
      sendNotification({
        title: `${item.SLONGNAME}`,
        message: `${item.NEWSSUB}`,
        clickCallback: function () {
          window.open(
            `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${item.ATTACHMENTNAME}`
          );
        },
      });
    }
  });
};

const init = () => {
  const btn = document.getElementById("btn");
  const form = document.getElementById("form");
  const keywordsInput = document.getElementById("keywords");
  btn.addEventListener("click", () => {
    config.disabled = !config.disabled;
    btn.innerText = config.disabled
      ? "Start Notifications"
      : "Stop Notifications";
    !config.disabled && fetchAlerts();
  });
  btn.click();

  if (storedKeywords) keywordsInput.value = storedKeywords;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const keywords = document.getElementById("keywords").value;
    window.localStorage.setItem("keywords", keywords);
    window.location.reload();
  });
};
init();

function sendNotification(data) {
  if (data == undefined || !data) {
    return false;
  }
  var title = data.title === undefined ? "Notification" : data.title;
  var clickCallback = data.clickCallback;
  var message = data.message === undefined ? "null" : data.message;
  var icon =
    data.icon === undefined
      ? "https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png"
      : data.icon;
  var sendNotification = function () {
    var notification = new Notification(title, {
      icon: icon,
      body: message,
    });
    if (clickCallback !== undefined) {
      notification.onclick = function () {
        clickCallback();
        notification.close();
      };
    }
  };

  if (!window.Notification) {
    return false;
  } else {
    if (Notification.permission === "default") {
      Notification.requestPermission(function (p) {
        if (p !== "denied") {
          sendNotification();
        }
      });
    } else {
      sendNotification();
    }
  }
}

// Request notification permission
Notification.requestPermission(function (p) {});
