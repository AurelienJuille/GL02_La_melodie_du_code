// Ce programme couvre les fonctionnalités 2 et 4 du cahier des charges


// Importation des différentes features extérieures
// nécessaires au fonctionnement du programme.

// fs sert à lire les dossiers et fichiers.
// C'est une fonction asynchrone donc pour être sûr
// que le programme attend bien sa réalisation,
// fs est liée à une promesse.
const fs = require('fs').promises;

// inquirer permet de faire une 'interface' de choix.
const inquirer = require('inquirer');

// le path est nécessaire pour lire les fichiers.
const path = require('path');
// la base de données est dans le dossier data.
const directoryPath = path.join('data');

// le GiftParser est nécessaire pour transformer le fichier
// en différents objets question.
const GiftParser = require('./GiftParser.js');

// On utilise caporal pour créer une commande
const programme = require('@caporal/core').default;

// La variabe questionnaireFini est globale pour pouvoir être
// modifiée depuis plusieurs fonctions.
let questionnaireFini;



/*
Description : La commande créerQuestionnaire permet à l'utilisateur de créer
un questionnaire conforme aux règles imposées par la specification 4.
Entrée : ne prend rien en entrée.
Fonctionnement : expliqué en détail dans la commande.
Sortie : ne retourne rien.
*/
programme
  .command('créerQuestionnaire', 'Afficher les différents fichiers disponibles contenant des questions')
  .action(async function () {
    // Déclaration des variables qui seront utilisées dans la boucle.
    let questionnaire = [];
    questionnaireFini = false;
    let question;
    let reponse = '';
    let questionARetirer;
    // Boucle while qui se termine quand l'utilisateur considère
    // qu'il a terminé de sélectionner les questions.
    while (questionnaireFini == false) {
      // Selection d'une question
      question = await selectQuestion();
      // Si l'utilisateur n'a pas terminé...
      if (questionnaireFini == false) {
        // ...on vérifie que la question ne soit pas déjà dans le questionnaire.
        if (questionnaire.find(x => x.title == question.title)) {
          // Si oui, on demande à l'utilisateur s'il veut la retirer.
          console.log('\n\n------------------------------'.cyan);
          console.log(`Cette question fait déjà partie de votre questionnaire.`.brightCyan);
          console.log(`C'est la question n° ${questionnaire.findIndex(x => x.title == question.title)+1}`.brightCyan);
          console.log('Souhaitez-vois la retirer ?'.brightCyan);
          console.log('------------------------------\n\n'.cyan);
          reponse = await ouiNon();
          if (reponse == 'Oui') {
            questionnaire.splice(questionnaire.findIndex(x => x.title == question.title),1);
            console.log('\n\n------------------------------'.cyan);
            console.log(`Vous avez retiré cette question au questionnaire. Le questionnaire a ${questionnaire.length} question(s).`.brightCyan);
            console.log('------------------------------\n\n'.cyan);
          }
        } else {
          // Sinon, on lui demande si il veut ajouter la question.
          console.log(question);
          console.log('\n\n------------------------------'.cyan);
          console.log('Souhaitez-vous ajouter cette question ?'.brightCyan);
          console.log('------------------------------\n\n'.cyan);
          reponse = await ouiNon();
          // Si l'utilisateur veut ajouter la question...
          if (reponse == 'Oui') {
            // ... on l'ajoute au questionnaire.
            questionnaire.push(question);
            console.log('\n\n------------------------------'.cyan);
            console.log(`Vous avez ajouté cette question au questionnaire. Le questionnaire a ${questionnaire.length} question(s).`.brightCyan);
            console.log('------------------------------\n\n'.cyan);
          } else {
            console.log('\n\n------------------------------'.cyan);
            console.log(`Vous n'avez pas ajouté cette question au questionnaire. Le questionnaire a ${questionnaire.length} question(s).`.brightCyan);
            console.log('------------------------------\n\n'.cyan);
          }
        }
      }
      if (questionnaireFini == true) {
        // Si on essaye de terminer le questionnaire alors qu'il est trop court
        // alors le programme empêche la sortie de la boucle
        // et demande de sélectionner plus de questions.
        if (questionnaire.length < 15) {
          console.log('\n\n------------------------------'.cyan);
          console.log (`Votre questionnaire est trop court (${questionnaire.length} questions). Veuillez en sélectionner plus pour en avoir au moins 15.`.brightYellow);
          console.log('------------------------------\n\n'.cyan);
          questionnaireFini = false;
        }
        // Si on essaye de terminer le questionnaire alors qu'il est trop long
        // alors le programme demande d'enlever assez de questions
        // avant de sortir de la boucle.
        while (questionnaire.length > 20) {
          console.log('\n\n------------------------------'.cyan);
          console.log ('Votre questionnaire est trop long. Veillez retirer une question.'.brightYellow);
          console.log('------------------------------\n\n'.cyan);
          // Affichage d'une liste avec tous les titres des questions choisies
          // L'utilisateur choisit une par une les questions à retirer
          // jusqu'à ce qu'il en reste 20.
          questionARetirer = await retirerQuestion (questionnaire);
          questionnaire.splice(questionnaire.findIndex(x => x.text == questionARetirer),1)
        }
        // Avant de sortir définitivement de la boucle,
        // on affiche le questionnaire pour une dernière vérification.
        console.log('------------------------------'.cyan);
        console.log('Voici votre questionnaire'.brightCyan);
        console.log('------------------------------'.cyan);
        console.log(questionnaire);
        console.log('\n\n------------------------------'.cyan);
        console.log ('Voulez-vous modifier ce questionnaire ?'.brightYellow);
        console.log('------------------------------\n\n'.cyan);
        reponse = await ouiNon();
        if (reponse == 'Oui') {
          questionnaireFini = false;
        }
      }
    }
    // Une fois que le questionnaire est fini, on l'affiche.
    console.log('------------------------------'.cyan);
    console.log('Voici votre questionnaire'.brightCyan);
    console.log('------------------------------'.cyan);
    console.log(questionnaire);
  });


