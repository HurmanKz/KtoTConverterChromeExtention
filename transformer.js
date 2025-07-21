/*
 * Filename: \centosa\piden\hurman\converter\transformer.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020
 * Author: Hurman
 * Copyright (c) 2020 Kristal Corporation.
 */
class Transformer {
  constructor() {
    // Pre-compile all regular expressions
    this.compiledPatterns = new Map();
    this.alphabetMap = new Map();
    this.quoteMap = new Map();
    
    // Initialize alphabet mapping
    this.toteAlphabetList = ["يو", "يا", "يۋ", "ا", "ا", "ب", "ۆ", "گ", "ع", "د", "ە", "ە", "ج", "ز", "ي", "ي", "ك", "ق", "ل", "م", "ن", "ڭ", "و", "و", "پ", "ر", "س", "س", "ت", "ۋ", "ۇ", "ۇ", "ف", "ح", "ھ", "چ", "ش", "ى", "ى"];
    this.kyrlAlphabetList = ["ё", "я", "ю", "а", "ә", "б", "в", "г", "ғ", "д", "е", "э", "ж", "з", "и", "й", "к", "қ", "л", "м", "н", "ң", "о", "ө", "п", "р", "с", "ц", "т", "у", "ү", "ұ", "ф", "х", "һ", "ч", "ш", "ы", "і"];
    
    // Create fast lookup maps
    this.kyrlAlphabetList.forEach((char, i) => {
      this.alphabetMap.set(char, this.toteAlphabetList[i]);
      this.compiledPatterns.set(char, new RegExp(char, 'gi'));
    });

    // Optimize quoter checks with Sets
    this.quoterSet = new Set(["ә", "ө", "і", "ү"]);
    this.unquoterSet = new Set(["г", "ғ", "е", "э", "к", "қ", "х"]);
    
    // Quote characters
    this.quote = "ء";
    
    // Optimize punctuation mapping
    this.punctuationMap = new Map([
      [",", "،"],
      ["?", "؟"],
      [";", "؛"],
      ["ь", ""],
      ["ъ", ""],
      ["ия", "я"],
      ["щ", "шш"]
    ]);

    // Main pattern for word detection
    this.pattern = /[ёяюаәбвгғдеэжзийкқлмнңоөпрсцтуүұфхһчшщыіъь]+/gi;
  }

  transformToTote(str) {
    if (!str) return str;
    
    str = str.toLowerCase();
    
    // Transform punctuation in a single pass
    for (const [kyrl, tote] of this.punctuationMap) {
      str = str.replaceAll(kyrl, tote);
    }

    // Find all matches at once
    return str.replace(this.pattern, match => this.transformSingleWord(match));
  }

  transformSingleWord(word) {
    if (!word) return word;

    let hasQuoter = false;
    
    // Check for quoter/unquoter using Sets (faster lookup)
    for (const char of word) {
      if (this.quoterSet.has(char)) {
        hasQuoter = true;
        break;
      }
    }
    
    if (hasQuoter) {
      for (const char of word) {
        if (this.unquoterSet.has(char)) {
          hasQuoter = false;
          break;
        }
      }
    }

    // Transform characters using pre-compiled patterns
    let newWord = word;
    for (const [kyrl, tote] of this.alphabetMap) {
      if (newWord.includes(kyrl)) {
        newWord = newWord.replace(this.compiledPatterns.get(kyrl), tote);
      }
    }

    return hasQuoter ? this.quote + newWord : newWord;
  }
}