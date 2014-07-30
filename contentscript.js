


function uploadResponse(target, response)
{
    if (response == "success")
    {
        logourl = chrome.extension.getURL("logo_16_success.png");
        target.src = logourl;
    }
    else if  (response == "failure")
    {
        logourl = chrome.extension.getURL("logo_16_failure.png");
        target.src = logourl;
    }
    else
    {
        logourl = chrome.extension.getURL("logo_16.png");
        target.src = logourl;
    }
}

function sendURL(e)
{
    l = e.target.parentElement.previousElementSibling;
    url = l.href;

    logourl = chrome.extension.getURL("logo_16_pending.png");
    e.target.src = logourl;
    
    if (getURLType(url) != "torrent")
    {
        console.log("Sending URL: " + url);
        chrome.runtime.sendMessage({type: "uploadURL", value: url, torrent: undefined}, uploadResponse.bind(undefined, e.target));
    }
    else 
    {
        // Need to get the torrent file in this context in the contentscript, will probably fail otherwise
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = 'blob';
        http.onreadystatechange = function() 
        {
            if(http.readyState == 4) 
            {
                if (http.status != 200)
                {
                    alert("Downloading torrent failed: " + http.status + "!");
                }
                else
                {
                    var reader = new window.FileReader();
                    reader.onloadend = function() 
                    {
                        chrome.runtime.sendMessage({type: "uploadURL", value: url, torrent: reader.result}, 
                                                   uploadResponse.bind(undefined, e.target));
                    };                
                    reader.readAsDataURL(http.response);                                         
               }
            };
         };

        http.send();
     }
}


var add_buttons = true;

function do_add_buttons()
{
    var links = document.getElementsByTagName('a');

    for(var i=0; i<links.length; i++) 
    {
        l = links[i];
        url = l.href;

        if (getURLType(url) != "No")
        {
            var jsl = document.createElement("span");
            jsl.setAttribute("class", "jsit");
            logourl = chrome.extension.getURL("logo_16.png");
            jsl.innerHTML = "<img src='" + logourl + "' title='Upload to JSIT'/>";

            l.parentNode.insertBefore(jsl, l.nextSibling);

            jsl.addEventListener("click", sendURL, false);
        }
    }
}

chrome.runtime.sendMessage({type: "getAddButtons"}, function(response) 
{
    add_buttons = response.addbuttons;

    if (add_buttons)
    {
        do_add_buttons();
    }
});
    

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log(sender.tab ?
    //            "from a content script:" + sender.tab.url :
    //            "from the extension");
    if (request.type == "readdButtons")
    {
        do_add_buttons();
    }
});