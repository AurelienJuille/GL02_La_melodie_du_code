const fs = require('fs');
const program = require("@caporal/core").default;
const colors = require('colors');

const path = require('path');
const directoryPath = path.join('data');

const mainModule = require('./main.js');

program
    .command('search', 'afficher une ou des questions spécifiques, en fonction de son nom ou de critères de recherche')
    .argument('[name...]', 'nom du ou des fichiers')
    .option('-n, --word <word>', 'le nom du fichier contient "word"')
    .option('-c, --expression <expresssion>', 'le fichier que l on veut afficher contient "expression"')
    .option('-t, --type <type...>', 'le fichier contient des questions du type ')
    .action(({args, options, logger}) =>{
        
        if(args.name){
            for(i = 0; i < args.name.length; i++){  //pour chaque fichier dont le nom a été donné, va le lire, l'afficher et puis le transformer en une suite de questions
                filename = args.name[i] 
                filePath = path.join('data',filename)
                fs.readFile(filePath, 'utf-8', function(err, content){
                    if (err) {
                        return console.log('Unable to scan file '+file+': '+err+'\n');
                    }
                    console.log('\n\nname of the file:'.red ,filename.red,'\n\n')
                    console.log(content + '\n\n\n');

                    mainModule.toQuestion(filePath, (err, parsedQuestions) => {   //transforme le fichier ouvert en une suite de questions
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(parsedQuestions);
                        }
                    });
                })
            }
            
        }

        fs.readdir(directoryPath, function (err, files) {

            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }

            //for each file, comparing question type with the options
            files.forEach(function(file){

                if(options.n && file.includes(options.n)){

                    console.log(`File with name containing "${options.n}": ${file}`.red);
                    filePath = path.join('data', file);
                    fs.readFile(filePath, 'utf-8', function(err, content) {
                        // afficher les erreurs
                        if (err) {
                          return console.log('Unable to scan file '+file+': '+err+'\n');
                        }
                        console.log(content + '\n'); 
                    })
                }  
                
                if(options.c){

                    filePath = path.join('data', file);
                    fs.readFile(filePath, 'utf-8', function(err,content){
                        if (err) {

                            return console.log('Unable to scan file '+file+': '+err+'\n');
                        } else if(content.includes(options.c)){

                            console.log(`File containing the expression "${options.c}": ${file}`);
                        }
                    })
                }
            })
        })

    })
program.run(process.argv.slice(2));