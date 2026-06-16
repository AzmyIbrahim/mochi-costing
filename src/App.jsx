function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName("Bahan Mentah");
  
  const ids = ["marshmallow","butter","kunafa","whiteChoc","susuTepung",
               "cocoaPowder","pistachioSpread","hazelnutSpread",
               "strawberryEmulco","strawberryPowder","matchaPowder"];
  
  const bahan = [];
  for (let i = 0; i < 11; i++) {
    const row = 5 + i;
    bahan.push({
      id:    ids[i],
      nama:  ws.getRange(row, 2).getValue(),
      berat: ws.getRange(row, 3).getValue(),
      harga: ws.getRange(row, 4).getValue(),
    });
  }

  const pkg = {
    single: ws.getRange(20, 4).getValue(),
    double: ws.getRange(21, 4).getValue(),
    quad:   ws.getRange(22, 4).getValue(),
    parcel: ws.getRange(23, 4).getValue(),
  };

  const result = { bahan, pkg };
  const callback = e.parameter.callback;

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(result)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
