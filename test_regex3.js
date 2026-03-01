const text1 = "He recibido la de v. m. de 28 del pasado. El Sr. don Juan ha sido hoy de purga y le ha ido muy bien con ella: se le conoce está muy mejorado. Los médicos están atentos y le han desengañado que si no lleva la regla que le dejaron así en el beber como en lo demás que perecerá, con que va en él. El Sr. don Pedro está bueno, hasta ahora poco se ha andado; en esta semana se comenzará, de lo que fuere sucediendo avisaré. La carta dará v. m. al Sr. don Juan Miguel Sureda y entregará a v. m. 122 reales de plata, que con los 153 que ha entregado, son de modo que con los 66 reales del [?] están rematados los 327 reales de plata que tenía en mi poder de v. m. Recibidos de estas partes, v. m. me lo avise si esta satisfecho para que yo lo advierta en mi libro. Ya habrá recibido por Barcelona del Sr. nuncio para el [?] el mensaje de Juan Bautista para lo del cabo de artillero he dado en el consejo de guerra que va para allí [?] [1§] Aunque el Sr. don Pedro ha recibido una letra por Alicante, no por esa deje de pagar mi Sra. Dña. Leonor la letra para la Inquisición de 2813 reales de plata. Por ahora no hay de nuevo: el príncipe de Pomblin dícese se casa con la hija del marques de [?] Villoson [?] que está dama de la reina. No faltaron novedades; v. m. me mande le sirva, que Dña. Margarita y yo enviamos mil saludes a v. m. y a las sobrinas y sobrino y guarde Dios, como deseo. Madrid, 12 septiembre 1668. Tío y servidor de v. m., Diego Matias de Aragues. A la Sra. Dña. Juana v. m. dé ese pliego. Juzgo que los [??] de estos saldrá de aquí su hijo. Sr. Jeronimo Pelegrin de Aragues, mi sobrino.";

const text2 = "Amigo y señor mío, Los días pasados escribí a v. m. y para que no se vaya el portador de esta carta mía lo repito ahora deseoso de que v. m. me dé muchas ocasiones de su servicio que acrediten mi reconocimiento. No creerá v. m. con el sentimiento que me hallo viéndome con falta de medios para poder remitir a v. m. los ciento noventa y dos reales. V. m. se asegure que no me descuido en procurar cumplir cuanto antes con esta obligación para cuyo efecto estoy solicitando una cobranza, y luego que tuviere efecto remitiré a v. m. esta cantidad. En este correo de Madrid avisan la muerte del nuevo Presidente de Castilla, que ha sido tan acelerada que ha aturdido a todos y no faltan contemplativos que aseguran le hayan ayudado a este suceso bien aprisa a malograr la prenda. Sin embargo de este ejemplar, hay muchos codiciosos que la apetecen. El señor d. Jorge de Castellvi ha estado desahuciado de los médicos y con manifiesto peligro de la vida, pero queda ya muy convalecido que según dice parece cosa milagrosa. No se ofrece otra cosa particular de que avisar a v. m., cuya vida guarde Dios muchos años como deseo. . Valencia y mayo, a 23 de 1668. Perdóneme v. m. que la prisa con que he escrito ha ocasionado contravertir el orden de la carta. Besa las manos de v. m. su más afecto de servidor y amigo,Don Andres Garcia de Castro. Jeronimo Pelegrin de Aragues.";

function autoParagraph(text) {
    let t = text;
    // Greeting
    t = t.replace(/^(Amigo y señor mío,|Muy señor mío,|Señor mío,|Excelentísimo Señor,)\s*/i, '$1\n\n');
    
    // Sign-offs and common endings
    t = t.replace(/(Besa las manos|Guarde Dios|cuya vida guarde|Dios guarde|Quedo a la obediencia|Su más seguro servidor|Perdóneme v\. m\.)/gi, '\n\n$1');
    
    // Dates/Locations at the end
    t = t.replace(/(\. )([A-Z][a-z]+ y [a-z]+, a \d+ de \d{4}|\bMadrid, \d+|\bValencia, \d+|\bZaragoza, \d+)/g, '$1\n\n$2');
    
    let paragraphs = t.split(/\n\n+/);
    let newParagraphs = [];
    for (let p of paragraphs) {
        if (p.length > 250) {
            let sentences = p.split(/\.\s+(?=[A-Z])/);
            let currentPara = "";
            for (let i = 0; i < sentences.length; i++) {
                currentPara += sentences[i] + (i < sentences.length - 1 ? ". " : "");
                if (currentPara.length > 200 && i < sentences.length - 1) {
                    newParagraphs.push(currentPara.trim());
                    currentPara = "";
                }
            }
            if (currentPara.trim().length > 0) {
                newParagraphs.push(currentPara.trim());
            }
        } else {
            newParagraphs.push(p.trim());
        }
    }
    
    return newParagraphs.join('\n\n');
}

console.log("--- MODERN 1 ---");
console.log(autoParagraph(text1));
console.log("--- MODERN 2 ---");
console.log(autoParagraph(text2));
