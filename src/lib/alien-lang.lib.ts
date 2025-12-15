const en_chars = 'abcdefghijklmnopqrstuvwxyz123456789';
const alien_chars = '⏃⏚☊⎅⟒⎎☌⊑⟟⟊☍⌰⋔⋏⍜⌿⍾⍀⌇⏁⎍⎐⍙⌖⊬⋉123456789';

//prettier-ignore
function translate(text, reverse = false) {
  return text.split('').map(char => {
    // Find the index of the character (convert to lowercase first)
    const index = reverse? alien_chars.indexOf(char): en_chars.indexOf(char.toLowerCase());
    // If the character is found in 'oldChars', return the 'newLang' equivalent
    // Otherwise, return the original character (e.g., spaces or punctuation)
    return index > -1 ? (reverse? en_chars[index] : alien_chars[index]) : char;
  }).join('');
}