/**
 * Return a new array with a merged element at (indexes) in a combination of array or object of depth (indexes.length).
 * @param source            The reference array or object
 * @param newElement        The element to insert at the indexes position, to merge at the destination or replace if destination is not an object
 * @param {*[]} indexes     One or several indexes to the array dimensions. Empty array or falsy will result in immutable merging at the source.
 * @returns {*[]}
 */
export function immutableMerge(source, indexes, newElement) {
    // if there is no indexes or index is falsy, merge newElement with source into a new object
    const indexesIsArray = Array.isArray(indexes)
    if ((indexesIsArray && indexes.length === 0) || !indexes) return Object.assign({}, source, newElement)
    // if indexes is not falsy nor an array, there is probably a misuse ofthe function
    if (!indexesIsArray && indexes) throw new Error('indexes must be an array of keys describing the path of the element to me merged with newElement')

    let currentIndex = indexes[0]

    if (indexes.length > 1) {
        // call recursively and shift by 1 index to go deeper
        let innerNewElement = immutableMerge(source[currentIndex], indexes.slice(1), newElement)
        return immutableMerge(source, [currentIndex], innerNewElement)
    } else {
        // if the destination is already equal to the expected newElement, return the object without modification
        if(source[currentIndex] === newElement) return source
        // if the source is an array, do an array replacement at index. Merge newElement with destination into a new object or replace if destination is not an object.
        if (Array.isArray(source) && !isNaN(currentIndex)) {
            return [
                ...source.slice(0, currentIndex),
                isObject(source[currentIndex]) && isObject(newElement) ? Object.assign({}, source[currentIndex], newElement) : newElement, // merge or replace the modified line
                ...source.slice(currentIndex + 1)
            ]
        } else {
            let ret = Object.assign({}, source, {
                [currentIndex]: isObject(source[currentIndex]) && isObject(newElement) ? Object.assign({}, source[currentIndex], newElement) : newElement
            })
            return ret
        }
    }
}

function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function') && !Array.isArray(value);
}
