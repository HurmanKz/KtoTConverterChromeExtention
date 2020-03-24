/*
 * Filename: \centosa\piden\hurman\converter\content.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020, 11:27:19 pm
 * Author: Hurman
 * Email: HurmanKz@Hotmail.com
 * Copyright (c) 2020 Kristal Corpuration.
 */
class Converter {
  constructor() {
    this.toteAlphabetList = ["يا", "يۋ", "ا", "ا", "ب", "ۆ", "گ", "ع", "د", "ە", "ە", "ج", "ز", "ي", "ي", "ك", "ق", "ل", "م", "ن", "ڭ", "و", "و", "پ", "ر", "س", "س", "ت", "ۋ", "ۇ", "ۇ", "ف", "ح", "ھ", "چ", "ش", "ى", "ى"];
    this.kyrlAlphabetList = ["я", "ю", "а", "ә", "б", "в", "г", "ғ", "д", "е", "э", "ж", "з", "и", "й", "к", "қ", "л", "м", "н", "ң", "о", "ө", "п", "р", "с", "ц", "т", "у", "ү", "ұ", "ф", "х", "һ", "ч", "ш", "ы", "і"];
    this.quoterList = ["ә", "ө", "і", "ү"];
    this.unquoterList = ["г", "ғ", "е", "э", "к", "қ", "х"];
    this.quote = "ء";
    this.KyrlQuoteList = [",", "?", ";", "ь", "ъ", "ия"];
    this.ToteQuoteList = ["،", "؟", "؛", "", "", "я"];
    this.pattern = /[яюаәбвгғдеэжзийкқлмнңоөпрсцтуүұфхһчшыі]+/ig;
  }
  convertToTote (str) {
    str = str.toLowerCase();
    this.KyrlQuoteList.forEach((q, i) => {
      if (q === "?") {
        str = str.replace(/\?/ig, this.ToteQuoteList[i]);
      } else {
        str = str.replace(new RegExp(q, "gi"), this.ToteQuoteList[i]);
      }
    });

    let matches = str.match(this.pattern);
    matches.forEach(m => {
      str = str.replace(m, this.convertSingleWord(m));
    });
    return str;
  }
  convertSingleWord(word) {
    let newWord = word;
    let hasQuoter = false;
    this.quoterList.forEach(q => {
      if (newWord.includes(q)) {
        hasQuoter = true;
      }
    });
    this.unquoterList.forEach(uq => {
      if (newWord.includes(uq)) {
        hasQuoter = false;
      }
    });
    if (newWord && newWord.length) {
      this.kyrlAlphabetList.forEach((ka, i) => {
        newWord = newWord.replace(new RegExp(ka, "gi"), this.toteAlphabetList[i]);
      });
    }
    if (hasQuoter) {
      newWord = this.quote + newWord;
    }
    return newWord;
  }
}