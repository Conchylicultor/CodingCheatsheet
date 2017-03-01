
function readTextFile(filename)
{
    var xmlhttp;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open('GET', filename, false);
    xmlhttp.send();
    return xmlhttp.responseText
}

function readTextFileJquery(filename){
    $.ajax({
        url:filename,
        success: function (data){
            //parse your data here
            //you can split into lines using data.split('\n')
            //an use regex functions to effectively parse it
        }
    });
}

// Hack to read a file on the server
// <script type="text/javascript">
// function LoadFile() {
//     var oFrame = document.getElementById("frmFile");
//     var strRawContents = oFrame.contentWindow.document.body.childNodes[0].innerHTML;
//     while (strRawContents.indexOf("\r") >= 0)
//         strRawContents = strRawContents.replace("\r", "");
//     var arrLines = strRawContents.split("\n");
//     alert("File " + oFrame.src + " has " + arrLines.length + " lines");
//     for (var i = 0; i < arrLines.length; i++) {
//         var curLine = arrLines[i];
//         alert("Line #" + (i + 1) + " is: '" + curLine + "'");
//     }
// }
// </script>
//
// <body>
// <iframe id="frmFile" src="code.txt" onload="LoadFile();" style="display: none;"></iframe>
// </body>


var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml (string) {
    if(string == null || string.length == 0) {
        return "";
    }
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}


class MainSection {
    constructor(name) {
        this.title = name;
        this.subsections = [];
    }
}

class SubSection {
    constructor(name) {
        this.title = name;
        this.columns = {};
    }
}


$(document).ready(function(){
    var mainSections = []
    var currentSub = null;
    var currentLanguage = '';
    var currentText = [];

    flushText = function() {
        if(currentText.length > 0)
        {
            currentSub.columns[currentLanguage] = currentText.join('\n');  // Flush the current text
            currentText = [];  // Reset
        }
    }

    //readTextFile("code.txt");
    var textToParse = readTextFile("http://e-pot.xyz/CodingCheatsheet/code.txt");
    var lines = textToParse.split('\n');
    for(var i = 0; i < lines.length; i++) {
        var line = lines[i]
        if(line.startsWith('=============')) {  // Skip section
        }
        else if(line.startsWith('========= ')) {  // Main section
            flushText();
            line = line.replace(/^[\s=#]+/, "");
            mainSections.push(new MainSection(line));  // Creation of new section
        }
        else if(line.startsWith('====== ')) {  // Sub-section
            flushText();
            line = line.replace(/^[\s=#]+/, "");
            currentSub = new SubSection(line)
            mainSections[mainSections.length - 1].subsections.push(currentSub);
        }
        else if(line.startsWith('=== ')) {  // Language
            flushText();
            line = line.replace(/^[\s=#]+/, "");
            currentLanguage = line;
        }
        else {
            currentText.push(line);
        }
    }
    flushText();

    var columnOrder = ["cpp", "java", "python"];
    var columnTitles = {
        "cpp":"C++",
        "java":"Java",
        "python":"Python"
    };

    var columnTitles = {
        "cpp":"C++",
        "java":"Java",
        "python":"Python"
    };
    var content = [];
    var summary_content = [];

    // TODO: Add a table of content (would be great to have that as a lateral menu)

    // TODO: Add option to dynamically select the columns

    const anchorPrefix = "sect_";

    summary_content.push("<ul>");

    for(var i = 0; i < mainSections.length; i++)
    {
        var currentMain = mainSections[i];
        var anchor = anchorPrefix + i.toString();

        summary_content.push("<li><a href=\"#" + anchor + "\">" + currentMain.title + "</a></li>");
        summary_content.push("<ul>");

        content.push("<h2 id=\"" + anchor + "\">" + currentMain.title + "</h2>");
        content.push("<table class=\"table_language\">");
        content.push("<tr class=\"mainsection_language\"><td><h3>C++</h3></td> <td><h3>Java</h3></td> <td><h3>Python</h3></td></tr>");  // TODO: Loop over the columnTitles

        for(var j = 0; j < currentMain.subsections.length; j++)
        {
            currentSub = currentMain.subsections[j];
            anchor = anchorPrefix + i.toString() + "_" + j.toString();

            summary_content.push("<li><a href=\"#" + anchor + "\">" + currentSub.title + "</a></li>");

            content.push("<tr><td colspan=\"3\"class=\"subsection_language\" ><h4  id=\"" + anchor + "\">" + currentSub.title + "</h4></td></tr>");
            content.push("<tr>");

            for(var k = 0; k < columnOrder.length; k++)
            {
                content.push("<td class=\"cell_language\"><pre><code class=\"" + columnOrder[k] + "\">");
                content.push(escapeHtml(currentSub.columns[columnOrder[k]]));  // TODO: Escape characteres
                content.push("</code></pre></td>");
            }
            content.push("</tr>");
        }
        summary_content.push("</ul>");

        content.push("</table>");
    }

    summary_content.push("</ul>");

    $("nav").append(summary_content.join('\n'))
    $("#coding_table").append(content.join('\n'))
    $('pre code').each(function(i, block) {  // Update the code highlighting
        hljs.highlightBlock(block);
    });
});
