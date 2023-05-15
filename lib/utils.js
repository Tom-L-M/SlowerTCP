/**
 * Compares two strings in 'sparse' mode. Using the wildcards '{*}' and '{?}' to match strings. 
 * Use '{*}' for any number of (any) characters, and {?}' for one (any) character.
 * 
 * @since 1.2.7 
 * 
 * @param  {String} str1 The first string to compare
 * @param  {String} str2 The second string to compare
 * @return {Boolean} If the strings are sparsely equal or not
 * @example <caption> Comparing simple strings: </caption>
 * isSparseEqual("hello", "hello")
 * // => true
 * isSparseEqual("hello", "wello")
 * // => false
 * @example <caption> Comparing complex strings: </caption>
 * isSparseEqual("{?}ello", "hello")
 * // => true
 * isSparseEqual("h{*}", "hello")
 * // => true
 * isSparseEqual("h{*}e", "hello")
 * // => false
 * isSparseEqual("h{*}e", "helle")
 * // => true
*/
const isSparseEqual = (str1 = '', str2 = '') => {
    const string1 = str1.trim().replace(/{\?}/g, '.').replace(/{\*}/g, '.*');
    const string2 = str2.trim().replace(/{\?}/g, '.').replace(/{\*}/g, '.*');
    const regex = new RegExp(`^${string1}$`);
    return regex.test(string2);
}

const noop = () => {};

module.exports = { isSparseEqual, noop };