/*
Description : selectQuestion sert à permettre à l'utilisateur de sélectionner
une question dans la base de données.
Entrée : ne prend rien en entrée
Fonctionnement : ouvre le dossier data dans le répertoire du projet,
y lit les différents fichiers, propose à l'utilisateur de sélectionner
le fichier à ouvrir, ouvre le fichier sélectionné, y lit les différentes
questions grâce au parseur, les propose à l'utilisateur pour sélection.
Sortie : retourne la question choisie par l'utilisateur sous la forme
d'un objet
*/
async function selectQuestion() {
  // Gestion des erreurs en mettant toute la fonction dans un 'try'
  try {
    // Lecture des noms de tous les fichiers de la base de données
    let listeFichiers = await fs.readdir(directoryPath);
    // Affichage de tous les noms de fichiers
    // On demande à l'utilisateur lequel ouvrir pour avoir accès aux questions
    let fichierChoisi = await choixFichier(listeFichiers);

    if (fichierChoisi == 'Terminer') {
      // Si l'utilisateur a choisi l'option 'Terminer' alors
      // on essaye de sortir de la boucle dans la commande.
      questionnaireFini = true;
    } else {
      // Sinon, on ouvre le fichier sélectionné
      // et on laisse le choix à l'utilisateur de la question à selectionner.
      let filePath = path.join(directoryPath, fichierChoisi.toString());
      let contenuDuFichier = await fs.readFile(filePath, 'utf-8');
      let questionsDuFichier = await giftToQuestion(contenuDuFichier);

      // On récupère la question choisie dans la liste des questions du dossier
      // et on la renvoie à la commande principale.
      let questionChoisie = await choixQuestion(questionsDuFichier);
      return questionsDuFichier[questionsDuFichier.findIndex(x => x.title == questionChoisie)];
    }
  // suite du 'try', affichage si il y a une erreur,
  // et la fonction ne retourne rien
  } catch (err) {
    console.error(err);
  }

}


/*
Description : choixFichier utilise un inquirer pour permettre à l'utilisateur
de faire un choix parmi les fichiers de la base de données.
Entrée : prend la liste des fichiers en entrée
Fonctionnement : ajoute 'Terminer' dans la liste pour en faire une option qui
permettra à l'utilisateur de terminer sa sélection, puis appelle l'inquirer
pour laisser l'utilisateur faire son choix.
Sortie : retourne la sélection, donc soit un nom de fichier soit 'Terminer'.
*/
async function choixFichier(choix) {
    if (choix[choix.length-1] != 'Terminer') {choix.push('Terminer');}
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedTypes',
            message: 'Choisissez le fichier que vous voulez ouvrir',
            choices: choix,
        },
    ]);

    return answers.selectedTypes;
}

/*
Description : choixQuestion utilise un inquirer pour permettre
à l'utilisateur de faire un choix parmi les questions du fichier
ouvert dans la fonction principale.
Entrée : prend la liste des questions en entrée
Fonctionnement : transforme la liste d'objet en une liste de strings
contenant le nom de chaque question, puis appelle l'inquirer
pour laisser l'utilisateur faire son choix.
Sortie : retourne la sélection, donc le nom d'une question.
*/
async function choixQuestion(questions) {
  let choix = [];
  questions.forEach((i) => choix.push(i.title));
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTypes',
      message: 'Choisissez la question que vous voulez visionner :',
      choices: choix,
    },
  ]);

  return answers.selectedTypes;
}

/*
Description : ouiNon permet à l'utilisateur de répondre à une question
par 'Oui' ou 'Non'.
Entrée : ne prend rien en entrée
Fonctionnement : appelle l'inquirer pour laisser l'utilisateur faire son choix.
Sortie : retourne la sélection, donc 'Oui' ou 'Non'.
*/
async function ouiNon() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedTypes',
            message: ' ',
            choices: ['Oui','Non'],
        },
    ]);
    return answers.selectedTypes;
}

/*
Description : retirerQuestion utilise un inquirer pour permettre à
l'utilisateur de faire un choix parmi une liste de question afin de la retirer.
Entrée : prend une liste des questions en entrée
Fonctionnement : transforme la liste d'objet en une liste de strings
contenant le nom de chaque question, puis appelle l'inquirer
pour laisser l'utilisateur faire son choix.
Sortie : retourne la sélection, donc le nom d'une question.
*/
async function retirerQuestion(questions) {
  let choix = [];
  questions.forEach((i) => choix.push(i.title));
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedTypes',
            message: 'Quelle question voulez-vous retirer ?',
            choices: choix,
        },
    ]);
    return answers.selectedTypes;
}

/*
Description : giftToQuestion permet au programme d'appeler le GiftParser
afin de transformer un texte en format GIFT en objets, chacun correspondant
à une question.
Entrée : prend du texte en entrée.
Fonctionnement : transforme la liste d'objet en une liste de strings
contenant le nom de chaque question, puis appelle l'inquirer
pour laisser l'utilisateur faire son choix.
Sortie : retourne une liste d'objets.
*/
async function giftToQuestion(data) {
  const analyzer = new GiftParser();
  analyzer.parse(data);
  return analyzer.parsedQuestions;
}


programme.run(process.argv.slice(2));