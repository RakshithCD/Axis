function getRelevantMessages()
{
  var threads = GmailApp.search("in:inbox AND from:axisbank.com AND subject:Transaction alert",0,100);
  var arrToConvert=[];
  for(var i = threads.length - 1; i >=0; i--) {
    arrToConvert.push(threads[i].getMessages());   
  }
  var messages = [];
  for(var i = 0; i < arrToConvert.length; i++) {
    messages = messages.concat(arrToConvert[i]);
  }
  return messages;
}

function parseMessageData(messages)
{
  var records=[];
  if(!messages)
  {
    //messages is undefined or null or just empty
    return records;
  }
  for(var m=0;m<messages.length;m++)
  {
    var text = messages[m].getPlainBody();

    //var matches = text.match(/(?:Card no.)\s+([\w\s]+)\s+(?:for INR)\s+([\d\,\.]+)\s+(?:at)\s+([\w\s]+)\s+(?:on)\s+([\d\S]+)\./);

    var matches = text.match(/Card no.\s(XX\d+)\sfor\sINR\s(\d+(.\d+))?\sat\s([^\son]+)\son\s(\d+-\d+-\d+\s\d+:\d+:\d+)/);
    //var matches = text.match(/Card no.\s(XX\d+)\bfor\sINR\s*\d+.\d+\bat\s([^\son]+)\son\s(\d+-\d+-\d+\s\d+:\d+:\d+)/);
    
    if(!matches || matches.length < 4)
    {
      //No matches; couldn't parse continue with the next message
      continue;
    }
    var rec = {};
    rec.amount = matches[2];
    rec.card = matches[1];
    rec.date= matches[5];
    rec.merchant = matches[4];
    
    //cleanup data
    //rec.amount = parseFloat(rec.amount.replace(/,/g, ''));
    
    records.push(rec);
  }
  return records;
}

function getMessagesDisplay()
{
  var templ = HtmlService.createTemplateFromFile('messages');
  templ.messages = getRelevantMessages();
  return templ.evaluate();  
}

function getParsedDataDisplay()
{
  var templ = HtmlService.createTemplateFromFile('parsed');
  templ.records = parseMessageData(getRelevantMessages());
  return templ.evaluate();
}

/*
function saveDataToSheet(records)
{
  var spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/10SeQE3kHPoytlQQbzSXD3xLlAu1UggngkfEkG9E/edit#gid=1439879152");
  var sheet = spreadsheet.getSheetByName("Axis");
  for(var r=0;r<records.length;r++)
  {
    sheet.appendRow([records[r].date,records[r].card, records[r].merchant, records[r].amount ] );
  }
  
}

function processTransactionEmails()
{
  var messages = getRelevantMessages();
  var records = parseMessageData(messages);
  saveDataToSheet(records);
  labelMessagesAsDone(messages);
  return true;
}

function labelMessagesAsDone(messages)
{
  var label = 'payment_processing_done';
  var label_obj = GmailApp.getUserLabelByName(label);
  if(!label_obj)
  {
    label_obj = GmailApp.createLabel(label);
  }
  
  for(var m =0; m < messages.length; m++ )
  {
     label_obj.addToThread(messages[m].getThread() );  
  }
  
}

*/

function doGet()
{
  return getParsedDataDisplay();

  //return getMessagesDisplay();
}
