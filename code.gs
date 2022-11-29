

function getRelevantMessages()
{
  var threads = GmailApp.search("from:axisbank.com AND subject:Transaction alert",0,100);
  var messages=[];
  threads.forEach(function(thread)
                  {
                    messages.push(thread.getMessages()[0]);
                  });
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
    
    var matches = text.match(/(?:Card no.)\s+([\w\s]+)\s+(?:for INR)\s+([\d\,\.]+)\s+(?:at)\s+([\w\s]+)\s+(?:on)\s+([\d\S]+)\./);
   
    if(!matches || matches.length < 5)
    {
      //No matches; couldn't parse continue with the next message
      continue;
    }
    var rec = {};
    rec.amount = matches[2];
    rec.card = matches[1];
    rec.date= matches[4];
    rec.merchant = matches[3];
    
    //cleanup data
    rec.amount = parseFloat(rec.amount.replace(/,/g, ''));
    
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
  var spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1ql-S5TjH5KoekRvRqiwuyequyxhgas/edit#gid=0");
  var sheet = spreadsheet.getSheetByName("Sheet1");
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
  //return getParsedDataDisplay();

  return getMessagesDisplay();
}
