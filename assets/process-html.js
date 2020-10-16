var { exec } = require('child_process');
var path = require("path");

var glob = require("glob");

glob("./assets/templates/*.html", '', function (er, files) {
    files.forEach(function(file, index){
    exec('npm run html-processor ' + file + ' -- --output ./dev/'+path.basename(file)+' -e dev', (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err)
          
        } else {
         // the *entire* stdout and stderr (buffered)
         console.log(`${stdout}`);
         console.log(`${stderr}`);
         return;
        }
      });  
   });
});


