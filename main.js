const fs = require('fs');
const colors = require('colors');
const GiftParser = require('./GiftParser.js')

const vg = require('vega');
const vegalite = require('vega-lite');

const program = require("@caporal/core").default;

/* 
Lien vers le tuto caporal => https://caporal.io/guide/
Lien vers doc format GIFT => https://docs.moodle.org/403/en/GIFT_format

Rappel des SPECS : 
SPECF1 (Marian) : L'enseignant recherche et visualise une question à partir de la banque
SPECF2 (Ambrine) : L'enseignant sélectionne plusieurs questions en respectant les règles données (SPECF4)
SPECF3 (Aurélien) : L'enseignant créé un fichier d'examen GIFT à partir des questions sélecionnées (SPECF2)
SPECF4 (Ambrine) : Vérifier qu'un ensemble de questions respecte la qualité des données soit, l'ensemble comporte entre 15 et 20 questions toutes uniques
SPECF5 (Marian) : Créer le fichier d'identification et de contact VCARD d'un enseignant aux normes RDC 6350 et 6868
SPECF6 (Aurélien) : Simulation d'un examen sélectionné en entrant manuellement les réponses et en fournissant une fiche de résultats
SPECF7 (Thibault) : Etablir le profil d'un examen montrant un histogramme des différents types de questions
SPECF8 (Thibault) : Comparer le profil d'un examen (SPECF7) avec le profil d'un ou plusieurs autres examens.
*/

program
    .command('hello', 'says hello')
    .action(({logger}) => {
        logger.info("Hello World!".green)
    })

program.run(process.argv.slice(2));