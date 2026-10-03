/* Mailroom | dependency-free browser interactions | MIT License */ "use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector)
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
}
[
  char
]));
const toast = message =>{
   const node = $(".toast");
   if (!node) return;
   node.textContent = message;
   node.classList.add("is-visible");
   clearTimeout(window.toastTimer);
   window.toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2600);
};
const downloadText = (filename, text, type = "text/plain;charset=utf-8") =>{
   const url = URL.createObjectURL(new Blob([
    text
  ],{
    type
  }));
   const link = document.createElement("a");
   link.href = url;
   link.download = filename;
   link.click();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const copyText = async text =>{
   try{
     await navigator.clipboard.writeText(text);
     return true;
  }
   catch{
     const field = document.createElement("textarea");
     field.value = text;
     field.style.position = "fixed";
     field.style.opacity = "0";
     document.body.append(field);
     field.select();
     const ok = document.execCommand("copy");
     field.remove();
     return ok;
  }
};
const readFileText = file => new Promise((resolve, reject) =>{
   const reader = new FileReader();
   reader.onload = () => resolve(String(reader.result));
   reader.onerror = () => reject(new Error("Could not read this file."));
   reader.readAsText(file);
});
const parseCSV = text =>{
   const rows = [
  ];
   let row = [
  ], cell = "", quoted = false;
   for (let i = 0; i < text.length; i++){
     const c = text[
      i
    ];
     if (quoted){
       if (c === '"' && text[
        i + 1
      ]
       === '"'){
         cell += '"';
         i++;
      }
       else if (c === '"') quoted = false;
       else cell += c;
    }
     else if (c === '"') quoted = true;
     else if (c === ","){
       row.push(cell);
       cell = "";
    }
     else if (c === "\n"){
       row.push(cell.replace(/\r$/, ""));
       if (row.some(value => value.trim())) rows.push(row);
       row = [
      ];
       cell = "";
    }
     else cell += c;
  }
   row.push(cell.replace(/\r$/, ""));
   if (row.some(value => value.trim())) rows.push(row);
   return rows;
};
const saveJSON = (key, value) =>{
   try{
     localStorage.setItem(key, JSON.stringify(value));
     return true;
  }
   catch{
     return false;
  }
};
const loadJSON = (key, fallback) =>{
   try{
     return JSON.parse(localStorage.getItem(key)) ?? fallback;
  }
   catch{
     return fallback;
  }
};
const menuButton = $(".menu-toggle"), nav = $("#main-navigation");
menuButton?.addEventListener("click", () =>{
   const opened = nav.classList.toggle("is-open");
   menuButton.setAttribute("aria-expanded", String(opened));
   menuButton.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
});
nav?.addEventListener("click", event =>{
   if (event.target.closest("a")){
     nav.classList.remove("is-open");
     menuButton?.setAttribute("aria-expanded", "false");
  }
});
$$('[data-toast]').forEach(button => button.addEventListener("click", () => toast(button.dataset.toast)));
$$('[data-scroll]').forEach(button => button.addEventListener("click", () => $(button.dataset.scroll)?.scrollIntoView({
  behavior:"smooth"
})));
let emailRows=[
];
const renderEmail=()=>{
  const total=emailRows.reduce((sum,x)=>sum+x.sent,0),opens=emailRows.reduce((sum,x)=>sum+x.opens,0),clicks=emailRows.reduce((sum,x)=>sum+x.clicks,0),conversions=emailRows.reduce((sum,x)=>sum+x.conversions,0),money=emailRows.reduce((sum,x)=>sum+x.revenue,0),rate=(n,d)=>d?(n/d*100).toFixed(1)+"%":"0.0%";
  $("#email-kpis").innerHTML=[
    [
      'Delivered',
      total.toLocaleString(),
      "campaign emails"
    ],
    [
      'Open rate',
      rate(opens,
      total),
      opens.toLocaleString()+" recorded opens"
    ],
    [
      'Click rate',
      rate(clicks,
      total),
      clicks.toLocaleString()+" recorded clicks"
    ],
    [
      'Conversion rate',
      rate(conversions,
      total),
      conversions.toLocaleString()+" conversions"
    ]
  ].map(item=>'<article class="metric-card"><span>'+item[
    0
  ]
  +'</span><strong>'+item[
    1
  ]
  +'</strong><small>'+item[
    2
  ]
  +'</small></article>').join("");
  $("#email-table").innerHTML=emailRows.length?emailRows.map(x=>'<tr><td>'+escapeHTML(x.campaign)+'</td><td>'+x.sent.toLocaleString()+'</td><td>'+rate(x.opens,x.sent)+'</td><td>'+rate(x.clicks,x.sent)+'</td><td>'+rate(x.conversions,x.sent)+'</td><td>$'+x.revenue.toFixed(2)+'</td></tr>').join(""):'<tr><td colspan="6" class="empty-cell">Load sample data or choose a CSV.</td></tr>';
  $("#email-status").textContent=emailRows.length?emailRows.length+" campaigns analyzed locally. Total revenue: $"+money.toFixed(2)+".":"No file is uploaded to a server.";
};
const importEmail=text=>{
  const rows=parseCSV(text);
  if(rows.length<2)throw new Error("CSV needs a header row and at least one campaign.");
  const headers=rows[
    0
  ].map(value=>value.trim().toLowerCase()),index=key=>headers.indexOf(key),required=[
    "campaign",
    "sent",
    "opens",
    "clicks",
    "conversions",
    "revenue"
  ];
  if(required.some(key=>index(key)<0))throw new Error("Required headers: "+required.join(", "));
  emailRows=rows.slice(1).map(row=>({
    campaign:row[
      index("campaign")
    ],
    sent:Number(row[
      index("sent")
    ]),
    opens:Number(row[
      index("opens")
    ]),
    clicks:Number(row[
      index("clicks")
    ]),
    conversions:Number(row[
      index("conversions")
    ]),
    revenue:Number(row[
      index("revenue")
    ])
  })).filter(x=>x.campaign&&Object.values(x).slice(1).every(Number.isFinite)&&x.sent>=0);
  if(!emailRows.length)throw new Error("No valid campaign rows found.");
  renderEmail();
};
$("#load-email-sample")?.addEventListener("click",()=>{
  emailRows=[
{
      campaign:"Welcome series",
      sent:4800,
      opens:2540,
      clicks:642,
      conversions:118,
      revenue:4720
    },
{
      campaign:"Field notes · 04",
      sent:6200,
      opens:2980,
      clicks:715,
      conversions:93,
      revenue:3255
    },
{
      campaign:"Autumn launch",
      sent:8100,
      opens:4610,
      clicks:1108,
      conversions:204,
      revenue:9180
    }
  ];
  renderEmail();
});
$("#email-csv")?.addEventListener("change",async event=>{
  try{
    importEmail(await readFileText(event.target.files[
      0
    ]));
  }
  catch(error){
    $("#email-status").textContent=error.message;
  }
});
$("#download-email-report")?.addEventListener("click",()=>{
  if(!emailRows.length){
    toast("Load or import campaign data first.");
    return;
  }
  downloadText("mailroom-report.csv","campaign,sent,open_rate,click_rate,conversion_rate,revenue\n"+emailRows.map(x=>[
    x.campaign,
    x.sent,
    (x.opens/x.sent*100).toFixed(2)+"%",
    (x.clicks/x.sent*100).toFixed(2)+"%",
    (x.conversions/x.sent*100).toFixed(2)+"%",
    x.revenue.toFixed(2)
  ].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n"),"text/csv;charset=utf-8");
});
